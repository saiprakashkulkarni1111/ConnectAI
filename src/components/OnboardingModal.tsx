import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CollaborationType } from '../types';

const AVAILABLE_INTERESTS = [
  'AI Agents',
  'On-Device ML',
  'Python',
  'Web Performance',
  'Computer Vision',
  'Open Source',
  'Hackathons',
  'Cloud Computing',
  'Cybersecurity',
  'UI/UX Design',
  'Robotics & IoT',
  'Startup Building',
];

const AVAILABLE_SKILLS = [
  'Python',
  'TypeScript',
  'React',
  'PyTorch',
  'FastAPI',
  'LangGraph',
  'WebGPU',
  'Rust',
  'Docker',
  'Tailwind CSS',
  'Figma',
  'C++',
  'ROS2',
  'Kubernetes',
];

const COLLAB_TYPES: CollaborationType[] = [
  'Hackathon Teammates',
  'Project Collaboration',
  'Mentorship',
  'Study Partners',
  'Open Source',
  'Research & Papers',
];

export const OnboardingModal: React.FC = () => {
  const {
    currentUser,
    isOnboardingOpen,
    hasCompletedOnboarding,
    completeOnboarding,
    skipOnboardingForDemo,
  } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    currentUser.interests
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    currentUser.skills
  );
  const [collabType, setCollabType] = useState<CollaborationType>(
    currentUser.collaborationType
  );

  if (!isOnboardingOpen && hasCompletedOnboarding) return null;

  const toggleItem = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeOnboarding({
      name,
      role,
      interests: selectedInterests,
      skills: selectedSkills,
      collaborationType: collabType,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="ConnectAI Onboarding"
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-gradient-to-b from-blue-950/30 to-transparent">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-mono text-blue-400">
              ConnectAI · Personalization & Local Matchmaking Setup
            </span>
            <button
              type="button"
              onClick={skipOnboardingForDemo}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
            >
              Skip for Demo (Load Sample Account)
            </button>
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight text-balance">
            “Your community should understand what you are building.”
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Customize your profile to personalize your community feed, local AI matchmaking scores, and recommended events—or skip directly to the pre-configured hackathon demo account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                1. Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Aarav Mehta"
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Professional Role / Headline
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Senior AI Systems Engineer"
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              2. Choose Your Technical Interests ({selectedInterests.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((interest) => {
                const active = selectedInterests.includes(interest);
                return (
                  <button
                    type="button"
                    key={interest}
                    onClick={() =>
                      toggleItem(interest, selectedInterests, setSelectedInterests)
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                      active
                        ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              3. Select Your Core Technical Skills ({selectedSkills.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() =>
                      toggleItem(skill, selectedSkills, setSelectedSkills)
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                      active
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              4. Primary Collaboration Goal
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLLAB_TYPES.map((ct) => (
                <button
                  type="button"
                  key={ct}
                  onClick={() => setCollabType(ct)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors ${
                    collabType === ct
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {ct}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Stored 100% locally in your browser. Zero cloud tracking.</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={skipOnboardingForDemo}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
              >
                Skip for Demo
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Continue to Personalized Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
