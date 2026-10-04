import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Clock,
  ArrowRight,
  FileText,
  Users,
  Compass,
  FolderGit2,
  Database,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { performSemanticSearch, getAIRuntimeInfo } from '../services/aiService';

const SUGGESTED_QUERIES = [
  'Python dependency conflicts',
  'Deploying ML models',
  'React performance',
  'Firebase authentication',
  'ESP32 sensor integration',
  'RAG vector search',
];

export const SearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    initialSearchQuery,
    posts,
    knowledgeEntries,
    members,
    communities,
    events,
    searchHistory,
    addSearchQueryToHistory,
    clearSearchHistory,
  } = useApp();

  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<
    | 'all'
    | 'memory'
    | 'resolved_question'
    | 'post'
    | 'member'
    | 'community'
    | 'project'
  >('all');

  useEffect(() => {
    if (isSearchModalOpen && initialSearchQuery) {
      setQuery(initialSearchQuery);
    }
  }, [isSearchModalOpen, initialSearchQuery]);

  const runtimeInfo = getAIRuntimeInfo();

  const results = useMemo(() => {
    return performSemanticSearch(
      query,
      typeFilter,
      posts,
      members,
      communities,
      events,
      knowledgeEntries
    );
  }, [
    query,
    typeFilter,
    posts,
    members,
    communities,
    events,
    knowledgeEntries,
  ]);

  if (!isSearchModalOpen) return null;

  const handleSelectResult = (url: string) => {
    if (query.trim()) {
      addSearchQueryToHistory(query.trim());
    }
    setIsSearchModalOpen(false);
    navigate(url);
  };

  const highlightText = (text: string, terms: string[]) => {
    if (!terms.length) return text;
    const escaped = terms
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .filter((t) => t.length > 1);
    if (!escaped.length) return text;
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-blue-500/25 text-blue-200 rounded px-0.5 font-medium"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'memory':
        return <Database className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'resolved_question':
        return <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'post':
        return <FileText className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'project':
        return <FolderGit2 className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'member':
        return <Users className="w-4 h-4 text-violet-400 shrink-0" />;
      case 'community':
        return <Compass className="w-4 h-4 text-sky-400 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Global Knowledge Search"
    >
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Verified Solutions, Resolved Questions, Discussions, Collaborators..."
            autoFocus
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchModalOpen(false)}
            aria-label="Close search"
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs & Engine Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-1 overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All Prioritized' },
                { id: 'memory', label: 'Verified Solutions' },
                { id: 'resolved_question', label: 'Resolved Questions' },
                { id: 'post', label: 'Discussions' },
                { id: 'member', label: 'Collaborators' },
                { id: 'community', label: 'Communities' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  typeFilter === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {runtimeInfo.searchModeLabel}
          </span>
        </div>

        {/* Results or Suggestions */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="space-y-5">
              <div>
                <div className="text-xs font-medium text-slate-400 mb-2.5">
                  Search Technical Problems & Verified Solutions
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUERIES.map((sq) => (
                    <button
                      key={sq}
                      onClick={() => setQuery(sq)}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 rounded-lg transition-colors"
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              </div>

              {searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">
                      Recent Local Searches
                    </span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Clear History
                    </button>
                  </div>
                  <div className="space-y-1">
                    {searchHistory.map((item) => (
                      <button
                        key={item}
                        onClick={() => setQuery(item)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/60 rounded-lg transition-colors text-left"
                      >
                        <span className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {item}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-medium text-slate-300">
                No local records match “{query}”
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try searching for Python dependency conflicts, React performance, Deploying ML models, Firebase authentication, ESP32, or RAG.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsSearchModalOpen(false);
                    navigate(`/copilot?q=${encodeURIComponent(query)}`);
                  }}
                  className="px-3.5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                >
                  Ask Community Copilot
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Found <strong className="text-slate-200 font-mono">{results.length}</strong> records (Verified Solutions & Resolved Questions prioritized first)
                </span>
              </div>
              {results.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelectResult(item.url)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors group ${
                    item.type === 'memory'
                      ? 'bg-emerald-950/15 hover:bg-emerald-950/25 border-emerald-500/35'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {getIconForType(item.type)}
                      <span className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                        {highlightText(item.title, item.matchedTerms)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.resolutionStatus && (
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {item.resolutionStatus}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-slate-400">
                        Rank: {item.score}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {item.subtitle}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {highlightText(item.description, item.matchedTerms)}
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span className="text-blue-300/90 font-mono">
                      {item.relevanceExplanation}
                    </span>
                    <span>Open Source Record →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
