import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Sliders,
  Check,
  Bookmark,
  MessageSquare,
  UserPlus,
  X,
  Info,
  Cpu,
  Wrench,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  computeMatchmakingResults,
  computeProblemToPersonMatches,
  extractProblemSkills,
  getAIRuntimeInfo,
} from '../services/aiService';
import {
  CollaborationType,
  ExperienceLevel,
  MatchFilterMode,
  ProblemRoleFilter,
  User,
} from '../types';
import { Avatar } from '../components/Avatar';

const ROLE_FILTERS: { id: ProblemRoleFilter; label: string }[] = [
  { id: 'all', label: 'All Problem Matches' },
  { id: 'expert', label: 'Technical Expert' },
  { id: 'mentor', label: 'Mentor' },
  { id: 'teammate', label: 'Hackathon / Project Teammate' },
  { id: 'study_partner', label: 'Study Partner' },
];

const GENERAL_FILTER_MODES: { id: MatchFilterMode; label: string }[] = [
  { id: 'all', label: 'All Recommendations' },
  { id: 'similar_interests', label: 'Similar Technical Interests' },
  { id: 'complementary_skills', label: 'Complementary Skills' },
  { id: 'project_collab', label: 'Project Collaboration' },
  { id: 'mentorship', label: 'Mentorship' },
  { id: 'study_partners', label: 'Study Partners' },
  { id: 'hackathon_teammates', label: 'Hackathon Teammates' },
];

