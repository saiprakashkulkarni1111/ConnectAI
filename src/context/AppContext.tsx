import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserPreferences,
  Community,
  Post,
  KnowledgeEntry,
  CommunityEvent,
  Connection,
  Conversation,
  NotificationItem,
  CopilotMessage,
  PostType,
  QuestionStatus,
} from '../types';
import {
  INITIAL_CURRENT_USER,
  INITIAL_SAMPLE_MEMBERS,
  INITIAL_COMMUNITIES,
  INITIAL_POSTS,
  INITIAL_KNOWLEDGE_ENTRIES,
  INITIAL_EVENTS,
  INITIAL_CONNECTIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData';
import { queryCommunityCopilot, extractProblemSkills } from '../services/aiService';

const STORAGE_KEY = 'connectai_hackathon_prototype_v2';

interface StoredState {
  currentUser: User;
  preferences: UserPreferences;
  members: User[];
  communities: Community[];
  posts: Post[];
  knowledgeEntries: KnowledgeEntry[];
  events: CommunityEvent[];
  connections: Connection[];
  conversations: Conversation[];
  notifications: NotificationItem[];
  searchHistory: string[];
  hasCompletedOnboarding: boolean;
  theme: 'dark' | 'light';
}

interface AppContextType extends StoredState {
  // Onboarding & Demo actions
  completeOnboarding: (data: {
    name: string;
    role: string;
    interests: string[];
    skills: string[];
    collaborationType: UserPreferences['collaborationType'];
  }) => void;
  skipOnboardingForDemo: () => void;
  openOnboardingModal: () => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  resetDemoData: () => void;
  clearAllLocalData: () => void;

  // Theme & Judge Guide
  toggleTheme: () => void;
  isJudgeGuideOpen: boolean;
  setIsJudgeGuideOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  initialSearchQuery: string;
  openGlobalSearchWithQuery: (q?: string) => void;

  // Feed, Question Lifecycle & Community Memory actions
  createPost: (input: {
    title: string;
    content: string;
    type: PostType;
    category: string;
    communityId: string;
    tags: string[];
    requiredSkills?: string[];
    projectLink?: string;
  }) => string;
  toggleLikePost: (postId: string) => void;
  toggleBookmarkPost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  markQuestionResolved: (postId: string, acceptedCommentId?: string) => void;
  markSolutionVerified: (postId: string, commentId?: string) => void;
  savePostToCommunityMemory: (
    postId: string,
    customSummary?: string,
    customSolution?: string
  ) => KnowledgeEntry | null;
  upvoteKnowledgeEntry: (memoryId: string) => void;

  // Community actions
  toggleJoinCommunity: (communityId: string) => void;

  // Matchmaking & Connections
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  toggleSaveMember: (memberId: string) => void;
  sendConnectionRequest: (memberId: string, note?: string) => void;
  acceptConnectionRequest: (connectionId: string) => void;
  rejectConnectionRequest: (connectionId: string) => void;

  // Events
  toggleEventRegistration: (eventId: string) => void;
  createEvent: (input: {
    title: string;
    description: string;
    date: string;
    time: string;
    format: CommunityEvent['format'];
    location: string;
    category: CommunityEvent['category'];
    hostCommunityId: string;
    tags: string[];
  }) => void;

  // Messaging
  sendMessage: (conversationId: string, text: string) => void;
  startOrOpenConversation: (memberId: string) => string;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Search & Copilot
  addSearchQueryToHistory: (q: string) => void;
  clearSearchHistory: () => void;
  copilotMessages: CopilotMessage[];
  sendCopilotQuery: (query: string) => void;
  clearCopilotHistory: () => void;

  // Toast feedback
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const defaultPreferences: UserPreferences = {
  skills: INITIAL_CURRENT_USER.skills,
  interests: INITIAL_CURRENT_USER.interests,
  currentProjects: INITIAL_CURRENT_USER.currentProject,
  learningGoals: INITIAL_CURRENT_USER.learningGoals,
  collaborationType: INITIAL_CURRENT_USER.collaborationType,
  experienceLevel: INITIAL_CURRENT_USER.experienceLevel,
  availability: INITIAL_CURRENT_USER.availability,
};

function getInitialState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.currentUser &&
        Array.isArray(parsed.posts) &&
        Array.isArray(parsed.knowledgeEntries) &&
        Array.isArray(parsed.communities) &&
        Array.isArray(parsed.members)
      ) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse local prototype state, seeding fresh defaults.', err);
  }

  return {
    currentUser: INITIAL_CURRENT_USER,
    preferences: defaultPreferences,
    members: INITIAL_SAMPLE_MEMBERS,
    communities: INITIAL_COMMUNITIES,
    posts: INITIAL_POSTS,
    knowledgeEntries: INITIAL_KNOWLEDGE_ENTRIES,
    events: INITIAL_EVENTS,
    connections: INITIAL_CONNECTIONS,
    conversations: INITIAL_CONVERSATIONS,
    notifications: INITIAL_NOTIFICATIONS,
    searchHistory: [
      'Python dependency conflicts',
      'React performance',
      'Deploying ML models',
      'Firebase authentication',
      'ESP32 sensor integration',
      'RAG vector search',
    ],
    hasCompletedOnboarding: true,
    theme: 'dark',
  };
}

