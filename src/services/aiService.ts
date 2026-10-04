import {
  User,
  UserPreferences,
  Community,
  Post,
  KnowledgeEntry,
  CommunityEvent,
  MatchResult,
  MatchFilterMode,
  ProblemMatchResult,
  ProblemRoleFilter,
  CopilotMessage,
  CopilotSource,
  CopilotCollaboratorSuggestion,
  SearchResultItem,
} from '../types';

export interface AIRuntimeInfo {
  isOnDeviceModelLoaded: boolean;
  operatingMode: 'On-Device AI' | 'Local Retrieval' | 'Demo Mode';
  matchmakingModeLabel: 'On-Device AI' | 'Demo Mode · Deterministic Matching';
  copilotModeLabel: 'On-Device AI' | 'Local Retrieval · Demo Mode';
  searchModeLabel: 'Local Retrieval · Keyword & Metadata Ranking';
  runtimeDescription: string;
}

export function getAIRuntimeInfo(): AIRuntimeInfo {
  // Never claim On-Device AI unless a local browser model is actually loaded and performing inference.
  return {
    isOnDeviceModelLoaded: false,
    operatingMode: 'Local Retrieval',
    matchmakingModeLabel: 'Demo Mode · Deterministic Matching',
    copilotModeLabel: 'Local Retrieval · Demo Mode',
    searchModeLabel: 'Local Retrieval · Keyword & Metadata Ranking',
    runtimeDescription:
      'Operating in Local Retrieval & Deterministic Demo Mode. Searches locally stored Community Memory, discussions, and collaborator profiles in your browser without sending queries to external servers or requiring API keys.',
  };
}

function normalize(str: string): string {
  return str.toLowerCase().trim();
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#/._-]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'what',
  'are',
  'how',
  'can',
  'you',
  'about',
  'find',
  'show',
  'tell',
  'from',
  'that',
  'this',
  'have',
  'has',
  'who',
  'working',
  'latest',
  'most',
  'useful',
  'common',
  'solutions',
  'summarize',
  'discussions',
  'people',
  'community',
  'building',
  'issues',
  'problems',
  'errors',
  'help',
  'someone',
  'when',
  'where',
  'why',
  'into',
  'without',
  'using',
]);

// Extract technical skill keywords from problem text + tags
const KNOWN_TECH_SKILLS = [
  'Python',
  'PyTorch',
  'ONNX',
  'uv',
  'Poetry',
  'Docker',
  'FastAPI',
  'React',
  'TypeScript',
  'Web Performance',
  'Firebase',
  'OAuth',
  'Cybersecurity',
  'ESP32',
  'I2C',
  'MQTT',
  'C++',
  'ROS2',
  'IoT',
  'RAG',
  'Vector Search',
  'LangGraph',
  'WebGPU',
  'IndexedDB',
  'Rust',
  'Kubernetes',
  'Polars',
  'DuckDB',
  'Computer Vision',
  'CUDA',
  'Tailwind CSS',
  'UI/UX Design',
];

export function extractProblemSkills(
  title: string,
  content: string,
  tags: string[] = [],
  explicitSkills: string[] = []
): string[] {
  const combinedText = `${title} ${content} ${tags.join(' ')}`.toLowerCase();
  const extracted = new Set<string>(explicitSkills);

  KNOWN_TECH_SKILLS.forEach((skill) => {
    if (combinedText.includes(skill.toLowerCase())) {
      extracted.add(skill);
    }
  });

  tags.forEach((t) => {
    if (t.length > 1 && !extracted.has(t)) {
      extracted.add(t);
    }
  });

  return Array.from(extracted).slice(0, 8);
}

/**
 * Problem-to-Person Matching Engine
 * Ranks collaborators based on a specific technical problem, required skills, relevant projects, and role filter.
 */
