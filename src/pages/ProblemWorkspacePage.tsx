import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Database,
  Bot,
  Users,
  Send,
  ExternalLink,
  UserPlus,
  MessageSquare,
  Check,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  extractProblemSkills,
  computeProblemToPersonMatches,
  getWorkspaceRelatedRecords,
  getAIRuntimeInfo,
} from '../services/aiService';
import { Avatar } from '../components/Avatar';
import { VerifiedSolutionBadge } from '../components/VerifiedSolutionBadge';
import { QuestionStatus } from '../types';

export const ProblemWorkspacePage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const {
    posts,
    knowledgeEntries,
    members,
    connections,
    addComment,
    markQuestionResolved,
    markSolutionVerified,
    savePostToCommunityMemory,
    sendConnectionRequest,
    startOrOpenConversation,
    theme,
  } = useApp();

  const [answerDraft, setAnswerDraft] = useState('');
  const runtimeInfo = getAIRuntimeInfo();
  const isLight = theme === 'light';

  const post = posts.find((p) => p.id === postId);

  const requiredSkills = useMemo(() => {
    if (!post) return [];
    return extractProblemSkills(
      post.title,
      post.content,
      post.tags,
      post.requiredSkills || []
    );
  }, [post]);

  const relatedData = useMemo(() => {
    if (!post) return { relatedMemories: [], relatedPosts: [] };
    return getWorkspaceRelatedRecords(post, posts, knowledgeEntries);
  }, [post, posts, knowledgeEntries]);

  const collaboratorMatches = useMemo(() => {
    if (!post) return [];
    return computeProblemToPersonMatches(
      {
        title: post.title,
        description: post.content,
        requiredSkills,
        tags: post.tags,
      },
      members,
      'all'
    ).slice(0, 3);
  }, [post, requiredSkills, members]);

  const savedMemoryEntry = useMemo(() => {
    if (!post) return undefined;
    return knowledgeEntries.find((k) => k.postId === post.id);
  }, [post, knowledgeEntries]);

  if (!post) {
    return (
      <div className="p-10 text-center space-y-3">
        <p className="text-sm text-slate-300">
          Problem workspace not found.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentStatus: QuestionStatus =
    post.resolutionStatus ||
    (post.comments.length > 0 ? 'Answered' : 'Open');

  const acceptedComment =
    post.comments.find((c) => c.id === post.acceptedCommentId) ||
    post.comments.find((c) => c.isAcceptedSolution) ||
    post.comments[0];

  const handlePostAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerDraft.trim()) return;
    addComment(post.id, answerDraft);
    setAnswerDraft('');
  };

  const getStatusStyle = (status: QuestionStatus) => {
    switch (status) {
      case 'Verified':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
      case 'Resolved':
        return 'text-blue-400 border-blue-500/40 bg-blue-950/30';
      case 'Answered':
        return 'text-amber-300 border-amber-500/40 bg-amber-950/30';
      default:
        return 'text-rose-300 border-rose-500/40 bg-rose-950/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Back Link & Lifecycle Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Visual Lifecycle Bar: Open → Answered → Resolved → Verified → Community Memory */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {(['Open', 'Answered', 'Resolved', 'Verified'] as const).map(
            (step, idx) => {
              const order = ['Open', 'Answered', 'Resolved', 'Verified'];
              const isReached =
                order.indexOf(currentStatus) >= order.indexOf(step);
              const isCurrent = currentStatus === step;
              return (
                <React.Fragment key={step}>
                  {idx > 0 && <span className="text-slate-600">→</span>}
                  <span
                    className={`px-2.5 py-1 rounded-md border ${
                      isCurrent
                        ? getStatusStyle(step) + ' font-bold'
                        : isReached
                        ? 'text-slate-300 border-slate-700 bg-slate-900'
                        : 'text-slate-600 border-slate-800/60'
                    }`}
                  >
                    {step}
                  </span>
                </React.Fragment>
              );
            }
          )}
          <span className="text-slate-600">→</span>
          <span
            className={`px-2.5 py-1 rounded-md border ${
              savedMemoryEntry
                ? 'text-emerald-300 border-emerald-500/50 bg-emerald-950/40 font-bold'
                : 'text-slate-500 border-slate-800'
            }`}
          >
            {savedMemoryEntry ? 'Saved in Memory' : 'Community Memory'}
          </span>
        </div>
      </div>

      {/* Main Problem Header & Resolution Actions */}
      <section
        className={`p-6 rounded-2xl border space-y-4 ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-slate-900/85 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-blue-400">
                Unified Problem-Solving Workspace
              </span>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => navigate(`/communities/${post.communityId}`)}
                className="hover:underline text-slate-300"
              >
                {post.communityName}
              </button>
              <span aria-hidden="true">·</span>
              <span>{post.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{post.createdAt}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold leading-snug">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-slate-400">
              <Avatar
                src={post.authorAvatar}
                name={post.authorName}
                size="xs"
              />
              <span className="font-semibold text-slate-200">
                {post.authorName}
              </span>
              <span aria-hidden="true">·</span>
              <span>{post.authorRole}</span>
              <VerifiedSolutionBadge
                status={
                  currentStatus === 'Verified' || currentStatus === 'Resolved'
                    ? 'Verified'
                    : currentStatus
                }
                verifiedBy={post.verifiedBy}
                size="md"
              />
            </div>
          </div>

          {/* Lifecycle Action Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {currentStatus !== 'Resolved' && currentStatus !== 'Verified' && (
              <button
                onClick={() => markQuestionResolved(post.id)}
                className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Resolved
              </button>
            )}

            {currentStatus !== 'Verified' && (
              <button
                onClick={() => markSolutionVerified(post.id)}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                Verify Solution
              </button>
            )}

            {savedMemoryEntry ? (
              <button
                onClick={() => navigate('/memory')}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-1.5"
              >
                <Database className="w-4 h-4" />
                View in Community Memory →
              </button>
            ) : (
              <button
                onClick={() => savePostToCommunityMemory(post.id)}
                className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Database className="w-4 h-4" />
                Save to Community Memory
              </button>
            )}
          </div>
        </div>

        {/* Original Problem Description */}
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-slate-950/70 border-slate-800/90 text-slate-200'
          }`}
        >
          {post.content}
        </div>

        {/* Required Skills & Find Someone to Help Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
            <span className="font-medium text-slate-300">
              Extracted Problem Skills:
            </span>
            {requiredSkills.map((sk, i) => (
              <React.Fragment key={sk}>
                {i > 0 && <span aria-hidden="true">·</span>}
                <span className="text-blue-300 font-medium">{sk}</span>
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={() =>
              navigate(`/matchmaking?problemId=${encodeURIComponent(post.id)}`)
            }
            className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Find Someone to Help in Full Matchmaker →
          </button>
        </div>
      </section>

      {/* Workspace Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Evidence-First Summary, Accepted Solution, & Answers */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Evidence-First AI / Local Retrieval Summary Box */}
          <div className="p-5 rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-950/25 to-slate-900/90 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                <Bot className="w-4 h-4 text-blue-400" />
                Evidence-First Knowledge Synthesis
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                {runtimeInfo.copilotModeLabel}
              </span>
            </div>

            {acceptedComment ? (
              <div className="space-y-2 text-xs text-slate-200 leading-relaxed">
                <p className="text-slate-300">
                  <strong>Demo Summary (Grounded in Local Thread):</strong>{' '}
                  {acceptedComment.authorName} ({acceptedComment.authorRole})
                  provided a structured resolution for{' '}
                  <span className="text-blue-300">{post.category}</span>:
                </p>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 whitespace-pre-line">
                  {acceptedComment.content}
                </div>
              </div>
            ) : relatedData.relatedMemories.length > 0 ? (
              <div className="space-y-2 text-xs text-slate-200 leading-relaxed">
                <p>
                  This question has no direct replies yet, but{' '}
                  <strong>Community Memory</strong> contains a related verified
                  entry:{' '}
                  <span className="text-blue-300">
                    “{relatedData.relatedMemories[0].questionTitle}”
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                This question is currently <strong>Open</strong> and waiting for
                a verified technical solution. Check the recommended experts on
                the right to invite a collaborator with{' '}
                {requiredSkills.slice(0, 3).join(', ')} experience.
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400">
                Zero hallucinated claims · Linked strictly to local records
              </span>
              <button
                onClick={() =>
                  navigate(
                    `/copilot?q=${encodeURIComponent(post.title)}`
                  )
                }
                className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Open in Community Copilot</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Answers, Verification & Follow-Up Discussion */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Proposed Solutions & Technical Discussion ({post.comments.length})
              </h2>
              <span className="text-xs text-slate-400">
                Author or Moderator can mark any answer as Resolved or Verified
              </span>
            </div>

            {post.comments.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/50 border border-slate-800 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">
                  No answers posted yet. Contribute the first solution below or invite a matched collaborator!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {post.comments.map((comment) => {
                  const isAccepted =
                    comment.isAcceptedSolution ||
                    post.acceptedCommentId === comment.id;
                  const isVerified =
                    comment.isVerifiedSolution ||
                    (isAccepted && post.resolutionStatus === 'Verified');

                  return (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-xl border space-y-3 ${
                        isVerified
                          ? 'bg-emerald-950/15 border-emerald-500/40'
                          : isAccepted
                          ? 'bg-blue-950/20 border-blue-500/40'
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={comment.authorAvatar}
                            name={comment.authorName}
                            size="sm"
                          />
                          <div>
                            <div className="font-semibold text-slate-100">
                              {comment.authorName}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {comment.authorRole} · {comment.createdAt}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isVerified ? (
                            <span className="font-mono text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-4 h-4" />
                              Verified Solution
                            </span>
                          ) : isAccepted ? (
                            <span className="font-mono text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              Accepted Solution (Resolved)
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                        {comment.content}
                      </div>

                      {/* Per-Comment Resolution & Verification Controls */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-[11px] text-slate-400">
                          {comment.verifiedBy
                            ? `Verified by ${comment.verifiedBy}`
                            : 'Human verification required before marking Verified'}
                        </div>
                        <div className="flex items-center gap-2">
                          {!isAccepted && (
                            <button
                              onClick={() =>
                                markQuestionResolved(post.id, comment.id)
                              }
                              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white transition-colors"
                            >
                              Accept as Solution
                            </button>
                          )}
                          {!isVerified && (
                            <button
                              onClick={() =>
                                markSolutionVerified(post.id, comment.id)
                              }
                              className="px-2.5 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-colors"
                            >
                              Verify Solution
                            </button>
                          )}
                          {!savedMemoryEntry && (
                            <button
                              onClick={() => {
                                markQuestionResolved(post.id, comment.id);
                                savePostToCommunityMemory(
                                  post.id,
                                  undefined,
                                  comment.content
                                );
                              }}
                              className="px-2.5 py-1 rounded-md bg-indigo-600/25 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 transition-colors"
                            >
                              Save to Community Memory
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Solution / Comment Form */}
            <form onSubmit={handlePostAnswer} className="pt-2 space-y-2.5">
              <label className="block text-xs font-medium text-slate-300">
                Contribute a Technical Answer or Follow-Up
              </label>
              <textarea
                rows={3}
                value={answerDraft}
                onChange={(e) => setAnswerDraft(e.target.value)}
                placeholder="Write a reproducible fix, configuration snippet, or diagnostic step..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Answer
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): Problem-to-Person Collaborators & Related Knowledge */}
        <aside className="lg:col-span-5 space-y-6">
          {/* 1. Problem-to-Person Recommended Collaborators */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Problem-to-Person Collaborator Matches
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ranked by direct skills required to solve this problem
                </p>
              </div>
              <button
                onClick={() =>
                  navigate(
                    `/matchmaking?problemId=${encodeURIComponent(post.id)}`
                  )
                }
                className="text-xs text-blue-400 hover:underline shrink-0"
              >
                Filter All →
              </button>
            </div>

            <div className="space-y-3">
              {collaboratorMatches.map((match) => {
                const connStatus = connections.find(
                  (c) => c.userId === match.user.id
                )?.status;

                return (
                  <div
                    key={match.user.id}
                    className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          src={match.user.avatar}
                          name={match.user.name}
                          size="sm"
                          status={match.user.onlineStatus}
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 truncate">
                            {match.user.name}
                          </div>
                          <div className="text-[11px] text-blue-400 truncate">
                            {match.recommendedRoleLabel} · {match.user.role}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400 shrink-0">
                        {match.matchScore}pt Match
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">
                      {match.matchReason}
                    </p>

                    <div className="text-[11px] text-slate-400">
                      <span>Matched Problem Skills: </span>
                      <strong className="text-slate-200">
                        {match.matchedProblemSkills.join(' · ') || 'General'}
                      </strong>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/matchmaking?problemId=${encodeURIComponent(
                              post.id
                            )}&member=${match.user.id}`
                          )
                        }
                        className="text-slate-300 hover:text-white font-medium"
                      >
                        View Profile
                      </button>

                      {connStatus === 'connected' ? (
                        <button
                          onClick={() => {
                            const convId = startOrOpenConversation(
                              match.user.id
                            );
                            navigate(`/messages?conv=${convId}`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Ask for Help
                        </button>
                      ) : connStatus ? (
                        <span className="text-amber-300 font-mono text-[11px] flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Request Pending
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            sendConnectionRequest(
                              match.user.id,
                              `Hi ${match.user.name}, saw your expertise in ${match.matchedProblemSkills.slice(0, 2).join(' & ')}—could use your insights on "${post.title.slice(0, 50)}..."`
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          Connect for Problem
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Related Saved Solutions & Community Discussions */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Related Saved Solutions & Discussions
            </h2>

            {relatedData.relatedMemories.length === 0 &&
            relatedData.relatedPosts.length === 0 ? (
              <p className="text-xs text-slate-400">
                No other related discussions found in local storage yet.
              </p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {relatedData.relatedMemories.map((mem) => (
                  <button
                    key={mem.id}
                    onClick={() => navigate(`/workspace/${mem.postId}`)}
                    className="w-full text-left p-3 rounded-xl bg-emerald-950/15 hover:bg-emerald-950/25 border border-emerald-500/30 space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                      <span>Community Memory · {mem.status}</span>
                      <span>by {mem.contributorName}</span>
                    </div>
                    <div className="font-semibold text-slate-100 line-clamp-1">
                      {mem.questionTitle}
                    </div>
                    <p className="text-slate-300 line-clamp-2">
                      {mem.acceptedSolution}
                    </p>
                  </button>
                ))}

                {relatedData.relatedPosts.map((rp) => (
                  <button
                    key={rp.id}
                    onClick={() => navigate(`/workspace/${rp.id}`)}
                    className="w-full text-left p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {rp.communityName} · {rp.resolutionStatus || 'Discussion'}
                      </span>
                      <span className="font-mono">{rp.createdAt}</span>
                    </div>
                    <div className="font-semibold text-slate-200 line-clamp-1">
                      {rp.title}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
