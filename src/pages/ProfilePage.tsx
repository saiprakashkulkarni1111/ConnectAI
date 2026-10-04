import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit3,
  MapPin,
  Clock,
  FolderGit2,
  Compass,
  Users,
  Bookmark,
  MessageSquare,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';
import { VerifiedSolutionBadge } from '../components/VerifiedSolutionBadge';
import { CollaborationType, ExperienceLevel } from '../types';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    communities,
    posts,
    connections,
    members,
    events,
    updateUserProfile,
    openOnboardingModal,
    theme,
  } = useApp();

  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location);
  const [skillsInput, setSkillsInput] = useState(currentUser.skills.join(', '));
  const [interestsInput, setInterestsInput] = useState(
    currentUser.interests.join(', ')
  );
  const [currentProject, setCurrentProject] = useState(
    currentUser.currentProject
  );
  const [learningGoalsInput, setLearningGoalsInput] = useState(
    currentUser.learningGoals.join(', ')
  );
  const [collabType, setCollabType] = useState<CollaborationType>(
    currentUser.collaborationType
  );
  const [expLevel, setExpLevel] = useState<ExperienceLevel>(
    currentUser.experienceLevel
  );
  const [availability, setAvailability] = useState(currentUser.availability);

  const joinedCommunities = useMemo(
    () => communities.filter((c) => c.isJoined),
    [communities]
  );

  const authoredPosts = useMemo(
    () => posts.filter((p) => p.authorId === currentUser.id),
    [posts, currentUser.id]
  );

  const savedPosts = useMemo(
    () => posts.filter((p) => p.isBookmarked),
    [posts]
  );

  const connectedMembers = useMemo(() => {
    const connectedIds = new Set(
      connections
        .filter((c) => c.status === 'connected')
        .map((c) => c.userId)
    );
    return members.filter((m) => connectedIds.has(m.id));
  }, [connections, members]);

  const registeredEvents = useMemo(
    () => events.filter((e) => e.isRegistered),
    [events]
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parseCSV = (val: string) =>
      val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    updateUserProfile({
      name: name.trim() || currentUser.name,
      role: role.trim() || currentUser.role,
      headline: headline.trim(),
      bio: bio.trim(),
      location: location.trim(),
      skills: parseCSV(skillsInput),
      interests: parseCSV(interestsInput),
      currentProject: currentProject.trim(),
      learningGoals: parseCSV(learningGoalsInput),
      collaborationType: collabType,
      experienceLevel: expLevel,
      availability: availability.trim(),
    });
    setIsEditing(false);
  };

  const isLight = theme === 'light';

  return (
    <div className="space-y-6">
      {/* Top Profile Header Card */}
      <section
        className={`p-6 sm:p-8 rounded-2xl border ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="xl"
              status="online"
            />
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="text-xs font-mono text-slate-400">
                  {currentUser.handle}
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  Active Prototype Profile
                </span>
              </div>

              <div className="text-sm font-medium text-blue-400">
                {currentUser.role} · {currentUser.experienceLevel}
              </div>

              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}
              >
                {currentUser.headline}
              </p>

              <p className="text-xs text-slate-400 leading-relaxed">
                {currentUser.bio}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {currentUser.location}
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {currentUser.availability}
                </span>
                <span>
                  Goal:{' '}
                  <strong className="text-slate-200">
                    {currentUser.collaborationType}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
            <button
              onClick={openOnboardingModal}
              className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Onboarding Wizard
            </button>
          </div>
        </div>

        {/* Live Derived Summary Metrics Row */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <div className="text-xs text-slate-400">Communities Joined</div>
            <div className="mt-0.5 text-xl font-bold font-mono tabular-nums text-blue-400">
              {joinedCommunities.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Posts Created</div>
            <div className="mt-0.5 text-xl font-bold font-mono tabular-nums text-emerald-400">
              {authoredPosts.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Connections</div>
            <div className="mt-0.5 text-xl font-bold font-mono tabular-nums text-violet-400">
              {connectedMembers.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Saved Posts</div>
            <div className="mt-0.5 text-xl font-bold font-mono tabular-nums text-sky-400">
              {savedPosts.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Events Registered</div>
            <div className="mt-0.5 text-xl font-bold font-mono tabular-nums text-amber-400">
              {registeredEvents.length}
            </div>
          </div>
        </div>
      </section>

      {/* Main Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Skills, Interests, Projects, Contributions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Skills, Interests & Learning Goals */}
          <div
            className={`p-5 rounded-xl border space-y-4 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/75 border-slate-800'
            }`}
          >
            <h2 className="text-sm font-semibold">
              Technical Skills, Interests & Learning Goals
            </h2>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 font-medium">
                  Technical Skills:{' '}
                </span>
                <span className="text-slate-200">
                  {currentUser.skills.join(' · ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Interests: </span>
                <span className="text-slate-200">
                  {currentUser.interests.join(' · ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">
                  Active Project:{' '}
                </span>
                <span className="text-blue-300">
                  {currentUser.currentProject}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">
                  Learning Goals:{' '}
                </span>
                <span className="text-slate-200">
                  {currentUser.learningGoals.join(' · ')}
                </span>
              </div>
            </div>
          </div>

          {/* Projects Showcase */}
          <div
            className={`p-5 rounded-xl border space-y-4 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/75 border-slate-800'
            }`}
          >
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-emerald-400" />
              Featured Projects ({currentUser.projects.length})
            </h2>
            <div className="space-y-3">
              {currentUser.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-100 text-sm">
                      {proj.title}
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400">
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {proj.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-slate-400">
                    <span>Stack: {proj.techStack.join(' · ')}</span>
                    {proj.repoUrl && (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Repo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contributions & Activity */}
          <div
            className={`p-5 rounded-xl border space-y-4 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/75 border-slate-800'
            }`}
          >
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Authored Discussions & Contributions ({authoredPosts.length})
            </h2>
            {authoredPosts.map((post) => {
              const hasConfirmedResolution =
                post.resolutionStatus === 'Verified' ||
                post.resolutionStatus === 'Resolved';
              return (
                <div
                  key={post.id}
                  className={`p-4 rounded-xl bg-slate-950/70 border space-y-1.5 text-xs ${
                    hasConfirmedResolution
                      ? 'border-emerald-500/40 border-l-4 border-l-emerald-500'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400">
                    <div>
                      {post.communityName} · {post.createdAt} ·{' '}
                      <span className="font-mono">{post.likes} likes</span>
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
                  <div className="font-semibold text-slate-100 text-sm">
                    {post.title}
                  </div>
                  <button
                    onClick={() => navigate(`/workspace/${post.id}`)}
                    className="text-blue-400 hover:underline font-medium"
                  >
                    View Discussion →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Communities Joined, Connections, Saved Posts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Communities Joined */}
          <div
            className={`p-5 rounded-xl border space-y-3.5 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/75 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                Communities Joined ({joinedCommunities.length})
              </h2>
              <button
                onClick={() => navigate('/communities')}
                className="text-xs text-blue-400 hover:underline"
              >
                Manage
              </button>
            </div>
            <div className="space-y-2">
              {joinedCommunities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/communities/${c.id}`)}
                  className="w-full text-left p-3 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-100">{c.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {c.category}
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    {c.memberCount.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Connections */}
          <div
            className={`p-5 rounded-xl border space-y-3.5 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/75 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                Active Connections ({connectedMembers.length})
              </h2>
              <button
                onClick={() => navigate('/matchmaking')}
                className="text-xs text-blue-400 hover:underline"
              >
                Find More
              </button>
            </div>
            <div className="space-y-2.5">
              {connectedMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      src={m.avatar}
                      name={m.name}
                      size="sm"
                      status={m.onlineStatus}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-100 truncate">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {m.role}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/messages')}
                    className="text-blue-400 hover:underline shrink-0"
                  >
                    Message
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Posts Shortcut */}
          <div
            className={`p-5 rounded-xl border space-y-3 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/75 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                Saved Posts ({savedPosts.length})
              </h2>
              <button
                onClick={() => navigate('/bookmarks')}
                className="text-xs text-blue-400 hover:underline"
              >
                View All
              </button>
            </div>
            {savedPosts.slice(0, 3).map((sp) => {
              const hasConfirmedResolution =
                sp.resolutionStatus === 'Verified' ||
                sp.resolutionStatus === 'Resolved';
              return (
                <button
                  key={sp.id}
                  onClick={() => navigate(`/?post=${sp.id}`)}
                  className="w-full text-left p-3 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs space-y-1.5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-slate-200 line-clamp-1">
                      {sp.title}
                    </div>
                    {hasConfirmedResolution && (
                      <VerifiedSolutionBadge
                        status="Verified"
                        verifiedBy={sp.verifiedBy}
                      />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {sp.authorName} · {sp.communityName}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Edit User Profile"
        >
          <form
            onSubmit={handleSaveProfile}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  Edit Profile & Matchmaking Preferences
                </h2>
                <p className="text-xs text-slate-400">
                  Changes are persisted locally and immediately update AI Matchmaking and Community recommendations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Biography
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Interests (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={interestsInput}
                    onChange={(e) => setInterestsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Current Project
                  </label>
                  <input
                    type="text"
                    value={currentProject}
                    onChange={(e) => setCurrentProject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Learning Goals (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={learningGoalsInput}
                    onChange={(e) => setLearningGoalsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Collaboration Goal
                  </label>
                  <select
                    value={collabType}
                    onChange={(e) =>
                      setCollabType(e.target.value as CollaborationType)
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="Hackathon Teammates">
                      Hackathon Teammates
                    </option>
                    <option value="Project Collaboration">
                      Project Collaboration
                    </option>
                    <option value="Mentorship">Mentorship</option>
                    <option value="Study Partners">Study Partners</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Research & Papers">Research & Papers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Availability
                  </label>
                  <input
                    type="text"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
              >
                Save Profile Locally
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