export function computeProblemToPersonMatches(
  problemInput: {
    title: string;
    description: string;
    requiredSkills: string[];
    tags?: string[];
  },
  candidates: User[],
  roleFilter: ProblemRoleFilter = 'all'
): ProblemMatchResult[] {
  const reqSkills = extractProblemSkills(
    problemInput.title,
    problemInput.description,
    problemInput.tags || [],
    problemInput.requiredSkills
  );
  const reqNormSet = new Set(reqSkills.map(normalize));
  const problemTokens = tokenize(
    `${problemInput.title} ${problemInput.description} ${reqSkills.join(' ')}`
  ).filter((t) => !STOP_WORDS.has(t));

  const results: ProblemMatchResult[] = candidates.map((candidate) => {
    // 1. Direct Required Skill Match
    const matchedProblemSkills = candidate.skills.filter((s) => {
      const sNorm = normalize(s);
      return (
        reqNormSet.has(sNorm) ||
        Array.from(reqNormSet).some(
          (r) => r.includes(sNorm) || sNorm.includes(r)
        )
      );
    });

    // 2. Relevant Projects in Candidate Portfolio
    const relevantProjects = candidate.projects.filter((proj) => {
      const projText = `${proj.title} ${proj.description} ${proj.techStack.join(' ')}`.toLowerCase();
      return (
        matchedProblemSkills.some((ms) =>
          projText.includes(ms.toLowerCase())
        ) ||
        problemTokens.some(
          (tok) => tok.length > 2 && projText.includes(tok)
        )
      );
    });

    // 3. Matching Interests
    const matchingInterests = candidate.interests.filter((interest) => {
      const iNorm = normalize(interest);
      return (
        reqNormSet.has(iNorm) ||
        problemTokens.some((tok) => iNorm.includes(tok) || tok.includes(iNorm))
      );
    });

    // 4. Complementary Skills (other strong skills the candidate brings)
    const complementarySkills = candidate.skills
      .filter((s) => !matchedProblemSkills.includes(s))
      .slice(0, 4);

    // Determine role classification label
    let recommendedRoleLabel = 'Technical Collaborator';
    if (
      candidate.collaborationType === 'Mentorship' ||
      candidate.experienceLevel === 'Staff / Principal'
    ) {
      recommendedRoleLabel = 'Mentor & Architecture Reviewer';
    } else if (candidate.collaborationType === 'Hackathon Teammates') {
      recommendedRoleLabel = 'Hackathon Teammate';
    } else if (candidate.collaborationType === 'Study Partners') {
      recommendedRoleLabel = 'Study & Debugging Partner';
    } else if (matchedProblemSkills.length >= 2) {
      recommendedRoleLabel = 'Domain Technical Expert';
    }

    // Deterministic score (0–99) based on transparent criteria
    const skillPoints = Math.min(55, matchedProblemSkills.length * 16);
    const projectPoints = Math.min(22, relevantProjects.length * 14);
    const interestPoints = Math.min(15, matchingInterests.length * 7);
    const basePoints = 10;
    const matchScore = Math.min(
      98,
      skillPoints + projectPoints + interestPoints + basePoints
    );

    const reasonParts: string[] = [];
    if (matchedProblemSkills.length > 0) {
      reasonParts.push(
        `Direct expertise in ${matchedProblemSkills.join(', ')}`
      );
    }
    if (relevantProjects.length > 0) {
      reasonParts.push(
        `Built "${relevantProjects[0].title}" (${relevantProjects[0].techStack.slice(0, 3).join(', ')})`
      );
    }
    if (matchingInterests.length > 0) {
      reasonParts.push(
        `Active in ${matchingInterests.slice(0, 2).join(' & ')}`
      );
    }

    const matchReason =
      reasonParts.length > 0
        ? `${reasonParts.join(' · ')}. Available ${candidate.availability}.`
        : `Brings complementary engineering skills in ${candidate.skills.slice(0, 3).join(', ')}.`;

    return {
      user: candidate,
      matchScore,
      matchReason,
      matchedProblemSkills,
      complementarySkills,
      relevantProjects,
      matchingInterests,
      recommendedRoleLabel,
    };
  });

  // Apply Role Filter
  const filtered = results.filter((item) => {
    switch (roleFilter) {
      case 'mentor':
        return (
          item.user.collaborationType === 'Mentorship' ||
          item.user.experienceLevel === 'Staff / Principal'
        );
      case 'teammate':
        return (
          item.user.collaborationType === 'Hackathon Teammates' ||
          item.user.collaborationType === 'Project Collaboration'
        );
      case 'expert':
        return (
          item.matchedProblemSkills.length >= 2 ||
          item.user.experienceLevel === 'Advanced' ||
          item.user.experienceLevel === 'Staff / Principal'
        );
      case 'study_partner':
        return (
          item.user.collaborationType === 'Study Partners' ||
          item.user.interests.some((i) => i.toLowerCase().includes('study'))
        );
      default:
        return true;
    }
  });

  return filtered.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * General Profile-to-Profile Matchmaking Engine
 */
export function computeMatchmakingResults(
  preferences: UserPreferences,
  candidates: User[],
  filterMode: MatchFilterMode = 'all'
): MatchResult[] {
  const userSkills = new Set(preferences.skills.map(normalize));
  const userInterests = new Set(preferences.interests.map(normalize));
  const userGoalsText = preferences.learningGoals.join(' ').toLowerCase();
  const userProjectTokens = new Set(tokenize(preferences.currentProjects));

  const results: MatchResult[] = candidates.map((candidate) => {
    const sharedInterests = candidate.interests.filter((i) =>
      userInterests.has(normalize(i))
    );

    const overlappingSkills = candidate.skills.filter((s) =>
      userSkills.has(normalize(s))
    );

    const complementarySkills = candidate.skills.filter((s) => {
      const norm = normalize(s);
      if (userSkills.has(norm)) return false;
      const matchesGoal =
        userGoalsText.includes(norm) ||
        preferences.learningGoals.some((g) => normalize(g).includes(norm));
      const highValueComplement = [
        'rust',
        'cuda',
        'esp32',
        'i2c',
        'ui/ux design',
        'cybersecurity',
        'firebase',
        'onnx',
        'uv',
      ].includes(norm);
      return matchesGoal || highValueComplement;
    });

    const candidateTokens = tokenize(
      `${candidate.currentProject} ${candidate.headline} ${candidate.learningGoals.join(' ')}`
    );
    let projectOverlapCount = 0;
    candidateTokens.forEach((t) => {
      if (!STOP_WORDS.has(t) && userProjectTokens.has(t)) {
        projectOverlapCount++;
      }
    });

    const goalMatch =
      complementarySkills.some((s) => userGoalsText.includes(normalize(s))) ||
      projectOverlapCount >= 2;

    const collabMatch =
      normalize(candidate.collaborationType) ===
      normalize(preferences.collaborationType);

    const interestsScore = Math.min(30, sharedInterests.length * 10);
    const skillsOverlapScore = Math.min(25, overlappingSkills.length * 7);
    const complementaryScore = Math.min(25, complementarySkills.length * 9);
    const goalsAndCollabScore = Math.min(
      20,
      (collabMatch ? 10 : 4) + (goalMatch ? 7 : 2) + Math.min(3, projectOverlapCount)
    );

    const totalScore =
      interestsScore +
      skillsOverlapScore +
      complementaryScore +
      goalsAndCollabScore;

    const compatibilityScore = Math.max(54, Math.min(98, totalScore));

    const reasons: string[] = [];
    if (sharedInterests.length > 0) {
      reasons.push(
        `Shares ${sharedInterests.length} interest${sharedInterests.length > 1 ? 's' : ''} (${sharedInterests.slice(0, 3).join(', ')})`
      );
    }
    if (complementarySkills.length > 0) {
      reasons.push(
        `Complementary skills in ${complementarySkills.slice(0, 3).join(', ')}`
      );
    }
    if (overlappingSkills.length > 0) {
      reasons.push(
        `Overlaps on ${overlappingSkills.slice(0, 3).join(', ')}`
      );
    }

    const explanation =
      reasons.length > 0
        ? `${reasons.join(' · ')}. Building: ${candidate.currentProject.split(':')[0]}.`
        : `Active builder in ${candidate.interests.slice(0, 2).join(' & ')}.`;

    return {
      user: candidate,
      compatibilityScore,
      explanation,
      breakdown: {
        sharedInterests,
        overlappingSkills,
        complementarySkills,
        goalMatch,
        collabMatch,
        scoreBreakdown: {
          interestsScore,
          skillsOverlapScore,
          complementaryScore,
          goalsAndCollabScore,
        },
      },
    };
  });

  const filtered = results.filter((item) => {
    switch (filterMode) {
      case 'similar_interests':
        return item.breakdown.sharedInterests.length >= 2;
      case 'complementary_skills':
        return item.breakdown.complementarySkills.length >= 1;
      case 'project_collab':
        return item.user.collaborationType === 'Project Collaboration';
      case 'mentorship':
        return (
          item.user.collaborationType === 'Mentorship' ||
          item.user.experienceLevel === 'Staff / Principal'
        );
      case 'study_partners':
        return item.user.collaborationType === 'Study Partners';
      case 'hackathon_teammates':
        return item.user.collaborationType === 'Hackathon Teammates';
      default:
        return true;
    }
  });

  return filtered.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

export interface CommunityRecommendation {
  community: Community;
  reason: string;
  matchScore: number;
}

export function getRecommendedCommunities(
  preferences: UserPreferences,
  communities: Community[]
): CommunityRecommendation[] {
  const userTerms = new Set(
    [...preferences.skills, ...preferences.interests, ...preferences.learningGoals].map(
      normalize
    )
  );

  return communities
    .map((comm) => {
      const matchedTags = comm.tags.filter((t) => {
        const normTag = normalize(t);
        return (
          userTerms.has(normTag) ||
          Array.from(userTerms).some(
            (ut) => ut.includes(normTag) || normTag.includes(ut)
          )
        );
      });

      const matchScore = Math.min(98, 60 + matchedTags.length * 11);
      const reason =
        matchedTags.length > 0
          ? `Recommended for your profile tags: ${matchedTags.join(', ')}`
          : `Recommended for cross-functional discussions in ${comm.category}`;

      return {
        community: comm,
        reason,
        matchScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Automatically identifies candidate questions and useful answers from existing posts
 * that can be converted into Community Memory entries.
 */
export function identifyCandidateKnowledgePosts(
  posts: Post[],
  knowledgeEntries: KnowledgeEntry[]
): Post[] {
  const savedPostIds = new Set(knowledgeEntries.map((k) => k.postId));
  return posts.filter(
    (p) =>
      !savedPostIds.has(p.id) &&
      (p.type === 'question' || p.comments.length > 0) &&
      p.comments.some((c) => c.content.length > 60)
  );
}

/**
 * Find related posts and saved solutions for a specific Problem Workspace
 */
export function getWorkspaceRelatedRecords(
  currentPost: Post,
  allPosts: Post[],
  knowledgeEntries: KnowledgeEntry[]
): {
  relatedMemories: KnowledgeEntry[];
  relatedPosts: Post[];
} {
  const postTokens = new Set(
    tokenize(
      `${currentPost.title} ${currentPost.category} ${currentPost.tags.join(' ')}`
    ).filter((t) => !STOP_WORDS.has(t))
  );

  const relatedMemories = knowledgeEntries
    .map((mem) => {
      let score = mem.postId === currentPost.id ? 100 : 0;
      const memTokens = tokenize(
        `${mem.questionTitle} ${mem.category} ${mem.tags.join(' ')} ${mem.technologies.join(' ')}`
      );
      memTokens.forEach((t) => {
        if (postTokens.has(t)) score += 6;
      });
      return { mem, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.mem);

  const relatedPosts = allPosts
    .filter((p) => p.id !== currentPost.id)
    .map((p) => {
      let score = p.communityId === currentPost.communityId ? 4 : 0;
      const pTokens = tokenize(`${p.title} ${p.category} ${p.tags.join(' ')}`);
      pTokens.forEach((t) => {
        if (postTokens.has(t)) score += 5;
      });
      return { p, score };
    })
    .filter((x) => x.score >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p);

  return { relatedMemories, relatedPosts };
}

/**
 * Evidence-First Community Copilot
 * Searches actual Community Memory entries, community posts, and profiles,
 * ranks results, synthesizes a grounded answer, links sources, and recommends a collaborator.
 */
export function queryCommunityCopilot(
  query: string,
  posts: Post[],
  communities: Community[],
  members: User[],
  events: CommunityEvent[],
  knowledgeEntries: KnowledgeEntry[] = []
): Omit<CopilotMessage, 'id' | 'timestamp'> {
  const qLower = query.toLowerCase().trim();
  const queryTokens = tokenize(query).filter((t) => !STOP_WORDS.has(t));

  // 1. Score Verified/Resolved Community Memory Entries FIRST
  const scoredMemories = knowledgeEntries
    .map((mem) => {
      const haystack = `${mem.questionTitle} ${mem.problemSummary} ${mem.acceptedSolution} ${mem.category} ${mem.tags.join(' ')} ${mem.technologies.join(' ')} ${mem.contributorName}`.toLowerCase();
      let score = 0;
      queryTokens.forEach((token) => {
        if (mem.questionTitle.toLowerCase().includes(token)) score += 7;
        if (mem.tags.some((t) => t.toLowerCase().includes(token))) score += 6;
        if (mem.technologies.some((t) => t.toLowerCase().includes(token)))
          score += 5;
        if (mem.category.toLowerCase().includes(token)) score += 5;
        if (haystack.includes(token)) score += 3;
      });
      return { mem, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // 2. Score Community Posts (boosting Verified & Resolved questions)
  const scoredPosts = posts
    .map((post) => {
      const commentsText = post.comments.map((c) => c.content).join(' ');
      const haystack = `${post.title} ${post.content} ${commentsText} ${post.category} ${post.tags.join(' ')} ${post.communityName}`.toLowerCase();
      let score = 0;
      queryTokens.forEach((token) => {
        if (post.title.toLowerCase().includes(token)) score += 6;
        if (post.tags.some((t) => t.toLowerCase().includes(token))) score += 5;
        if (post.category.toLowerCase().includes(token)) score += 4;
        if (haystack.includes(token)) score += 2;
      });
      if (score > 0) {
        if (post.resolutionStatus === 'Verified') score += 5;
        else if (post.resolutionStatus === 'Resolved') score += 4;
        else if (post.resolutionStatus === 'Answered') score += 2;
      }
      return { post, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // 3. Find Top Collaborator Recommendation for this problem/query
  const problemMatches = computeProblemToPersonMatches(
    {
      title: query,
      description: query,
      requiredSkills: queryTokens,
    },
    members,
    'all'
  );
  const topCollaborator =
    problemMatches.length > 0 && problemMatches[0].matchedProblemSkills.length > 0
      ? problemMatches[0]
      : undefined;

  const sources: CopilotSource[] = [];

  scoredMemories.slice(0, 2).forEach(({ mem, score }) => {
    sources.push({
      id: mem.id,
      type: 'memory',
      title: `[Community Memory · ${mem.status}] ${mem.questionTitle}`,
      subtitle: `Solution by ${mem.contributorName} · ${mem.communityName}`,
      url: `/workspace/${mem.postId}`,
      snippet: mem.acceptedSolution.slice(0, 160) + '...',
      status: mem.status,
      relevanceScore: Math.min(99, 78 + score * 2),
    });
  });

  scoredPosts.slice(0, 3).forEach(({ post, score }) => {
    if (sources.some((s) => s.url === `/workspace/${post.id}`)) return;
    sources.push({
      id: post.id,
      type: 'post',
      title: post.title,
      subtitle: `${post.resolutionStatus || 'Discussion'} · ${post.authorName} in ${post.communityName}`,
      url: `/workspace/${post.id}`,
      snippet: post.content.slice(0, 150) + '...',
      status: post.resolutionStatus,
      relevanceScore: Math.min(97, 68 + score * 2),
    });
  });

  // Explicit No-Results state when no reliable supporting evidence exists
  if (
    scoredMemories.length === 0 &&
    scoredPosts.length === 0 &&
    !topCollaborator
  ) {
    return {
      role: 'assistant',
      modeLabel: 'Local Retrieval · Demo Mode',
      content: `**No reliable supporting information found in local Community Memory or discussions for "${query}".**\n\nConnectAI's Evidence-First Copilot never fabricates technical solutions or citations. Try querying one of the documented technical problem domains in this prototype:\n• **Python dependency conflicts** (\`torch\`, \`onnxruntime-gpu\`, \`numpy<2.0\`, \`uv\`)\n• **Deploying machine learning models** (FastAPI + quantized ONNX cold-start & RAM tuning)\n• **React performance problems** (\`requestAnimationFrame\` streaming buffer)\n• **Firebase authentication errors** (\`auth/unauthorized-domain\` & COOP popup headers)\n• **ESP32 sensor integration** (I2C bus lockup recovery & ADC1 vs ADC2 with Wi-Fi)\n• **RAG implementation and vector search** (Hybrid BM25 + AST parent-child chunking)`,
      sources: [],
      savedSolutions: [],
      relatedQuestions: [
        'How to resolve Python dependency conflicts with PyTorch and ONNX?',
        'How do we fix FastAPI + PyTorch container OOM kills when deploying ML models?',
        'What are the verified solutions to React streaming performance issues?',
        'How to fix ESP32 I2C bus lockup and ADC2 Wi-Fi conflicts?',
      ],
    };
  }

  // Build concise, evidence-first answer strictly from retrieved records
  const lines: string[] = [];

  if (scoredMemories.length > 0) {
    const topMem = scoredMemories[0].mem;
    lines.push(
      `**Verified Solution Found in Community Memory** (*${topMem.category} · Contributed by ${topMem.contributorName}*):`
    );
    lines.push(topMem.acceptedSolution);
  } else if (scoredPosts.length > 0) {
    const topPost = scoredPosts[0].post;
    const bestComment =
      topPost.comments.find((c) => c.isAcceptedSolution) || topPost.comments[0];
    if (bestComment) {
      lines.push(
        `**Retrieved Answer from Community Discussion** (*"${topPost.title}" — answered by ${bestComment.authorName}*):`
      );
      lines.push(bestComment.content);
    } else {
      lines.push(
        `**Active Community Question Found** (*${topPost.resolutionStatus || 'Open'} in ${topPost.communityName}*):`
      );
      lines.push(
        `“${topPost.title}” — ${topPost.content.slice(0, 260)}...`
      );
    }
  }

  const collaboratorSuggestion: CopilotCollaboratorSuggestion | undefined =
    topCollaborator
      ? {
          user: topCollaborator.user,
          reason: topCollaborator.matchReason,
          matchedSkills: topCollaborator.matchedProblemSkills,
        }
      : undefined;

  return {
    role: 'assistant',
    modeLabel: 'Local Retrieval · Demo Mode',
    content: lines.join('\n\n'),
    sources: sources.slice(0, 4),
    savedSolutions: scoredMemories.slice(0, 2).map((m) => m.mem),
    recommendedCollaborator: collaboratorSuggestion,
    relatedQuestions: [
      'How to resolve Python dependency conflicts with PyTorch and ONNX?',
      'How do we fix FastAPI + PyTorch container OOM kills when deploying ML models?',
      'How to fix Firebase authentication popup errors in preview environments?',
      'How to fix ESP32 I2C bus lockup and ADC2 Wi-Fi conflicts?',
      'How to prevent hallucinated citations in RAG vector search?',
    ]
      .filter((q) => q.toLowerCase() !== qLower)
      .slice(0, 3),
  };
}

/**
 * Upgraded Global Search prioritizing:
 * 1. Verified Solutions (Community Memory)
 * 2. Resolved / Answered Questions
 * 3. Relevant Technical Discussions
 * 4. Potential Collaborators
 * 5. Communities & Projects
 */
export function performSemanticSearch(
  query: string,
  typeFilter:
    | 'all'
    | 'memory'
    | 'resolved_question'
    | 'post'
    | 'member'
    | 'community'
    | 'project',
  posts: Post[],
  members: User[],
  communities: Community[],
  events: CommunityEvent[],
  knowledgeEntries: KnowledgeEntry[] = []
): SearchResultItem[] {
  const qTrimmed = query.trim();
  if (!qTrimmed) return [];

  const qLower = qTrimmed.toLowerCase();
  const tokens = tokenize(qTrimmed).filter((t) => !STOP_WORDS.has(t));

  const results: SearchResultItem[] = [];

  const scoreRecord = (
    title: string,
    body: string,
    tags: string[],
    category: string
  ): { score: number; matchedTerms: string[] } => {
    const titleLower = title.toLowerCase();
    const bodyLower = body.toLowerCase();
    const catLower = category.toLowerCase();
    const tagsLower = tags.map((t) => t.toLowerCase());

    let score = 0;
    const matched = new Set<string>();

    if (titleLower.includes(qLower)) {
      score += 24;
      matched.add(qTrimmed);
    }
    if (bodyLower.includes(qLower)) {
      score += 12;
      matched.add(qTrimmed);
    }

    tokens.forEach((tok) => {
      if (tok.length < 2) return;
      if (titleLower.includes(tok)) {
        score += 12;
        matched.add(tok);
      }
      if (tagsLower.some((t) => t.includes(tok))) {
        score += 10;
        matched.add(tok);
      }
      if (catLower.includes(tok)) {
        score += 8;
        matched.add(tok);
      }
      if (bodyLower.includes(tok)) {
        score += 5;
        matched.add(tok);
      }
    });

    return { score, matchedTerms: Array.from(matched) };
  };

  // 1. Search Community Memory (Highest Priority Boost +30)
  if (typeFilter === 'all' || typeFilter === 'memory') {
    knowledgeEntries.forEach((mem) => {
      const { score, matchedTerms } = scoreRecord(
        mem.questionTitle,
        `${mem.problemSummary} ${mem.acceptedSolution} ${mem.contributorName}`,
        [...mem.tags, ...mem.technologies],
        mem.category
      );
      if (score > 0) {
        const prioritizedScore = score + 30;
        results.push({
          id: mem.id,
          type: 'memory',
          title: mem.questionTitle,
          subtitle: `Community Memory (${mem.status}) · Solution by ${mem.contributorName} · ${mem.communityName}`,
          description: mem.acceptedSolution,
          tags: [...mem.tags, ...mem.technologies.slice(0, 2)],
          category: mem.category,
          url: `/workspace/${mem.postId}`,
          score: prioritizedScore,
          matchedTerms,
          relevanceExplanation: `Prioritized #1 (Verified Community Memory) · Matched terms: ${matchedTerms.join(', ')}`,
          resolutionStatus: mem.status,
        });
      }
    });
  }

  // 2. Search Questions & Discussions (Boost Resolved/Verified questions +18)
  if (
    typeFilter === 'all' ||
    typeFilter === 'resolved_question' ||
    typeFilter === 'post' ||
    typeFilter === 'project'
  ) {
    posts.forEach((post) => {
      const isResolvedOrVerified =
        post.resolutionStatus === 'Verified' ||
        post.resolutionStatus === 'Resolved';
      if (typeFilter === 'resolved_question' && !isResolvedOrVerified) return;
      if (typeFilter === 'project' && post.type !== 'project') return;

      const commentsText = post.comments.map((c) => c.content).join(' ');
      const { score, matchedTerms } = scoreRecord(
        post.title,
        `${post.content} ${commentsText} ${post.authorName}`,
        post.tags,
        post.category
      );

      if (score > 0) {
        const statusBoost =
          post.resolutionStatus === 'Verified'
            ? 18
            : post.resolutionStatus === 'Resolved'
            ? 14
            : post.resolutionStatus === 'Answered'
            ? 8
            : 0;
        results.push({
          id: post.id,
          type: isResolvedOrVerified
            ? 'resolved_question'
            : post.type === 'project'
            ? 'project'
            : 'post',
          title: post.title,
          subtitle: `${post.authorName} · ${post.communityName} · ${post.createdAt}`,
          description:
            post.content.slice(0, 180) + (post.content.length > 180 ? '...' : ''),
          tags: post.tags,
          category: post.category,
          url: `/workspace/${post.id}`,
          score: score + statusBoost,
          matchedTerms,
          relevanceExplanation: `${
            post.resolutionStatus
              ? `${post.resolutionStatus} Question`
              : 'Technical Discussion'
          } · Matched terms: ${matchedTerms.join(', ')}`,
          resolutionStatus: post.resolutionStatus,
        });
      }
    });
  }

  // 3. Search Potential Collaborators
  if (typeFilter === 'all' || typeFilter === 'member') {
    members.forEach((m) => {
      const { score, matchedTerms } = scoreRecord(
        `${m.name} — ${m.role}`,
        `${m.headline} ${m.bio} ${m.currentProject}`,
        [...m.skills, ...m.interests],
        m.collaborationType
      );
      if (score > 0) {
        results.push({
          id: m.id,
          type: 'member',
          title: `${m.name} (${m.role})`,
          subtitle: `Collaborator · ${m.collaborationType} · ${m.location}`,
          description: `${m.headline} Building: ${m.currentProject}`,
          tags: m.skills.slice(0, 5),
          category: m.collaborationType,
          url: `/matchmaking?member=${m.id}`,
          score: score + 5,
          matchedTerms,
          relevanceExplanation: `Collaborator matched on skills/domain: ${matchedTerms.join(', ')}`,
        });
      }
    });
  }

  // 4. Search Communities
  if (typeFilter === 'all' || typeFilter === 'community') {
    communities.forEach((c) => {
      const { score, matchedTerms } = scoreRecord(
        c.name,
        `${c.description} ${c.longDescription}`,
        c.tags,
        c.category
      );
      if (score > 0) {
        results.push({
          id: c.id,
          type: 'community',
          title: c.name,
          subtitle: `${c.memberCount.toLocaleString()} members · ${c.category}`,
          description: c.description,
          tags: c.tags,
          category: c.category,
          url: `/communities/${c.id}`,
          score,
          matchedTerms,
          relevanceExplanation: `Community Hub · Matched tags: ${matchedTerms.join(', ')}`,
        });
      }
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
