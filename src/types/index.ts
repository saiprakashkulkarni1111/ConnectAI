export type PostType = 'text' | 'question' | 'project' | 'event';

export type QuestionStatus = 'Open' | 'Answered' | 'Resolved' | 'Verified';

export type CollaborationType =
  | 'Hackathon Teammates'
  | 'Project Collaboration'
  | 'Mentorship'
  | 'Study Partners'
  | 'Open Source'
  | 'Research & Papers';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Staff / Principal';

export interface UserPreferences {
  skills: string[];
  interests: string[];
  currentProjects: string;
  learningGoals: string[];
  collaborationType: CollaborationType;
  experienceLevel: ExperienceLevel;
  availability: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  repoUrl?: string;
  status: 'Active' | 'Looking for Collaborators' | 'Shipped';
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  interests: string[];
  currentProject: string;
  learningGoals: string[];
  collaborationType: CollaborationType;
  experienceLevel: ExperienceLevel;
  availability: string;
  projects: ProjectItem[];
  joinedCommunityIds: string[];
  savedMemberIds?: string[];
  onlineStatus: 'online' | 'away' | 'offline';
  isSampleProfile: boolean;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  category: string;
  tags: string[];
  memberCount: number;
  recentActivity: string;
  weeklyPosts: number;
  bannerGradient: string;
  iconName: string;
  isJoined: boolean;
  leadModerator: {
    name: string;
    role: string;
  };
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  createdAt: string;
  isAcceptedSolution?: boolean;
  isVerifiedSolution?: boolean;
  verifiedBy?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  type: PostType;
  category: string;
  communityId: string;
  communityName: string;
  tags: string[];
  requiredSkills?: string[];
  resolutionStatus?: QuestionStatus;
  acceptedCommentId?: string;
  verifiedBy?: string;
  savedToMemoryId?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  createdAt: string;
  createdAtTimestamp: number;
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
  comments: Comment[];
  projectLink?: string;
  eventDate?: string;
}

export interface KnowledgeEntry {
  id: string;
  postId: string;
  questionTitle: string;
  problemSummary: string;
  acceptedSolution: string;
  contributorId: string;
  contributorName: string;
  contributorRole: string;
  contributorAvatar: string;
  verifiedBy?: string;
  communityId: string;
  communityName: string;
  category: string;
  tags: string[];
  technologies: string[];
  status: 'Resolved' | 'Verified';
  createdAt: string;
  createdAtTimestamp: number;
  helpfulCount: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  agenda: string[];
  date: string;
  time: string;
  format: 'Online' | 'Hybrid' | 'In-Person';
  location: string;
  category: 'Hackathon' | 'Workshop' | 'Webinar' | 'Study Session' | 'Networking';
  hostCommunityId: string;
  hostCommunityName: string;
  attendeeCount: number;
  maxCapacity: number;
  isRegistered: boolean;
  tags: string[];
  speaker: {
    name: string;
    role: string;
  };
}

export interface Connection {
  id: string;
  userId: string;
  status: 'connected' | 'pending_incoming' | 'pending_outgoing';
  connectedAt: string;
  note?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantAvatar: string;
  participantStatus: 'online' | 'away' | 'offline';
  unreadCount: number;
  lastMessageAt: string;
  messages: Message[];
}

export interface NotificationItem {
  id: string;
  type: 'reply' | 'community' | 'match' | 'event' | 'connection';
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  priority: 'High' | 'Medium' | 'Normal';
  priorityReason: string;
  actionUrl: string;
  actionLabel: string;
}

export interface MatchBreakdown {
  sharedInterests: string[];
  overlappingSkills: string[];
  complementarySkills: string[];
  goalMatch: boolean;
  collabMatch: boolean;
  scoreBreakdown: {
    interestsScore: number;
    skillsOverlapScore: number;
    complementaryScore: number;
    goalsAndCollabScore: number;
  };
}

export interface MatchResult {
  user: User;
  compatibilityScore: number;
  explanation: string;
  breakdown: MatchBreakdown;
}

export type ProblemRoleFilter =
  | 'all'
  | 'mentor'
  | 'teammate'
  | 'expert'
  | 'study_partner';

export interface ProblemMatchResult {
  user: User;
  matchScore: number;
  matchReason: string;
  matchedProblemSkills: string[];
  complementarySkills: string[];
  relevantProjects: ProjectItem[];
  matchingInterests: string[];
  recommendedRoleLabel: string;
}

export interface CopilotSource {
  id: string;
  type: 'memory' | 'post' | 'community' | 'member' | 'event';
  title: string;
  subtitle: string;
  url: string;
  snippet: string;
  status?: QuestionStatus;
  relevanceScore: number;
}

export interface CopilotCollaboratorSuggestion {
  user: User;
  reason: string;
  matchedSkills: string[];
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modeLabel?: 'On-Device AI' | 'Local Retrieval · Demo Mode';
  sources?: CopilotSource[];
  savedSolutions?: KnowledgeEntry[];
  recommendedCollaborator?: CopilotCollaboratorSuggestion;
  relatedQuestions?: string[];
}

export type MatchFilterMode =
  | 'all'
  | 'similar_interests'
  | 'complementary_skills'
  | 'project_collab'
  | 'mentorship'
  | 'study_partners'
  | 'hackathon_teammates';

export interface SearchResultItem {
  id: string;
  type: 'memory' | 'resolved_question' | 'post' | 'member' | 'community' | 'project' | 'event';
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  category: string;
  url: string;
  score: number;
  matchedTerms: string[];
  relevanceExplanation: string;
  resolutionStatus?: QuestionStatus;
}
