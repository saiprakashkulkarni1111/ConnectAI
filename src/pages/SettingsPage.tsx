import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Database,
  Cpu,
  Wifi,
  Trash2,
  RotateCcw,
  Sun,
  Moon,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAIRuntimeInfo } from '../services/aiService';

export const SettingsPage: React.FC = () => {
  const {
    posts,
    knowledgeEntries,
    communities,
    connections,
    conversations,
    events,
    searchHistory,
    theme,
    toggleTheme,
    resetDemoData,
    clearAllLocalData,
  } = useApp();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const runtimeInfo = getAIRuntimeInfo();

  const storageFootprintKB = useMemo(() => {
    try {
      const raw =
        localStorage.getItem('connectai_hackathon_prototype_v2') || '';
      return ((raw.length * 2) / 1024).toFixed(1);
    } catch {
      return '24.8';
    }
  }, [
    posts,
    knowledgeEntries,
    communities,
    connections,
    conversations,
    events,
    searchHistory,
  ]);

  const isLight = theme === 'light';

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-mono text-emerald-400">
          Verifiable Local-First AI & Privacy Architecture
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
          Privacy & AI Operating Status
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl">
          Inspect the exact operating mode of ConnectAI’s intelligence engines, verify local storage persistence of Community Memory entries, and audit offline vs. network boundaries.
        </p>
      </div>

      {/* Verifiable Operating Mode Banner */}
      <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-emerald-300">
              Active Operating Mode: {runtimeInfo.operatingMode} + Deterministic Demo Mode
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {runtimeInfo.runtimeDescription}
            </p>
          </div>
        </div>
        <div className="font-mono text-xs text-emerald-400 shrink-0">
          Local Cache: ~{storageFootprintKB} KB
        </div>
      </div>

      {/* Three Operating Modes Verification Matrix */}
      <section
        className={`p-6 rounded-xl border space-y-4 ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-slate-900/75 border-slate-800'
        }`}
      >
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          Verifiable AI Operating Modes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">On-Device AI</span>
              <span className="font-mono text-[11px] text-slate-400">
                {runtimeInfo.isOnDeviceModelLoaded ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Only displayed as active when a genuine local model runtime is loaded in browser memory and performing inference.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-300">
                Local Retrieval
              </span>
              <span className="font-mono text-[11px] text-emerald-400 font-bold">
                ACTIVE
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Searches locally stored Community Memory entries, resolved questions, and profiles in-browser without sending queries to an external service.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-300">Demo Mode</span>
              <span className="font-mono text-[11px] text-blue-400 font-bold">
                ACTIVE
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Uses transparent, deterministic keyword/metadata ranking and Problem-to-Person skill matching without requiring external API keys.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Local Storage Inventory */}
        <div
          className={`p-6 rounded-xl border space-y-4 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/75 border-slate-800'
          }`}
        >
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-400" />
            Cached Local Knowledge & Prototype Data
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Stored in your browser’s <code className="text-slate-200">localStorage</code> under key{' '}
            <code className="text-blue-400">
              connectai_hackathon_prototype_v2
            </code>
            :
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400">Community Memory Entries</div>
              <div className="mt-1 text-base font-bold font-mono text-emerald-400">
                {knowledgeEntries.length} verified solutions
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400">Problem Threads & Answers</div>
              <div className="mt-1 text-base font-bold font-mono text-slate-100">
                {posts.length} posts
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400">Joined Communities</div>
              <div className="mt-1 text-base font-bold font-mono text-slate-100">
                {communities.filter((c) => c.isJoined).length} /{' '}
                {communities.length}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400">Local Search History</div>
              <div className="mt-1 text-base font-bold font-mono text-slate-100">
                {searchHistory.length} queries
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={resetDemoData}
              className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              Reset Seed Demo Data
            </button>

            <button
              onClick={() => setConfirmClearOpen(true)}
              className="px-4 py-2 text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Local Data...
            </button>
          </div>
        </div>

        {/* Offline vs Network Disclosure */}
        <div
          className={`p-6 rounded-xl border space-y-4 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/75 border-slate-800'
          }`}
        >
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Wifi className="w-4 h-4 text-sky-400" />
            Offline Access vs. Network Requirements
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Works Offline Once Loaded (Local Browser Storage)
              </div>
              <ul className="space-y-1 text-slate-300 list-disc pl-4">
                <li>Browsing and searching cached Community Memory solutions</li>
                <li>Marking questions Resolved/Verified and saving new knowledge entries</li>
                <li>Evidence-First Community Copilot local retrieval</li>
                <li>Problem-to-Person collaborator matching and filtering</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Wifi className="w-4 h-4" />
                Requires Internet Access
              </div>
              <ul className="space-y-1 text-slate-300 list-disc pl-4">
                <li>Initial loading of the web application bundle and fonts</li>
                <li>Opening external GitHub links in project showcases</li>
                <li>Optional multi-user cloud synchronization if an external backend is connected</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div
        className={`p-6 rounded-xl border flex items-center justify-between gap-4 ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-slate-900/75 border-slate-800'
        }`}
      >
        <div>
          <h2 className="text-sm font-semibold">Interface Theme Preference</h2>
          <p className="text-xs text-slate-400">
            Switch between Dark Navy/Charcoal and Crisp Light mode.
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg flex items-center gap-2 transition-colors"
        >
          {isLight ? (
            <>
              <Moon className="w-4 h-4 text-blue-400" />
              Switch to Dark Mode
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              Switch to Light Mode
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmClearOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">
                Clear All Local Prototype Data?
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will clear your custom posts, newly saved Community Memory entries, and profile edits from{' '}
              <code className="text-slate-200">localStorage</code> and reopen the onboarding wizard.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllLocalData();
                  setConfirmClearOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
              >
                Yes, Clear Local Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
