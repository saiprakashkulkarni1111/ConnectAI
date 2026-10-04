import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  MessageSquare,
  Calendar,
  ArrowLeft,
  Check,
  Plus,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getRecommendedCommunities } from '../services/aiService';
import { Avatar } from '../components/Avatar';
import { VerifiedSolutionBadge } from '../components/VerifiedSolutionBadge';

export const Communities: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    communities,
    preferences,
    posts,
    members,
    events,
    toggleJoinCommunity,
    toggleLikePost,
    toggleEventRegistration,
    theme,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const isLight = theme === 'light';

  const categories = useMemo(() => {
    const cats = new Set(communities.map((c) => c.category));
    return ['All', ...Array.from(cats)];
  }, [communities]);

  const recommendationsMap = useMemo(() => {
    const recs = getRecommendedCommunities(preferences, communities);
    const map: Record<string, { reason: string; score: number }> = {};
    recs.forEach((r) => {
      map[r.community.id] = { reason: r.reason, score: r.matchScore };
    });
    return map;
  }, [preferences, communities]);

  const filteredCommunities = useMemo(() => {
    return communities.filter((c) => {
      if (selectedCategory !== 'All' && c.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [communities, selectedCategory, searchQuery]);

  // If viewing a specific Community Detail Page (/communities/:id)
  if (id) {
    const community = communities.find((c) => c.id === id);
    if (!community) {
      return (
        <div className="p-8 text-center space-y-3">
          <p className="text-sm text-slate-300">Community not found.</p>
          <button
            onClick={() => navigate('/communities')}
            className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg"
          >
            Back to Communities
          </button>
        </div>
      );
    }

    const communityPosts = posts.filter((p) => p.communityId === community.id);
    const communityMembers = members.filter((m) =>
      m.joinedCommunityIds.includes(community.id)
    );
    const communityEvents = events.filter(
      (e) => e.hostCommunityId === community.id
    );
    const recInfo = recommendationsMap[community.id];

    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/communities')}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Communities
        </button>

        {/* Community Banner Header */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border border-slate-800 bg-gradient-to-r ${community.bannerGradient}`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-blue-300">
                <span>{community.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">
                  {community.memberCount.toLocaleString()} members
                </span>
                <span aria-hidden="true">·</span>
                <span>{community.recentActivity}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {community.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {community.longDescription}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                <span className="text-slate-400">Topics:</span>
                {community.tags.map((t, i) => (
                  <React.Fragment key={t}>
                    {i > 0 && <span aria-hidden="true">·</span>}
                    <span>{t}</span>
                  </React.Fragment>
                ))}
              </div>
              {recInfo && (
                <div className="pt-1 text-xs text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{recInfo.reason}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              <button
                onClick={() => toggleJoinCommunity(community.id)}
                className={`px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  community.isJoined
                    ? 'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {community.isJoined ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Joined Community
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Join Community
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Community Content Grid: Posts, Members, Events */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Community Discussions ({communityPosts.length})
            </h2>

            {communityPosts.length === 0 ? (
              <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/50 text-center space-y-2">
                <p className="text-sm text-slate-300">
                  No discussions posted in {community.name} yet.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg"
                >
                  Create First Post on Feed
                </button>
              </div>
            ) : (
              communityPosts.map((post) => {
                const hasConfirmedResolution =
                  post.resolutionStatus === 'Verified' ||
                  post.resolutionStatus === 'Resolved';
                return (
                  <div
                    key={post.id}
                    className={`p-5 rounded-xl border space-y-2.5 ${
                      hasConfirmedResolution
                        ? 'bg-slate-900/85 border-emerald-500/40 border-l-4 border-l-emerald-500'
                        : 'bg-slate-900/75 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
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
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{post.createdAt}</span>
                      </div>
                      <VerifiedSolutionBadge
                        status={
                          hasConfirmedResolution
                            ? 'Verified'
                            : post.resolutionStatus
                        }
                        verifiedBy={post.verifiedBy}
                      />
                    </div>
                    <h3 className="text-base font-semibold text-slate-100">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                      <button
                        onClick={() => toggleLikePost(post.id)}
                        className={
                          post.isLiked
                            ? 'text-rose-400 font-medium'
                            : 'hover:text-slate-200'
                        }
                      >
                        {post.likes} Likes
                      </button>
                      <button
                        onClick={() => navigate(`/workspace/${post.id}`)}
                        className="text-blue-400 hover:underline font-medium"
                      >
                        Open Problem Workspace ({post.comments.length} answers) →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="lg:col-span-4 space-y-5">
            {/* Active Community Members */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/75 space-y-3.5">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                Active Members ({communityMembers.length})
              </h3>
              <div className="space-y-3">
                {communityMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        src={m.avatar}
                        name={m.name}
                        size="sm"
                        status={m.onlineStatus}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {m.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {m.role}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/matchmaking?member=${m.id}`)}
                      className="text-xs text-blue-400 hover:underline shrink-0"
                    >
                      Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Community Events */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/75 space-y-3.5">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Upcoming Community Events
              </h3>
              {communityEvents.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No upcoming events scheduled specifically for this community.
                </p>
              ) : (
                communityEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2"
                  >
                    <div className="text-xs font-semibold text-slate-100">
                      {evt.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {evt.date} · {evt.time}
                    </div>
                    <button
                      onClick={() => toggleEventRegistration(evt.id)}
                      className={`w-full py-1.5 text-xs font-medium rounded-md transition-colors ${
                        evt.isRegistered
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      {evt.isRegistered ? 'Registered (Cancel)' : 'Register for Demo Event'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Discover Communities Directory View
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-blue-400">
            Interest-Based Knowledge Hubs
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
            Discover Communities
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Join focused engineering, design, and research communities. Recommendations are computed locally based on your skills ({preferences.skills.slice(0, 3).join(', ')}) and interests.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter communities by keyword..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Communities Grid */}
      {filteredCommunities.length === 0 ? (
        <div className="p-10 rounded-xl border border-slate-800 bg-slate-900/40 text-center space-y-2">
          <p className="text-sm font-medium text-slate-300">
            No communities match “{searchQuery}”
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCommunities.map((comm) => {
            const rec = recommendationsMap[comm.id];
            return (
              <div
                key={comm.id}
                className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-900/75 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <button
                          onClick={() => navigate(`/communities/${comm.id}`)}
                          className="text-base font-semibold hover:text-blue-400 transition-colors text-left"
                        >
                          {comm.name}
                        </button>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <span>{comm.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {comm.memberCount.toLocaleString()} members
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{comm.recentActivity}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleJoinCommunity(comm.id)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                        comm.isJoined
                          ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                          : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      {comm.isJoined ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Joined
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          Join
                        </>
                      )}
                    </button>
                  </div>

                  <p
                    className={`text-xs leading-relaxed ${
                      isLight ? 'text-slate-600' : 'text-slate-300'
                    }`}
                  >
                    {comm.description}
                  </p>

                  {/* Unboxed Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                    <span className="text-slate-500">Focus:</span>
                    {comm.tags.map((t, idx) => (
                      <React.Fragment key={t}>
                        {idx > 0 && <span aria-hidden="true">·</span>}
                        <span>{t}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Personalized Recommendation Explanation & Action Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  <span className="text-blue-300/90 truncate">
                    {rec?.reason}
                  </span>
                  <button
                    onClick={() => navigate(`/communities/${comm.id}`)}
                    className="text-blue-400 hover:underline font-medium shrink-0"
                  >
                    Explore Hub →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