export const AIMatchmaking: React.FC = () => {
  const {
    currentUser,
    preferences,
    posts,
    members,
    connections,
    updatePreferences,
    toggleSaveMember,
    sendConnectionRequest,
    startOrOpenConversation,
    theme,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const problemIdParam = searchParams.get('problemId');
  const skillsParam = searchParams.get('skills');
  const memberParamId = searchParams.get('member');

  // Mode: 'problem' (Problem-to-Person Matching) vs 'profile' (General Profile Similarity)
  const [matchMode, setMatchMode] = useState<'problem' | 'profile'>('problem');

  // Problem-to-Person state
  const questionPosts = useMemo(
    () => posts.filter((p) => p.type === 'question'),
    [posts]
  );

  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    problemIdParam || questionPosts[0]?.id || 'custom'
  );
  const [customProblemTitle, setCustomProblemTitle] = useState(
    'Resolving PyTorch + ONNX Runtime + NumPy 2.x dependency conflicts'
  );
  const [customSkillsInput, setCustomSkillsInput] = useState(
    skillsParam || 'Python, uv, Poetry, PyTorch, ONNX, Docker'
  );
  const [roleFilter, setRoleFilter] = useState<ProblemRoleFilter>('all');

  // General Profile Matchmaking state
  const [filterMode, setFilterMode] = useState<MatchFilterMode>('all');
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [showPrefEditor, setShowPrefEditor] = useState(false);

  const [skillsText, setSkillsText] = useState(preferences.skills.join(', '));
  const [interestsText, setInterestsText] = useState(
    preferences.interests.join(', ')
  );
  const [currentProjects, setCurrentProjects] = useState(
    preferences.currentProjects
  );
  const [learningGoalsText, setLearningGoalsText] = useState(
    preferences.learningGoals.join(', ')
  );
  const [collabType, setCollabType] = useState<CollaborationType>(
    preferences.collaborationType
  );
  const [expLevel, setExpLevel] = useState<ExperienceLevel>(
    preferences.experienceLevel
  );
  const [availability, setAvailability] = useState(preferences.availability);

  useEffect(() => {
    if (problemIdParam) {
      setMatchMode('problem');
      setSelectedProblemId(problemIdParam);
    } else if (skillsParam) {
      setMatchMode('problem');
      setSelectedProblemId('custom');
      setCustomSkillsInput(skillsParam);
    }
  }, [problemIdParam, skillsParam]);

  useEffect(() => {
    if (memberParamId) {
      const found = members.find((m) => m.id === memberParamId);
      if (found) setSelectedProfile(found);
    }
  }, [memberParamId, members]);

  const activeProblemPost = useMemo(
    () => questionPosts.find((p) => p.id === selectedProblemId),
    [questionPosts, selectedProblemId]
  );

  const activeProblemPayload = useMemo(() => {
    if (selectedProblemId !== 'custom' && activeProblemPost) {
      const extracted = extractProblemSkills(
        activeProblemPost.title,
        activeProblemPost.content,
        activeProblemPost.tags,
        activeProblemPost.requiredSkills || []
      );
      return {
        title: activeProblemPost.title,
        description: activeProblemPost.content,
        requiredSkills: extracted,
        tags: activeProblemPost.tags,
      };
    }
    const parsedSkills = customSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      title: customProblemTitle,
      description: customProblemTitle,
      requiredSkills: parsedSkills,
      tags: parsedSkills,
    };
  }, [
    selectedProblemId,
    activeProblemPost,
    customProblemTitle,
    customSkillsInput,
  ]);

  const problemMatches = useMemo(() => {
    return computeProblemToPersonMatches(
      activeProblemPayload,
      members,
      roleFilter
    );
  }, [activeProblemPayload, members, roleFilter]);

  const generalMatchResults = useMemo(() => {
    return computeMatchmakingResults(preferences, members, filterMode);
  }, [preferences, members, filterMode]);

  const runtimeInfo = getAIRuntimeInfo();

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const parseList = (str: string) =>
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    updatePreferences({
      skills: parseList(skillsText),
      interests: parseList(interestsText),
      currentProjects: currentProjects.trim(),
      learningGoals: parseList(learningGoalsText),
      collaborationType: collabType,
      experienceLevel: expLevel,
      availability: availability.trim(),
    });
    setShowPrefEditor(false);
  };

  const getConnectionStatus = (userId: string) => {
    return connections.find((c) => c.userId === userId)?.status || null;
  };

  const isLight = theme === 'light';

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-blue-400">
              Core Differentiator · Problem-to-Person & Profile Matching
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-emerald-400">
              <Cpu className="w-3.5 h-3.5" />
              {runtimeInfo.matchmakingModeLabel}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            AI Collaborator Matchmaking
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Find someone to help solve a specific technical problem based on required skills and shipped projects, or match based on general profile preferences.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start">
          <button
            onClick={() => setMatchMode('problem')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              matchMode === 'problem'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Problem-to-Person Matching
          </button>
          <button
            onClick={() => setMatchMode('profile')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              matchMode === 'profile'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            General Profile Matching
          </button>
        </div>
      </div>

      {matchMode === 'problem' ? (
        <>
          {/* Problem Selector & Required Skills Extractor Box */}
          <section
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-7">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select a Community Problem or Specify Custom Technical Requirements
                </label>
                <select
                  value={selectedProblemId}
                  onChange={(e) => setSelectedProblemId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {questionPosts.map((qp) => (
                    <option key={qp.id} value={qp.id}>
                      [{qp.resolutionStatus || 'Open'}] {qp.title}
                    </option>
                  ))}
                  <option value="custom">
                    Custom Technical Problem / Required Skills...
                  </option>
                </select>
              </div>

              <div className="lg:col-span-5 flex items-center justify-end gap-2">
                {activeProblemPost && (
                  <button
                    onClick={() =>
                      navigate(`/workspace/${activeProblemPost.id}`)
                    }
                    className="px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 rounded-xl transition-colors"
                  >
                    Open Problem Workspace →
                  </button>
                )}
              </div>
            </div>

            {selectedProblemId === 'custom' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Problem Description
                  </label>
                  <input
                    type="text"
                    value={customProblemTitle}
                    onChange={(e) => setCustomProblemTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Required Technical Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={customSkillsInput}
                    onChange={(e) => setCustomSkillsInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                <div className="text-slate-400">
                  <strong className="text-slate-200">
                    Extracted Skills Required for Problem:
                  </strong>{' '}
                  <span className="text-blue-300 font-medium">
                    {activeProblemPayload.requiredSkills.join(' · ')}
                  </span>
                </div>
                <p className="text-slate-400 line-clamp-2">
                  {activeProblemPayload.description}
                </p>
              </div>
            )}
          </section>

          {/* Role Filters: Mentor, Teammate, Technical Expert, Study Partner */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {ROLE_FILTERS.map((rf) => (
              <button
                key={rf.id}
                onClick={() => setRoleFilter(rf.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  roleFilter === rf.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>

          {/* Problem-to-Person Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {problemMatches.map((pm) => {
              const connStatus = getConnectionStatus(pm.user.id);
              const isSaved = (currentUser.savedMemberIds || []).includes(
                pm.user.id
              );

              return (
                <div
                  key={pm.user.id}
                  className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-colors ${
                    isLight
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-900/75 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={pm.user.avatar}
                          name={pm.user.name}
                          size="lg"
                          status={pm.user.onlineStatus}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h2 className="text-base font-semibold truncate">
                              {pm.user.name}
                            </h2>
                            <span aria-hidden="true" className="text-slate-500">
                              ·
                            </span>
                            <span className="text-xs font-semibold text-blue-400">
                              {pm.recommendedRoleLabel}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {pm.user.role} · {pm.user.location}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {pm.user.availability}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold font-mono tabular-nums text-emerald-400">
                          {pm.matchScore}pt
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Deterministic Rank
                        </div>
                      </div>
                    </div>

                    {/* Transparent Reason for Match */}
                    <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/25 text-xs space-y-1.5">
                      <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        Why this person can help solve this problem:
                      </div>
                      <p className="text-slate-200 leading-relaxed">
                        {pm.matchReason}
                      </p>
                    </div>

                    {/* Matched Problem Skills, Complementary Skills, & Relevant Projects */}
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-400">
                          Matched Problem Skills:{' '}
                        </span>
                        <strong className="text-emerald-300">
                          {pm.matchedProblemSkills.length > 0
                            ? pm.matchedProblemSkills.join(' · ')
                            : 'General Architecture'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">
                          Complementary Skills:{' '}
                        </span>
                        <span className="text-slate-300">
                          {pm.complementarySkills.join(' · ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">
                          Relevant Project:{' '}
                        </span>
                        <span className="text-slate-200 font-medium">
                          {pm.user.currentProject}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedProfile(pm.user)}
                      className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                    >
                      View Profile
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSaveMember(pm.user.id)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                          isSaved
                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            isSaved ? 'fill-blue-400 text-blue-400' : ''
                          }`}
                        />
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      {connStatus === 'connected' ? (
                        <button
                          onClick={() => {
                            const convId = startOrOpenConversation(pm.user.id);
                            navigate(`/messages?conv=${convId}`);
                          }}
                          className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Message
                        </button>
                      ) : connStatus ? (
                        <button
                          onClick={() => navigate('/messages')}
                          className="px-3.5 py-2 text-xs font-medium bg-slate-800 text-amber-300 border border-amber-500/30 rounded-lg flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Pending
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            sendConnectionRequest(
                              pm.user.id,
                              `Hi ${pm.user.name}, matched with your profile for "${activeProblemPayload.title.slice(0, 50)}..."`
                            )
                          }
                          className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* General Profile-to-Profile Matchmaking View */
        <>
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Matching against your profile: <strong>{preferences.collaborationType}</strong> · Skills: {preferences.skills.slice(0, 4).join(', ')}
            </div>
            <button
              onClick={() => setShowPrefEditor(!showPrefEditor)}
              className="px-3.5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              {showPrefEditor ? 'Hide Preferences' : 'Edit Profile Preferences'}
            </button>
          </div>

          {showPrefEditor && (
            <form
              onSubmit={handleSavePreferences}
              className="p-5 rounded-xl border border-slate-700 bg-slate-900 space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">
                    Technical Skills
                  </label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Interests</label>
                  <input
                    type="text"
                    value={interestsText}
                    onChange={(e) => setInterestsText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg"
                >
                  Save & Recalculate
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {GENERAL_FILTER_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setFilterMode(m.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  filterMode === m.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {generalMatchResults.map(({ user, compatibilityScore, explanation }) => {
              const connStatus = getConnectionStatus(user.id);
              return (
                <div
                  key={user.id}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/75 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar}
                          name={user.name}
                          size="lg"
                          status={user.onlineStatus}
                        />
                        <div>
                          <h3 className="text-base font-semibold">
                            {user.name}
                          </h3>
                          <div className="text-xs text-slate-400">
                            {user.role} · {user.collaborationType}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-emerald-400 font-bold">
                        {compatibilityScore}pt
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {explanation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedProfile(user)}
                      className="px-3 py-1.5 text-xs bg-slate-800 text-slate-200 rounded-lg"
                    >
                      View Profile
                    </button>
                    {connStatus === 'connected' ? (
                      <button
                        onClick={() => {
                          const convId = startOrOpenConversation(user.id);
                          navigate(`/messages?conv=${convId}`);
                        }}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg"
                      >
                        Message
                      </button>
                    ) : (
                      <button
                        onClick={() => sendConnectionRequest(user.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Avatar
                  src={selectedProfile.avatar}
                  name={selectedProfile.name}
                  size="xl"
                  status={selectedProfile.onlineStatus}
                />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {selectedProfile.name}
                  </h2>
                  <p className="text-xs text-blue-400 font-medium">
                    {selectedProfile.role}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedProfile.location} · {selectedProfile.availability}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedProfile(null);
                  if (memberParamId) setSearchParams({});
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                {selectedProfile.headline} {selectedProfile.bio}
              </p>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">
                  Current Project: {selectedProfile.currentProject}
                </div>
                <div className="text-slate-400">
                  Skills: {selectedProfile.skills.join(' · ')}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  const convId = startOrOpenConversation(selectedProfile.id);
                  setSelectedProfile(null);
                  navigate(`/messages?conv=${convId}`);
                }}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
