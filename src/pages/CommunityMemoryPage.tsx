import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Search,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  PlusCircle,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { identifyCandidateKnowledgePosts } from '../services/aiService';
import { Avatar } from '../components/Avatar';

export const CommunityMemoryPage: React.FC = () => {
  const {
    knowledgeEntries,
    posts,
    savePostToCommunityMemory,
    markQuestionResolved,
    markSolutionVerified,
    upvoteKnowledgeEntry,
    theme,
  } = useApp();

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'Verified' | 'Resolved' | 'candidates'
  >('all');

  const isLight = theme === 'light';

  // Auto-detect candidate discussions with useful answers not yet saved in Community Memory
  const candidatePosts = useMemo(
    () => identifyCandidateKnowledgePosts(posts, knowledgeEntries),
    [posts, knowledgeEntries]
  );

  const topics = useMemo(() => {
    const set = new Set<string>(['All']);
    knowledgeEntries.forEach((k) => {
      set.add(k.category);
      k.technologies.forEach((t) => set.add(t));
    });
    return Array.from(set).slice(0, 12);
  }, [knowledgeEntries]);

  const filteredEntries = useMemo(() => {
    return knowledgeEntries.filter((entry) => {
      if (statusFilter === 'Verified' && entry.status !== 'Verified')
        return false;
      if (statusFilter === 'Resolved' && entry.status !== 'Resolved')
        return false;
      if (
        selectedTopic !== 'All' &&
        entry.category !== selectedTopic &&
        !entry.technologies.includes(selectedTopic) &&
        !entry.tags.includes(selectedTopic)
      ) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        entry.questionTitle.toLowerCase().includes(q) ||
        entry.problemSummary.toLowerCase().includes(q) ||
        entry.acceptedSolution.toLowerCase().includes(q) ||
        entry.tags.some((t) => t.toLowerCase().includes(q)) ||
        entry.technologies.some((t) => t.toLowerCase().includes(q)) ||
        entry.contributorName.toLowerCase().includes(q)
      );
    });
  }, [knowledgeEntries, statusFilter, selectedTopic, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-blue-400">
              Core Differentiator · Reusable Verified Knowledge Base
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="font-mono text-emerald-400">
              Cached Locally for Instant Retrieval
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Community Memory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Turn community conversations into reusable, verified engineering solutions. Browse solved problems without scrolling through noisy feeds—every entry preserves full contributor attribution and links back to its source problem workspace.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search solved problems, error codes, stack..."
            className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Auto-Detected Candidate Discussions Banner */}
      {candidatePosts.length > 0 && (
        <section
          className={`p-5 rounded-2xl border space-y-4 ${
            isLight
              ? 'bg-blue-50/60 border-blue-200'
              : 'bg-blue-950/20 border-blue-500/30'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Auto-Identified Candidate Discussions Ready for Community Memory ({candidatePosts.length})
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                These technical questions have detailed community answers but haven’t been preserved in Community Memory yet.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidatePosts.map((post) => {
              const topAnswer =
                post.comments.find((c) => c.isAcceptedSolution) ||
                post.comments[0];
              return (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {post.communityName} · Status:{' '}
                        <strong className="text-amber-300">
                          {post.resolutionStatus || 'Answered'}
                        </strong>
                      </span>
                      <span className="font-mono">{post.createdAt}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      {post.title}
                    </h3>
                    {topAnswer && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        <span className="text-emerald-400 font-medium">
                          Candidate Answer ({topAnswer.authorName}):{' '}
                        </span>
                        {topAnswer.content}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/workspace/${post.id}`)}
                      className="text-xs text-blue-400 hover:underline font-medium flex items-center gap-1"
                    >
                      <span>Open Problem Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      {post.resolutionStatus !== 'Resolved' &&
                        post.resolutionStatus !== 'Verified' && (
                          <button
                            onClick={() =>
                              markQuestionResolved(post.id, topAnswer?.id)
                            }
                            className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                          >
                            Mark Resolved
                          </button>
                        )}
                      <button
                        onClick={() => {
                          markQuestionResolved(post.id, topAnswer?.id);
                          savePostToCommunityMemory(post.id);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Save to Memory
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Status & Technology Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 self-start">
          {(
            [
              { id: 'all', label: `All Saved (${knowledgeEntries.length})` },
              {
                id: 'Verified',
                label: `Verified Solutions (${
                  knowledgeEntries.filter((k) => k.status === 'Verified').length
                })`,
              },
              {
                id: 'Resolved',
                label: `Resolved (${
                  knowledgeEntries.filter((k) => k.status === 'Resolved').length
                })`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedTopic === topic
                  ? 'bg-slate-800 text-blue-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="p-10 rounded-xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
          <Database className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-medium text-slate-300">
            No knowledge entries match your current filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTopic('All');
              setStatusFilter('all');
            }}
            className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <article
              key={entry.id}
              className={`p-6 rounded-2xl border space-y-4 transition-colors ${
                isLight
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              {/* Top Metadata Line (Unboxed text with separators) */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      entry.status === 'Verified'
                        ? 'text-emerald-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {entry.status === 'Verified' ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {entry.status} Solution
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{entry.category}</span>
                  <span aria-hidden="true">·</span>
                  <button
                    onClick={() =>
                      navigate(`/communities/${entry.communityId}`)
                    }
                    className="text-blue-400 hover:underline"
                  >
                    {entry.communityName}
                  </button>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{entry.createdAt}</span>
                </div>

                {entry.verifiedBy && (
                  <span className="text-[11px] font-mono text-emerald-400/90">
                    Verified by {entry.verifiedBy}
                  </span>
                )}
              </div>

              {/* Original Question & Problem Summary */}
              <div className="space-y-1.5">
                <h2 className="text-base sm:text-lg font-bold leading-snug">
                  {entry.questionTitle}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Problem Context:</strong> {entry.problemSummary}
                </p>
              </div>

              {/* Preserved Accepted Solution Box */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={entry.contributorAvatar}
                      name={entry.contributorName}
                      size="xs"
                    />
                    <span className="font-semibold text-emerald-300">
                      Accepted Solution by {entry.contributorName}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">
                      ·
                    </span>
                    <span className="text-slate-400">
                      {entry.contributorRole}
                    </span>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line pl-1">
                  {entry.acceptedSolution}
                </div>
              </div>

              {/* Technologies & Action Footer */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
                  <span className="text-slate-500">Technologies:</span>
                  {entry.technologies.map((tech, idx) => (
                    <React.Fragment key={tech}>
                      {idx > 0 && <span aria-hidden="true">·</span>}
                      <span className="text-slate-300">{tech}</span>
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => upvoteKnowledgeEntry(entry.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-mono tabular-nums">
                      {entry.helpfulCount}
                    </span>
                    <span>Helpful</span>
                  </button>

                  {entry.status === 'Resolved' && (
                    <button
                      onClick={() => markSolutionVerified(entry.postId)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-colors font-medium"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Verify Solution
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/workspace/${entry.postId}`)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Open Source Workspace</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
