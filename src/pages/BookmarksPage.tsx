import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, ExternalLink, Users, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';
import { VerifiedSolutionBadge } from '../components/VerifiedSolutionBadge';

export const BookmarksPage: React.FC = () => {
  const {
    posts,
    members,
    currentUser,
    toggleBookmarkPost,
    toggleSaveMember,
    theme,
  } = useApp();

  const navigate = useNavigate();
  const [tab, setTab] = useState<'posts' | 'people'>('posts');

  const bookmarkedPosts = posts.filter((p) => p.isBookmarked);
  const savedMembers = members.filter((m) =>
    (currentUser.savedMemberIds || []).includes(m.id)
  );

  const isLight = theme === 'light';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-blue-400">
            Personal Knowledge Library
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
            Saved Bookmarks
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Quickly revisit bookmarked technical discussions, project showcases, and saved collaborator profiles.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 self-start">
          <button
            onClick={() => setTab('posts')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              tab === 'posts'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Saved Posts ({bookmarkedPosts.length})
          </button>
          <button
            onClick={() => setTab('people')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              tab === 'people'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Saved Collaborators ({savedMembers.length})
          </button>
        </div>
      </div>

      {tab === 'posts' ? (
        bookmarkedPosts.length === 0 ? (
          <div className="p-10 rounded-xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
            <Bookmark className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-medium text-slate-300">
              No bookmarked posts yet.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click the Save icon on any post in the Home Feed to keep technical benchmarks and discussions handy.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg"
            >
              Browse Home Feed
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarkedPosts.map((post) => {
              const hasConfirmedResolution =
                post.resolutionStatus === 'Verified' ||
                post.resolutionStatus === 'Resolved';
              return (
                <div
                  key={post.id}
                  className={`p-5 rounded-xl border space-y-3 ${
                    hasConfirmedResolution
                      ? isLight
                        ? 'bg-white border-emerald-500/50 border-l-4 border-l-emerald-500'
                        : 'bg-slate-900/85 border-emerald-500/40 border-l-4 border-l-emerald-500'
                      : isLight
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-900/75 border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <Avatar
                        src={post.authorAvatar}
                        name={post.authorName}
                        size="xs"
                      />
                      <span className="font-semibold text-slate-200">
                        {post.authorName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-blue-400">{post.communityName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{post.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <VerifiedSolutionBadge
                        status={
                          hasConfirmedResolution
                            ? 'Verified'
                            : post.resolutionStatus
                        }
                        verifiedBy={post.verifiedBy}
                      />
                      <button
                        onClick={() => toggleBookmarkPost(post.id)}
                        className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>

                <h2 className="text-base font-semibold">{post.title}</h2>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {post.content}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Topics: {post.tags.join(' · ')}
                  </span>
                  <button
                    onClick={() => navigate(`/workspace/${post.id}`)}
                    className="text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Open Problem Workspace</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )
      ) : savedMembers.length === 0 ? (
        <div className="p-10 rounded-xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-medium text-slate-300">
            No saved collaborators yet.
          </p>
          <button
            onClick={() => navigate('/matchmaking')}
            className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg"
          >
            Explore AI Matchmaking
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedMembers.map((member) => (
            <div
              key={member.id}
              className={`p-5 rounded-xl border flex flex-col justify-between gap-4 ${
                isLight
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-900/75 border-slate-800'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={member.avatar}
                      name={member.name}
                      size="md"
                      status={member.onlineStatus}
                    />
                    <div>
                      <h3 className="text-sm font-semibold">{member.name}</h3>
                      <p className="text-xs text-blue-400">{member.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSaveMember(member.id)}
                    className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
                <p className="text-xs text-slate-300">{member.headline}</p>
                <div className="text-xs text-slate-400">
                  Skills: {member.skills.join(' · ')}
                </div>
              </div>
              <button
                onClick={() => navigate(`/matchmaking?member=${member.id}`)}
                className="self-start text-xs text-blue-400 hover:underline font-medium"
              >
                View Match Breakdown →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
