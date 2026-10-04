import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Plus,
  Sparkles,
  ExternalLink,
  Send,
  Compass,
  Users,
  Bot,
  SlidersHorizontal,
  X,
  Search,
  Database,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';
import { VerifiedSolutionBadge } from '../components/VerifiedSolutionBadge';
import { PostType } from '../types';
import { getRecommendedCommunities } from '../services/aiService';
import { HERO_BANNER_IMAGE } from '../data/seedData';

const QUICK_KNOWLEDGE_TOPICS = [
  'Python dependency conflicts',
  'Deploying ML models',
  'React performance',
  'Firebase authentication',
  'ESP32 sensor integration',
  'RAG vector search',
];

export const HomeFeed: React.FC = () => {
  const {
    currentUser,
    preferences,
    posts,
    knowledgeEntries,
    communities,
    createPost,
    toggleLikePost,
    toggleBookmarkPost,
    addComment,
    markQuestionResolved,
    savePostToCommunityMemory,
    setIsJudgeGuideOpen,
    openGlobalSearchWithQuery,
    theme,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedPostId = searchParams.get('post');

  // Top Dashboard Quick Actions State
  const [inlineKnowledgeQuery, setInlineKnowledgeQuery] = useState('');
  const [inlineCopilotPrompt, setInlineCopilotPrompt] = useState('');
  const [inlineProblemSkill, setInlineProblemSkill] = useState(
    'Python, PyTorch, ONNX'
  );

  // Feed filter & sort state
  const [filterTab, setFilterTab] = useState<
    'all' | 'unresolved' | 'verified' | 'projects' | 'following'
  >('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'latest' | 'popular'>(
    'recommended'
  );

  // Composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<PostType>('question');
  const [newCategory, setNewCategory] = useState('Python Dependency Conflicts');
  const [newCommId, setNewCommId] = useState(
    communities[0]?.id || 'comm-ai-ml'
  );
  const [newTagsInput, setNewTagsInput] = useState(
    'Python, PyTorch, ONNX, uv'
  );
  const [newProjectLink, setNewProjectLink] = useState('');

  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({
    'post-py-deps': true,
  });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {}
  );

  const joinedSet = useMemo(
    () => new Set(communities.filter((c) => c.isJoined).map((c) => c.id)),
    [communities]
  );

  const userInterestTerms = useMemo(
    () =>
      new Set(
        [...preferences.interests, ...preferences.skills].map((s) =>
          s.toLowerCase()
        )
      ),
    [preferences]
  );

  // Unresolved Questions (Open or Answered, not yet Resolved/Verified)
  const unresolvedQuestions = useMemo(
    () =>
      posts.filter(
        (p) =>
          p.type === 'question' &&
          p.resolutionStatus !== 'Resolved' &&
          p.resolutionStatus !== 'Verified'
      ),
    [posts]
  );

  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter((p) => {
      if (highlightedPostId && p.id === highlightedPostId) return true;
      if (filterTab === 'following') return joinedSet.has(p.communityId);
      if (filterTab === 'unresolved')
        return (
          p.type === 'question' &&
          p.resolutionStatus !== 'Resolved' &&
          p.resolutionStatus !== 'Verified'
        );
      if (filterTab === 'verified')
        return (
          p.resolutionStatus === 'Verified' ||
          p.resolutionStatus === 'Resolved'
        );
      if (filterTab === 'projects') return p.type === 'project';
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (highlightedPostId) {
        if (a.id === highlightedPostId) return -1;
        if (b.id === highlightedPostId) return 1;
      }
      if (sortBy === 'latest') {
        return b.createdAtTimestamp - a.createdAtTimestamp;
      }
      if (sortBy === 'popular') {
        return (
          b.likes + b.comments.length * 4 - (a.likes + a.comments.length * 4)
        );
      }
      const overlapA = a.tags.filter((t) =>
        userInterestTerms.has(t.toLowerCase())
      ).length;
      const overlapB = b.tags.filter((t) =>
        userInterestTerms.has(t.toLowerCase())
      ).length;
      return (
        overlapB * 20 +
        b.likes * 0.4 -
        (overlapA * 20 + a.likes * 0.4)
      );
    });
  }, [
    posts,
    filterTab,
    sortBy,
    joinedSet,
    userInterestTerms,
    highlightedPostId,
  ]);

  const recommendedCommunities = useMemo(
    () => getRecommendedCommunities(preferences, communities).slice(0, 4),
    [preferences, communities]
  );

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    const tags = newTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const createdId = createPost({
      title: newTitle,
      content: newContent,
      type: newType,
      category: newCategory,
      communityId: newCommId,
      tags,
      projectLink: newType === 'project' ? newProjectLink.trim() : undefined,
    });

    setNewTitle('');
    setNewContent('');
    setNewProjectLink('');
    setComposerOpen(false);
    if (newType === 'question') {
      navigate(`/workspace/${createdId}`);
    }
  };

  const handleCommentSubmit = (postId: string) => {
    const draft = commentDrafts[postId];
    if (!draft || !draft.trim()) return;
    addComment(postId, draft);
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const isLight = theme === 'light';

  return (
    <div className="space-y-6">
      {/* Hero Banner with Core Workflow Pipeline */}
      <section className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
        <img
          src={HERO_BANNER_IMAGE}
          alt="Connected community intelligence nodes"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/70" />

        <div className="relative p-6 sm:p-8 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="max-w-3xl space-y-2">
              <div className="text-xs font-mono text-blue-400">
                ConnectAI · Community Intelligence Platform
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance">
                Turn community conversations into reusable knowledge, match collaborators to real problems, and preserve verified solutions.
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setComposerOpen(true)}
                className="px-4 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Ask a Technical Question
              </button>
              <button
                onClick={() => navigate('/memory')}
                className="px-4 py-2.5 text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Database className="w-4 h-4" />
                Community Memory ({knowledgeEntries.length})
              </button>
              <button
                onClick={() => setIsJudgeGuideOpen(true)}
                className="px-3.5 py-2.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-blue-300 border border-blue-500/30 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                8-Step Judge Demo
              </button>
            </div>
          </div>

          {/* Interactive Core Workflow Chain */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
            <span className="text-slate-400">Core Workflow:</span>
            <button
              onClick={() => navigate('/workspace/post-py-deps')}
              className="hover:text-blue-400 underline decoration-slate-700 underline-offset-4"
            >
              1. Community Question
            </button>
            <span className="text-slate-600">→</span>
            <button
              onClick={() =>
                openGlobalSearchWithQuery('Python dependency conflicts')
              }
              className="hover:text-blue-400 underline decoration-slate-700 underline-offset-4"
            >
              2. Knowledge Retrieval
            </button>
            <span className="text-slate-600">→</span>
            <button
              onClick={() =>
                navigate(
                  '/copilot?q=' +
                    encodeURIComponent(
                      'How to resolve Python dependency conflicts with PyTorch and ONNX?'
                    )
                )
              }
              className="hover:text-blue-400 underline decoration-slate-700 underline-offset-4"
            >
              3. AI Assistance
            </button>
            <span className="text-slate-600">→</span>
            <button
              onClick={() =>
                navigate('/matchmaking?problemId=post-py-deps')
              }
              className="hover:text-blue-400 underline decoration-slate-700 underline-offset-4"
            >
              4. Collaborator Matching
            </button>
            <span className="text-slate-600">→</span>
            <button
              onClick={() => navigate('/workspace/post-py-deps')}
              className="hover:text-emerald-400 underline decoration-slate-700 underline-offset-4"
            >
              5. Verified Solution
            </button>
            <span className="text-slate-600">→</span>
            <button
              onClick={() => navigate('/memory')}
              className="text-emerald-400 font-semibold hover:underline"
            >
              6. Community Memory
            </button>
          </div>
        </div>
      </section>

      {/* Priority Sections 1, 2, 3: Three-Card Action Command Bar */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Search Community Knowledge */}
        <div
          className={`p-5 rounded-xl border flex flex-col justify-between gap-3 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/80 border-slate-800/90'
          }`}
        >
          <div className="space-y-2">
            <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              1. Search Community Knowledge
            </div>
            <p className="text-xs text-slate-400">
              Prioritizes Verified Solutions & Resolved Questions over raw noise.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                openGlobalSearchWithQuery(inlineKnowledgeQuery);
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={inlineKnowledgeQuery}
                onChange={(e) => setInlineKnowledgeQuery(e.target.value)}
                placeholder="Search error codes, stack, or topics..."
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shrink-0"
              >
                Search
              </button>
            </form>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-400">
            <span className="text-slate-500">Try:</span>
            {QUICK_KNOWLEDGE_TOPICS.slice(0, 3).map((topic, idx) => (
              <React.Fragment key={topic}>
                {idx > 0 && <span aria-hidden="true">·</span>}
                <button
                  onClick={() => openGlobalSearchWithQuery(topic)}
                  className="text-blue-400 hover:underline"
                >
                  {topic}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 2. Ask Community Copilot */}
        <div
          className={`p-5 rounded-xl border flex flex-col justify-between gap-3 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/80 border-slate-800/90'
          }`}
        >
          <div className="space-y-2">
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Bot className="w-4 h-4" />
              2. Ask Community Copilot (Evidence-First)
            </div>
            <p className="text-xs text-slate-400">
              Synthesizes answers strictly from local verified solutions & cites sources.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!inlineCopilotPrompt.trim()) return;
                navigate(
                  `/copilot?q=${encodeURIComponent(inlineCopilotPrompt.trim())}`
                );
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={inlineCopilotPrompt}
                onChange={(e) => setInlineCopilotPrompt(e.target.value)}
                placeholder="Ask a technical question..."
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shrink-0"
              >
                Ask
              </button>
            </form>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <button
              onClick={() =>
                navigate(
                  '/copilot?q=' +
                    encodeURIComponent(
                      'How to resolve Python dependency conflicts with PyTorch and ONNX?'
                    )
                )
              }
              className="text-emerald-400 hover:underline truncate"
            >
              “Resolve Python dependency conflicts...” →
            </button>
          </div>
        </div>

        {/* 3. Find a Collaborator for a Problem */}
        <div
          className={`p-5 rounded-xl border flex flex-col justify-between gap-3 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/80 border-slate-800/90'
          }`}
        >
          <div className="space-y-2">
            <div className="text-xs font-semibold text-violet-400 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              3. Find a Collaborator (Problem-to-Person)
            </div>
            <p className="text-xs text-slate-400">
              Match with mentors, teammates, and domain experts based on required skills.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate(
                  `/matchmaking?skills=${encodeURIComponent(
                    inlineProblemSkill
                  )}`
                );
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={inlineProblemSkill}
                onChange={(e) => setInlineProblemSkill(e.target.value)}
                placeholder="Skills needed: e.g. ESP32, I2C, React..."
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg shrink-0"
              >
                Match
              </button>
            </form>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <button
              onClick={() => navigate('/matchmaking?problemId=post-py-deps')}
              className="text-violet-400 hover:underline"
            >
              Match experts for active Python question →
            </button>
          </div>
        </div>
      </section>

      {/* Priority Sections 4 & 5: Continue Unresolved Questions + Recently Verified Solutions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 4. Continue Unresolved Questions (6 cols) */}
        <div
          className={`lg:col-span-6 p-5 rounded-2xl border space-y-4 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/80 border-slate-800/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                4. Continue Unresolved Questions ({unresolvedQuestions.length})
              </h2>
              <p className="text-xs text-slate-400">
                Open & Answered technical blockers waiting to be verified and saved to Community Memory
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {unresolvedQuestions.slice(0, 3).map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2 text-slate-400">
                  <div className="flex items-center gap-2">
                    <VerifiedSolutionBadge
                      status={q.resolutionStatus || 'Open'}
                      verifiedBy={q.verifiedBy}
                    />
                    <span aria-hidden="true">·</span>
                    <span>{q.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">
                      {q.comments.length} answer{q.comments.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px]">{q.createdAt}</span>
                </div>

                <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                  {q.title}
                </h3>

                <div className="text-[11px] text-slate-400">
                  Required Skills:{' '}
                  <span className="text-slate-200">
                    {(q.requiredSkills || q.tags).slice(0, 4).join(' · ')}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/workspace/${q.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Open Problem Workspace
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/matchmaking?problemId=${encodeURIComponent(q.id)}`
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Find Someone to Help
                    </button>

                    {q.comments.length > 0 && (
                      <button
                        onClick={() => {
                          markQuestionResolved(q.id);
                          savePostToCommunityMemory(q.id);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors font-medium"
                      >
                        Resolve & Save
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Recently Verified Solutions in Community Memory (6 cols) */}
        <div
          className={`lg:col-span-6 p-5 rounded-2xl border space-y-4 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/80 border-slate-800/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                5. Recently Verified Solutions ({knowledgeEntries.length})
              </h2>
              <p className="text-xs text-slate-400">
                Preserved in Community Memory with contributor attribution & source links
              </p>
            </div>
            <button
              onClick={() => navigate('/memory')}
              className="text-xs text-blue-400 hover:underline shrink-0"
            >
              Browse All Memory →
            </button>
          </div>

          <div className="space-y-3">
            {knowledgeEntries.slice(0, 3).map((mem) => (
              <div
                key={mem.id}
                className="p-4 rounded-xl bg-slate-950/75 border border-emerald-500/25 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {mem.status} · {mem.category}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Solution by {mem.contributorName}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                  {mem.questionTitle}
                </h3>

                <p className="text-slate-300 line-clamp-2 leading-relaxed">
                  {mem.acceptedSolution}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Stack: {mem.technologies.slice(0, 3).join(' · ')}
                  </span>
                  <button
                    onClick={() => navigate(`/workspace/${mem.postId}`)}
                    className="text-blue-400 hover:underline font-medium flex items-center gap-1"
                  >
                    <span>Inspect Source Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Feed & Section 6: Recommended Communities Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-5">
          {/* Question / Post Composer Modal or Trigger */}
          {composerOpen && (
            <form
              onSubmit={handleCreatePost}
              className={`p-5 rounded-xl border space-y-4 ${
                isLight
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-900 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">
                  Open a Technical Question or Share a Discussion
                </h2>
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Post Format
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as PostType)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="question">Technical Question (Problem Workspace)</option>
                    <option value="text">Technical Discussion</option>
                    <option value="project">Project Showcase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Target Community
                  </label>
                  <select
                    value={newCommId}
                    onChange={(e) => setNewCommId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Problem Domain / Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g., Python Dependency Conflicts"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Question or Discussion Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Describe the exact problem, error code, or architectural question..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Problem Details & Reproduction Context
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Include versions, symptoms, and what you have tried so far..."
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Required Skills & Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTagsInput}
                    onChange={(e) => setNewTagsInput(e.target.value)}
                    placeholder="Python, PyTorch, ONNX, Docker"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                {newType === 'project' && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Repository URL (optional)
                    </label>
                    <input
                      type="url"
                      value={newProjectLink}
                      onChange={(e) => setNewProjectLink(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                >
                  {newType === 'question'
                    ? 'Publish & Open Problem Workspace'
                    : 'Publish to Feed'}
                </button>
              </div>
            </form>
          )}

          {/* Feed Filter & Sort Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 overflow-x-auto">
              {(
                [
                  { id: 'all', label: 'All Discussions' },
                  { id: 'unresolved', label: 'Unresolved Questions' },
                  { id: 'verified', label: 'Resolved & Verified' },
                  { id: 'projects', label: 'Projects' },
                  { id: 'following', label: 'Following' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFilterTab(tab.id);
                    if (highlightedPostId) setSearchParams({});
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    filterTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Sort:</span>
              {(
                [
                  { id: 'recommended', label: 'Recommended' },
                  { id: 'latest', label: 'Latest' },
                  { id: 'popular', label: 'Popular' },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    sortBy === s.id
                      ? 'bg-slate-800 text-blue-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Community Discussions List */}
          <div className="space-y-4">
            {filteredAndSortedPosts.map((post) => {
              const isCommentsOpen = !!expandedComments[post.id];
              const isSavedToMemory = knowledgeEntries.some(
                (k) => k.postId === post.id
              );
              const hasConfirmedResolution =
                post.resolutionStatus === 'Verified' ||
                post.resolutionStatus === 'Resolved';
              const confirmedComment =
                post.comments.find((c) => c.id === post.acceptedCommentId) ||
                post.comments.find(
                  (c) => c.isVerifiedSolution || c.isAcceptedSolution
                );

              return (
                <article
                  key={post.id}
                  className={`p-5 rounded-xl border transition-colors ${
                    hasConfirmedResolution
                      ? isLight
                        ? 'bg-white border-emerald-500/50 border-l-4 border-l-emerald-500 shadow-xs'
                        : 'bg-slate-900/85 border-emerald-500/35 border-l-4 border-l-emerald-500'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-slate-900/75 border-slate-800/90 hover:border-slate-700/80'
                  }`}
                >
                  {/* Author & Status Line */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={post.authorAvatar}
                        name={post.authorName}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="font-semibold">
                            {post.authorName}
                          </span>
                          <span aria-hidden="true" className="text-slate-500">
                            ·
                          </span>
                          <span className="text-slate-400 truncate">
                            {post.authorRole}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <button
                            onClick={() =>
                              navigate(`/communities/${post.communityId}`)
                            }
                            className="text-blue-400 hover:underline font-medium"
                          >
                            {post.communityName}
                          </button>
                          <span aria-hidden="true">·</span>
                          <span>{post.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{post.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <VerifiedSolutionBadge
                        status={
                          hasConfirmedResolution
                            ? 'Verified'
                            : post.resolutionStatus
                        }
                        verifiedBy={post.verifiedBy}
                        size="md"
                      />
                      {isSavedToMemory && (
                        <button
                          onClick={() => navigate('/memory')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/30 font-mono text-[11px] hover:bg-blue-500/20 transition-colors"
                        >
                          <Database className="w-3 h-3 text-blue-400" />
                          <span>In Memory</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Content */}
                  <h2 className="mt-3.5 text-base sm:text-lg font-semibold leading-snug">
                    <button
                      onClick={() => navigate(`/workspace/${post.id}`)}
                      className="text-left hover:text-blue-400 transition-colors"
                    >
                      {post.title}
                    </button>
                  </h2>

                  <div
                    className={`mt-2 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      isLight ? 'text-slate-600' : 'text-slate-300'
                    }`}
                  >
                    {post.content}
                  </div>

                  {/* Confirmed Resolution Callout inside Post Card */}
                  {hasConfirmedResolution && confirmedComment && (
                    <div className="mt-3.5 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/35 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          Confirmed Resolution by {confirmedComment.authorName}
                        </span>
                        {post.verifiedBy && (
                          <span className="text-[11px] font-mono text-emerald-400/90">
                            Reviewer: {post.verifiedBy}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed whitespace-pre-line">
                        {confirmedComment.content}
                      </p>
                    </div>
                  )}

                  {/* Unboxed Topics */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                    <span className="text-slate-500">Topics:</span>
                    {post.tags.map((tag, idx) => (
                      <React.Fragment key={tag}>
                        {idx > 0 && <span aria-hidden="true">·</span>}
                        <span>{tag}</span>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Problem Intelligence Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLikePost(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                          post.isLiked
                            ? 'text-rose-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            post.isLiked ? 'fill-rose-400' : ''
                          }`}
                        />
                        <span className="font-mono tabular-nums">
                          {post.likes}
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          setExpandedComments((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          }))
                        }
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-mono tabular-nums">
                          {post.comments.length}
                        </span>
                        <span>Answers</span>
                      </button>

                      <button
                        onClick={() => toggleBookmarkPost(post.id)}
                        className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                          post.isBookmarked
                            ? 'text-blue-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            post.isBookmarked ? 'fill-blue-400' : ''
                          }`}
                        />
                        <span>{post.isBookmarked ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>

                    {/* Workflow Actions on Every Post */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/matchmaking?problemId=${encodeURIComponent(
                              post.id
                            )}`
                          )
                        }
                        className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5 text-violet-400" />
                        Find Someone to Help
                      </button>

                      {post.type === 'question' &&
                        post.resolutionStatus !== 'Resolved' &&
                        post.resolutionStatus !== 'Verified' && (
                          <button
                            onClick={() => markQuestionResolved(post.id)}
                            className="px-2.5 py-1.5 text-xs font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg transition-colors"
                          >
                            Mark as Resolved
                          </button>
                        )}

                      {!isSavedToMemory && post.comments.length > 0 && (
                        <button
                          onClick={() => savePostToCommunityMemory(post.id)}
                          className="px-2.5 py-1.5 text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors"
                        >
                          Save to Memory
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/workspace/${post.id}`)}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Workspace</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Comments / Answers */}
                  {isCommentsOpen && (
                    <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-3">
                      {post.comments.map((c) => (
                        <div
                          key={c.id}
                          className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                            c.isVerifiedSolution
                              ? 'bg-emerald-950/15 border-emerald-500/40'
                              : c.isAcceptedSolution
                              ? 'bg-blue-950/20 border-blue-500/40'
                              : 'bg-slate-950/60 border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between text-slate-400">
                            <div className="flex items-center gap-2">
                              <Avatar
                                src={c.authorAvatar}
                                name={c.authorName}
                                size="xs"
                              />
                              <span className="font-semibold text-slate-200">
                                {c.authorName}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{c.authorRole}</span>
                            </div>
                            <span className="font-mono text-[11px]">
                              {c.isVerifiedSolution
                                ? 'Verified Solution'
                                : c.isAcceptedSolution
                                ? 'Accepted Solution'
                                : c.createdAt}
                            </span>
                          </div>
                          <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      ))}

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentDrafts[post.id] || ''}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCommentSubmit(post.id);
                            }
                          }}
                          placeholder="Add a technical answer or diagnostic suggestion..."
                          className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleCommentSubmit(post.id)}
                          className="px-3 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Answer</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar (4 cols): Section 6 Recommended Communities & Workflow Status */}
        <aside className="lg:col-span-4 space-y-5">
          <div
            className={`p-5 rounded-xl border space-y-4 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/75 border-slate-800/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400" />
                6. Recommended Communities
              </h3>
              <button
                onClick={() => navigate('/communities')}
                className="text-xs text-blue-400 hover:underline"
              >
                Explore All
              </button>
            </div>

            <div className="space-y-3">
              {recommendedCommunities.map(({ community, reason }) => (
                <div
                  key={community.id}
                  className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/communities/${community.id}`)}
                      className="text-xs font-semibold text-slate-100 hover:text-blue-400 text-left"
                    >
                      {community.name}
                    </button>
                    <span className="text-[11px] font-mono text-slate-400">
                      {community.memberCount.toLocaleString()} members
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {community.description}
                  </p>
                  <div className="text-[11px] text-blue-300/90 pt-0.5">
                    {reason}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Local Intelligence Metrics */}
          <div
            className={`p-5 rounded-xl border space-y-3 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/75 border-slate-800/90'
            }`}
          >
            <h3 className="text-sm font-semibold">
              Community Knowledge Index
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => navigate('/memory')}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-left hover:border-emerald-500/40"
              >
                <div className="text-slate-400">Saved Solutions</div>
                <div className="mt-1 text-xl font-bold font-mono text-emerald-400">
                  {knowledgeEntries.length}
                </div>
              </button>
              <button
                onClick={() => setFilterTab('unresolved')}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-left hover:border-amber-500/40"
              >
                <div className="text-slate-400">Unresolved Questions</div>
                <div className="mt-1 text-xl font-bold font-mono text-amber-400">
                  {unresolvedQuestions.length}
                </div>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