const INITIAL_COPILOT_WELCOME: CopilotMessage = {
  id: 'cop-welcome',
  role: 'assistant',
  modeLabel: 'Local Retrieval · Demo Mode',
  content:
    'Hello! I am **Community Copilot**, ConnectAI’s evidence-first knowledge assistant.\n\nWhen you ask a technical question, I search **Verified Solutions in Community Memory**, **Resolved Community Questions**, and **Collaborator Profiles** stored locally in your browser. Every answer includes clickable source links and recommends a relevant collaborator when appropriate.',
  timestamp: 'Ready',
  relatedQuestions: [
    'How to resolve Python dependency conflicts with PyTorch and ONNX?',
    'How do we fix FastAPI + PyTorch container OOM kills when deploying ML models?',
    'What are the verified solutions to React streaming performance issues?',
    'How to fix Firebase authentication popup errors in preview environments?',
    'How to fix ESP32 I2C bus lockup and ADC2 Wi-Fi conflicts?',
  ],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StoredState>(getInitialState);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isJudgeGuideOpen, setIsJudgeGuideOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [initialSearchQuery, setInitialSearchQuery] = useState<string>('');
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    INITIAL_COPILOT_WELCOME,
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Could not persist state to localStorage:', err);
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [state.theme]);

  const toggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const openGlobalSearchWithQuery = (q = '') => {
    setInitialSearchQuery(q);
    setIsSearchModalOpen(true);
  };

  const completeOnboarding = (data: {
    name: string;
    role: string;
    interests: string[];
    skills: string[];
    collaborationType: UserPreferences['collaborationType'];
  }) => {
    setState((prev) => {
      const updatedUser: User = {
        ...prev.currentUser,
        name: data.name.trim() || prev.currentUser.name,
        role: data.role.trim() || prev.currentUser.role,
        interests: data.interests.length > 0 ? data.interests : prev.currentUser.interests,
        skills: data.skills.length > 0 ? data.skills : prev.currentUser.skills,
        collaborationType: data.collaborationType,
      };
      const updatedPrefs: UserPreferences = {
        ...prev.preferences,
        interests: updatedUser.interests,
        skills: updatedUser.skills,
        collaborationType: data.collaborationType,
      };
      return {
        ...prev,
        currentUser: updatedUser,
        preferences: updatedPrefs,
        hasCompletedOnboarding: true,
      };
    });
    setIsOnboardingOpen(false);
    showToast('Profile preferences saved! Problem matching & feed updated.');
  };

  const skipOnboardingForDemo = () => {
    setState((prev) => ({
      ...prev,
      hasCompletedOnboarding: true,
    }));
    setIsOnboardingOpen(false);
    showToast('Loaded prepared Demo Account (Aarav Mehta).');
  };

  const openOnboardingModal = () => {
    setIsOnboardingOpen(true);
  };

  const resetDemoData = () => {
    const fresh: StoredState = {
      currentUser: INITIAL_CURRENT_USER,
      preferences: defaultPreferences,
      members: INITIAL_SAMPLE_MEMBERS,
      communities: INITIAL_COMMUNITIES,
      posts: INITIAL_POSTS,
      knowledgeEntries: INITIAL_KNOWLEDGE_ENTRIES,
      events: INITIAL_EVENTS,
      connections: INITIAL_CONNECTIONS,
      conversations: INITIAL_CONVERSATIONS,
      notifications: INITIAL_NOTIFICATIONS,
      searchHistory: [
        'Python dependency conflicts',
        'React performance',
        'Deploying ML models',
        'Firebase authentication',
        'ESP32 sensor integration',
        'RAG vector search',
      ],
      hasCompletedOnboarding: true,
      theme: state.theme,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setState(fresh);
    setCopilotMessages([INITIAL_COPILOT_WELCOME]);
    showToast('Demo data reset to initial hackathon seed state.');
  };

  const clearAllLocalData = () => {
    localStorage.removeItem(STORAGE_KEY);
    const fresh: StoredState = {
      currentUser: INITIAL_CURRENT_USER,
      preferences: defaultPreferences,
      members: INITIAL_SAMPLE_MEMBERS,
      communities: INITIAL_COMMUNITIES,
      posts: INITIAL_POSTS,
      knowledgeEntries: INITIAL_KNOWLEDGE_ENTRIES,
      events: INITIAL_EVENTS,
      connections: INITIAL_CONNECTIONS,
      conversations: INITIAL_CONVERSATIONS,
      notifications: INITIAL_NOTIFICATIONS,
      searchHistory: [],
      hasCompletedOnboarding: false,
      theme: 'dark',
    };
    setState(fresh);
    setCopilotMessages([INITIAL_COPILOT_WELCOME]);
    showToast('Cleared all local storage data and reset state.');
  };

  const createPost = (input: {
    title: string;
    content: string;
    type: PostType;
    category: string;
    communityId: string;
    tags: string[];
    requiredSkills?: string[];
    projectLink?: string;
  }): string => {
    const comm =
      state.communities.find((c) => c.id === input.communityId) ||
      state.communities[0];

    const newPostId = `post-${Date.now()}`;
    const tags = input.tags.length > 0 ? input.tags : ['Community', input.category];
    const reqSkills =
      input.requiredSkills && input.requiredSkills.length > 0
        ? input.requiredSkills
        : extractProblemSkills(input.title, input.content, tags);

    const newPost: Post = {
      id: newPostId,
      title: input.title.trim(),
      content: input.content.trim(),
      type: input.type,
      category: input.category || comm.category,
      communityId: comm.id,
      communityName: comm.name,
      tags,
      requiredSkills: reqSkills,
      resolutionStatus: input.type === 'question' ? 'Open' : undefined,
      authorId: state.currentUser.id,
      authorName: state.currentUser.name,
      authorAvatar: state.currentUser.avatar,
      authorRole: state.currentUser.role,
      createdAt: 'Just now',
      createdAtTimestamp: Date.now(),
      likes: 1,
      isLiked: true,
      isBookmarked: false,
      comments: [],
      projectLink: input.projectLink,
    };

    setState((prev) => ({
      ...prev,
      posts: [newPost, ...prev.posts],
    }));
    showToast(
      input.type === 'question'
        ? `Opened technical question in ${comm.name}!`
        : `Published post to ${comm.name}!`
    );
    return newPostId;
  };

  const toggleLikePost = (postId: string) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !p.isLiked;
        return {
          ...p,
          isLiked: nextLiked,
          likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      }),
    }));
  };

  const toggleBookmarkPost = (postId: string) => {
    let bookmarkedState = false;
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) => {
        if (p.id !== postId) return p;
        bookmarkedState = !p.isBookmarked;
        return {
          ...p,
          isBookmarked: bookmarkedState,
        };
      }),
    }));
    showToast(bookmarkedState ? 'Saved post to Bookmarks.' : 'Removed from Bookmarks.');
  };

  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) => {
        if (p.id !== postId) return p;
        const nextStatus: QuestionStatus | undefined =
          p.type === 'question' && (!p.resolutionStatus || p.resolutionStatus === 'Open')
            ? 'Answered'
            : p.resolutionStatus;
        return {
          ...p,
          resolutionStatus: nextStatus,
          comments: [
            ...p.comments,
            {
              id: `c-${Date.now()}`,
              postId,
              authorId: prev.currentUser.id,
              authorName: prev.currentUser.name,
              authorAvatar: prev.currentUser.avatar,
              authorRole: prev.currentUser.role,
              content: content.trim(),
              createdAt: 'Just now',
            },
          ],
        };
      }),
    }));
    showToast('Answer / comment added to discussion.');
  };

  const markQuestionResolved = (postId: string, acceptedCommentId?: string) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) => {
        if (p.id !== postId) return p;
        const targetCommentId =
          acceptedCommentId || p.acceptedCommentId || p.comments[0]?.id;
        return {
          ...p,
          type: 'question',
          resolutionStatus:
            p.resolutionStatus === 'Verified' ? 'Verified' : 'Resolved',
          acceptedCommentId: targetCommentId,
          comments: p.comments.map((c) => ({
            ...c,
            isAcceptedSolution: c.id === targetCommentId,
          })),
        };
      }),
    }));
    showToast('Question marked as Resolved! You can now Verify or Save to Community Memory.');
  };

  const markSolutionVerified = (postId: string, commentId?: string) => {
    const verifierLabel = `${state.currentUser.name} (${state.currentUser.role})`;
    setState((prev) => {
      const updatedPosts = prev.posts.map((p) => {
        if (p.id !== postId) return p;
        const targetCommentId =
          commentId || p.acceptedCommentId || p.comments[0]?.id;
        return {
          ...p,
          type: 'question' as const,
          resolutionStatus: 'Verified' as const,
          acceptedCommentId: targetCommentId,
          verifiedBy: verifierLabel,
          comments: p.comments.map((c) =>
            c.id === targetCommentId
              ? {
                  ...c,
                  isAcceptedSolution: true,
                  isVerifiedSolution: true,
                  verifiedBy: verifierLabel,
                }
              : c
          ),
        };
      });

      // Also update any existing KnowledgeEntry for this post to Verified
      const updatedMemories = prev.knowledgeEntries.map((mem) =>
        mem.postId === postId
          ? {
              ...mem,
              status: 'Verified' as const,
              verifiedBy: verifierLabel,
            }
          : mem
      );

      return {
        ...prev,
        posts: updatedPosts,
        knowledgeEntries: updatedMemories,
      };
    });
    showToast('Solution Verified by Authorized Reviewer!');
  };

  const savePostToCommunityMemory = (
    postId: string,
    customSummary?: string,
    customSolution?: string
  ): KnowledgeEntry | null => {
    const post = state.posts.find((p) => p.id === postId);
    if (!post) return null;

    // Prevent duplicates: if already saved, update it in place
    const existingEntry = state.knowledgeEntries.find((k) => k.postId === postId);
    if (existingEntry) {
      showToast('This discussion is already preserved in Community Memory!');
      return existingEntry;
    }

    const acceptedComment =
      post.comments.find((c) => c.id === post.acceptedCommentId) ||
      post.comments.find((c) => c.isAcceptedSolution) ||
      post.comments[0];

    const solutionText =
      customSolution?.trim() ||
      acceptedComment?.content ||
      post.content;

    const summaryText =
      customSummary?.trim() ||
      post.content.split('\n')[0].slice(0, 220);

    const status: 'Resolved' | 'Verified' =
      post.resolutionStatus === 'Verified' || acceptedComment?.isVerifiedSolution
        ? 'Verified'
        : 'Resolved';

    const newEntry: KnowledgeEntry = {
      id: `mem-${Date.now()}`,
      postId: post.id,
      questionTitle: post.title,
      problemSummary: summaryText,
      acceptedSolution: solutionText,
      contributorId: acceptedComment?.authorId || post.authorId,
      contributorName: acceptedComment?.authorName || post.authorName,
      contributorRole: acceptedComment?.authorRole || post.authorRole,
      contributorAvatar: acceptedComment?.authorAvatar || post.authorAvatar,
      verifiedBy:
        status === 'Verified'
          ? post.verifiedBy || `${state.currentUser.name} (${state.currentUser.role})`
          : undefined,
      communityId: post.communityId,
      communityName: post.communityName,
      category: post.category,
      tags: post.tags,
      technologies:
        post.requiredSkills && post.requiredSkills.length > 0
          ? post.requiredSkills
          : post.tags,
      status,
      createdAt: `${status} just now`,
      createdAtTimestamp: Date.now(),
      helpfulCount: Math.max(12, post.likes),
    };

    setState((prev) => ({
      ...prev,
      knowledgeEntries: [newEntry, ...prev.knowledgeEntries],
      posts: prev.posts.map((p) =>
        p.id === post.id
          ? {
              ...p,
              savedToMemoryId: newEntry.id,
              resolutionStatus:
                p.resolutionStatus === 'Verified' ? 'Verified' : 'Resolved',
            }
          : p
      ),
    }));

    showToast('Saved solution to Community Memory! Now searchable across ConnectAI.');
    return newEntry;
  };

  const upvoteKnowledgeEntry = (memoryId: string) => {
    setState((prev) => ({
      ...prev,
      knowledgeEntries: prev.knowledgeEntries.map((k) =>
        k.id === memoryId ? { ...k, helpfulCount: k.helpfulCount + 1 } : k
      ),
    }));
    showToast('Marked knowledge entry as helpful!');
  };

  const toggleJoinCommunity = (communityId: string) => {
    let joinedName = '';
    let nowJoined = false;
    setState((prev) => {
      const updatedCommunities = prev.communities.map((c) => {
        if (c.id !== communityId) return c;
        nowJoined = !c.isJoined;
        joinedName = c.name;
        return {
          ...c,
          isJoined: nowJoined,
          memberCount: nowJoined ? c.memberCount + 1 : Math.max(0, c.memberCount - 1),
        };
      });

      const joinedIds = updatedCommunities
        .filter((c) => c.isJoined)
        .map((c) => c.id);

      return {
        ...prev,
        communities: updatedCommunities,
        currentUser: {
          ...prev.currentUser,
          joinedCommunityIds: joinedIds,
        },
      };
    });
    if (joinedName) {
      showToast(nowJoined ? `Joined ${joinedName}!` : `Left ${joinedName}.`);
    }
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setState((prev) => {
      const nextPrefs = { ...prev.preferences, ...prefs };
      return {
        ...prev,
        preferences: nextPrefs,
        currentUser: {
          ...prev.currentUser,
          skills: nextPrefs.skills,
          interests: nextPrefs.interests,
          currentProject: nextPrefs.currentProjects,
          learningGoals: nextPrefs.learningGoals,
          collaborationType: nextPrefs.collaborationType,
          experienceLevel: nextPrefs.experienceLevel,
          availability: nextPrefs.availability,
        },
      };
    });
    showToast('Matchmaking preferences updated.');
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setState((prev) => {
      const nextUser = { ...prev.currentUser, ...updates };
      return {
        ...prev,
        currentUser: nextUser,
        preferences: {
          ...prev.preferences,
          skills: nextUser.skills,
          interests: nextUser.interests,
          currentProjects: nextUser.currentProject,
          learningGoals: nextUser.learningGoals,
          collaborationType: nextUser.collaborationType,
          experienceLevel: nextUser.experienceLevel,
          availability: nextUser.availability,
        },
      };
    });
    showToast('Profile saved locally.');
  };

  const toggleSaveMember = (memberId: string) => {
    setState((prev) => {
      const currentSaved = prev.currentUser.savedMemberIds || [];
      const exists = currentSaved.includes(memberId);
      const nextSaved = exists
        ? currentSaved.filter((id) => id !== memberId)
        : [...currentSaved, memberId];
      return {
        ...prev,
        currentUser: {
          ...prev.currentUser,
          savedMemberIds: nextSaved,
        },
      };
    });
    showToast('Updated saved collaborator list.');
  };

  const sendConnectionRequest = (memberId: string, note?: string) => {
    const existing = state.connections.find((c) => c.userId === memberId);
    if (existing) {
      showToast('Connection or request already exists with this member.');
      return;
    }
    const targetMember = state.members.find((m) => m.id === memberId);
    setState((prev) => ({
      ...prev,
      connections: [
        ...prev.connections,
        {
          id: `conn-${Date.now()}`,
          userId: memberId,
          status: 'pending_outgoing',
          connectedAt: 'Requested just now',
          note:
            note ||
            `Hi ${targetMember?.name || 'there'}, matched with your profile on ConnectAI—would love to collaborate!`,
        },
      ],
    }));
    showToast(`Connection request sent to ${targetMember?.name || 'member'}.`);
  };

  const acceptConnectionRequest = (connectionId: string) => {
    const conn = state.connections.find((c) => c.id === connectionId);
    const member = state.members.find((m) => m.id === conn?.userId);
    setState((prev) => {
      const updatedConns = prev.connections.map((c) =>
        c.id === connectionId
          ? { ...c, status: 'connected' as const, connectedAt: 'Connected just now' }
          : c
      );

      let updatedConvs = [...prev.conversations];
      if (member && !updatedConvs.some((cv) => cv.participantId === member.id)) {
        updatedConvs = [
          {
            id: `conv-${Date.now()}`,
            participantId: member.id,
            participantName: member.name,
            participantRole: member.role,
            participantAvatar: member.avatar,
            participantStatus: member.onlineStatus,
            unreadCount: 0,
            lastMessageAt: 'Just now',
            messages: [
              {
                id: `m-${Date.now()}`,
                senderId: member.id,
                text: conn?.note || `Hi ${prev.currentUser.name}, excited to connect on ConnectAI!`,
                timestamp: 'Just now',
              },
            ],
          },
          ...updatedConvs,
        ];
      }

      return {
        ...prev,
        connections: updatedConns,
        conversations: updatedConvs,
      };
    });
    showToast(`Connected with ${member?.name || 'member'}!`);
  };

  const rejectConnectionRequest = (connectionId: string) => {
    setState((prev) => ({
      ...prev,
      connections: prev.connections.filter((c) => c.id !== connectionId),
    }));
    showToast('Connection request dismissed.');
  };

  const toggleEventRegistration = (eventId: string) => {
    let regState = false;
    let eventTitle = '';
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) => {
        if (e.id !== eventId) return e;
        regState = !e.isRegistered;
        eventTitle = e.title;
        return {
          ...e,
          isRegistered: regState,
          attendeeCount: regState ? e.attendeeCount + 1 : Math.max(0, e.attendeeCount - 1),
        };
      }),
    }));
    showToast(
      regState
        ? `Registered for demo event: ${eventTitle}`
        : `Cancelled registration for ${eventTitle}`
    );
  };

  const createEvent = (input: {
    title: string;
    description: string;
    date: string;
    time: string;
    format: CommunityEvent['format'];
    location: string;
    category: CommunityEvent['category'];
    hostCommunityId: string;
    tags: string[];
  }) => {
    const comm =
      state.communities.find((c) => c.id === input.hostCommunityId) ||
      state.communities[0];

    const newEvt: CommunityEvent = {
      id: `evt-${Date.now()}`,
      title: input.title.trim(),
      description: `Demo Event: ${input.description.trim()}`,
      agenda: [
        'Welcome & Problem Context',
        'Technical Deep-Dive & Live Verification',
        'Open Q&A and Collaborator Matching',
      ],
      date: input.date || 'Nov 10, 2026',
      time: input.time || '06:00 PM IST · 60 Mins',
      format: input.format,
      location: input.location.trim() || 'ConnectAI Virtual Stage (Demo)',
      category: input.category,
      hostCommunityId: comm.id,
      hostCommunityName: comm.name,
      attendeeCount: 1,
      maxCapacity: 200,
      isRegistered: true,
      tags: input.tags.length > 0 ? input.tags : [input.category, comm.name],
      speaker: {
        name: state.currentUser.name,
        role: state.currentUser.role,
      },
    };

    setState((prev) => ({
      ...prev,
      events: [newEvt, ...prev.events],
    }));
    showToast(`Created sample event "${newEvt.title}"!`);
  };

  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return;
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((cv) => {
        if (cv.id !== conversationId) return cv;
        return {
          ...cv,
          unreadCount: 0,
          lastMessageAt: 'Just now',
          messages: [
            ...cv.messages,
            {
              id: `msg-${Date.now()}`,
              senderId: prev.currentUser.id,
              text: text.trim(),
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          ],
        };
      }),
    }));
  };

  const startOrOpenConversation = (memberId: string): string => {
    const existing = state.conversations.find((c) => c.participantId === memberId);
    if (existing) return existing.id;

    const member = state.members.find((m) => m.id === memberId);
    if (!member) return state.conversations[0]?.id || '';

    const newConvId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participantId: member.id,
      participantName: member.name,
      participantRole: member.role,
      participantAvatar: member.avatar,
      participantStatus: member.onlineStatus,
      unreadCount: 0,
      lastMessageAt: 'New conversation',
      messages: [],
    };

    setState((prev) => ({
      ...prev,
      conversations: [newConv, ...prev.conversations],
    }));
    return newConvId;
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, isRead: !n.isRead } : n
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
    }));
    showToast('All notifications marked as read.');
  };

  const addSearchQueryToHistory = (q: string) => {
    const clean = q.trim();
    if (!clean) return;
    setState((prev) => {
      const filtered = prev.searchHistory.filter(
        (item) => item.toLowerCase() !== clean.toLowerCase()
      );
      return {
        ...prev,
        searchHistory: [clean, ...filtered].slice(0, 8),
      };
    });
  };

  const clearSearchHistory = () => {
    setState((prev) => ({ ...prev, searchHistory: [] }));
  };

  const sendCopilotQuery = (query: string) => {
    if (!query.trim()) return;
    const userMsg: CopilotMessage = {
      id: `cop-u-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const responsePayload = queryCommunityCopilot(
      query,
      state.posts,
      state.communities,
      state.members,
      state.events,
      state.knowledgeEntries
    );

    const assistantMsg: CopilotMessage = {
      id: `cop-a-${Date.now() + 1}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ...responsePayload,
    };

    setCopilotMessages((prev) => [...prev, userMsg, assistantMsg]);
  };

  const clearCopilotHistory = () => {
    setCopilotMessages([INITIAL_COPILOT_WELCOME]);
    showToast('Cleared Community Copilot session chat.');
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        completeOnboarding,
        skipOnboardingForDemo,
        openOnboardingModal,
        isOnboardingOpen,
        setIsOnboardingOpen,
        resetDemoData,
        clearAllLocalData,
        toggleTheme,
        isJudgeGuideOpen,
        setIsJudgeGuideOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        initialSearchQuery,
        openGlobalSearchWithQuery,
        createPost,
        toggleLikePost,
        toggleBookmarkPost,
        addComment,
        markQuestionResolved,
        markSolutionVerified,
        savePostToCommunityMemory,
        upvoteKnowledgeEntry,
        toggleJoinCommunity,
        updatePreferences,
        updateUserProfile,
        toggleSaveMember,
        sendConnectionRequest,
        acceptConnectionRequest,
        rejectConnectionRequest,
        toggleEventRegistration,
        createEvent,
        sendMessage,
        startOrOpenConversation,
        markNotificationRead,
        markAllNotificationsRead,
        addSearchQueryToHistory,
        clearSearchHistory,
        copilotMessages,
        sendCopilotQuery,
        clearCopilotHistory,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
