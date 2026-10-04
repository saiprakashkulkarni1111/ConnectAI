import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  RotateCcw,
  ExternalLink,
  FileText,
  Users,
  Compass,
  ShieldCheck,
  Sparkles,
  Database,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAIRuntimeInfo } from '../services/aiService';
import { Avatar } from '../components/Avatar';

const SUGGESTED_QUESTIONS = [
  'How to resolve Python dependency conflicts with PyTorch and ONNX?',
  'How do we fix FastAPI + PyTorch container OOM kills when deploying ML models?',
  'What are the verified solutions to React streaming performance issues?',
  'How to fix Firebase authentication popup errors in preview environments?',
  'How to fix ESP32 I2C bus lockup and ADC2 Wi-Fi conflicts?',
  'How to prevent hallucinated citations in RAG vector search?',
];

export const KnowledgeAssistant: React.FC = () => {
  const {
    copilotMessages,
    sendCopilotQuery,
    clearCopilotHistory,
    posts,
    knowledgeEntries,
    members,
    sendConnectionRequest,
    theme,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQueryParam = searchParams.get('q');

  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const runtimeInfo = getAIRuntimeInfo();

  useEffect(() => {
    if (initialQueryParam && initialQueryParam.trim()) {
      sendCopilotQuery(initialQueryParam.trim());
      setSearchParams({});
    }
  }, [initialQueryParam]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendCopilotQuery(input.trim());
    setInput('');
  };

  const renderFormattedContent = (text: string) => {
    const paragraphs = text.split('\n\n');
    return paragraphs.map((para, pIdx) => {
      const parts = para.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <p key={pIdx} className="leading-relaxed whitespace-pre-line">
          {parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={idx} className="font-semibold text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <em key={idx} className="text-blue-300 not-italic">
                  {part.slice(1, -1)}
                </em>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  const isLight = theme === 'light';

  return (
    <div className="space-y-6">
      {/* Header & Verifiable Mode Status */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-blue-400">
              Evidence-First Knowledge Assistant
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="font-mono text-emerald-400">
              Operating Mode: {runtimeInfo.copilotModeLabel}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Community Copilot
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
            Searches <strong className="text-slate-200 font-mono">{knowledgeEntries.length}</strong> Verified Community Memory entries, <strong className="text-slate-200 font-mono">{posts.length}</strong> problem threads, and <strong className="text-slate-200 font-mono">{members.length}</strong> collaborator profiles. Never fabricates citations or technical solutions.
          </p>
        </div>

        <button
          onClick={clearCopilotHistory}
          className="self-start lg:self-auto px-3.5 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Session Chat
        </button>
      </div>

      {/* Main Copilot Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div
          className={`lg:col-span-8 rounded-2xl border flex flex-col h-[680px] overflow-hidden ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {copilotMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1 px-1">
                    {!isUser && <Bot className="w-3.5 h-3.5 text-blue-400" />}
                    <span className="font-semibold text-slate-300">
                      {isUser ? 'You' : 'Community Copilot'}
                    </span>
                    {msg.modeLabel && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-emerald-400">
                          {msg.modeLabel}
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm space-y-3.5 ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950/90 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {renderFormattedContent(msg.content)}
                    </div>

                    {/* 1. Clickable Source References */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-3 border-t border-slate-800 space-y-2">
                        <div className="text-[11px] font-mono text-slate-400">
                          Supporting Source References ({msg.sources.length}):
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.sources.map((src) => (
                            <button
                              key={`${src.type}-${src.id}`}
                              onClick={() => navigate(src.url)}
                              className="w-full text-left p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800/90 border border-slate-800 transition-colors flex items-start justify-between gap-3 group"
                            >
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:underline truncate">
                                  {src.type === 'memory' && (
                                    <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  )}
                                  {src.type === 'post' && (
                                    <FileText className="w-3.5 h-3.5 shrink-0" />
                                  )}
                                  {src.type === 'member' && (
                                    <Users className="w-3.5 h-3.5 shrink-0" />
                                  )}
                                  {src.type === 'community' && (
                                    <Compass className="w-3.5 h-3.5 shrink-0" />
                                  )}
                                  <span className="truncate">{src.title}</span>
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {src.subtitle}
                                </div>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0 mt-0.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Recommended Collaborator for This Problem */}
                    {msg.recommendedCollaborator && (
                      <div className="pt-3 border-t border-slate-800">
                        <div className="text-[11px] font-mono text-violet-400 mb-1.5">
                          Recommended Collaborator for This Problem:
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar
                              src={msg.recommendedCollaborator.user.avatar}
                              name={msg.recommendedCollaborator.user.name}
                              size="sm"
                              status={
                                msg.recommendedCollaborator.user.onlineStatus
                              }
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-100 truncate">
                                {msg.recommendedCollaborator.user.name} ·{' '}
                                <span className="text-violet-300 font-normal">
                                  {msg.recommendedCollaborator.user.role}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 line-clamp-1">
                                {msg.recommendedCollaborator.reason}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() =>
                                navigate(
                                  `/matchmaking?member=${msg.recommendedCollaborator?.user.id}`
                                )
                              }
                              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() =>
                                sendConnectionRequest(
                                  msg.recommendedCollaborator!.user.id
                                )
                              }
                              className="px-2.5 py-1 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-md flex items-center gap-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              Connect
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. Related Questions */}
                    {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <div className="text-[11px] text-slate-400">
                          Related technical questions:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.relatedQuestions.map((rq) => (
                            <button
                              key={rq}
                              onClick={() => sendCopilotQuery(rq)}
                              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 hover:bg-blue-600/20 text-blue-300 border border-slate-800 hover:border-blue-500/40 transition-colors text-left"
                            >
                              {rq}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Python conflicts, ML deployment, React performance, Firebase auth, ESP32, or RAG..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Retrieve & Answer</span>
            </button>
          </form>
        </div>

        {/* Right Sidebar: Problem Queries & Evidence Guarantees (4 cols) */}
        <aside className="lg:col-span-4 space-y-5">
          <div
            className={`p-5 rounded-xl border space-y-3.5 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/75 border-slate-800/90'
            }`}
          >
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Verified Problem Queries
            </h2>
            <p className="text-xs text-slate-400">
              Test evidence-first retrieval across all 6 hackathon technical problem domains:
            </p>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendCopilotQuery(q)}
                  className="w-full text-left p-3 text-xs rounded-lg bg-slate-950/70 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
                >
                  “{q}”
                </button>
              ))}
            </div>
          </div>

          <div
            className={`p-5 rounded-xl border space-y-3 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/75 border-slate-800/90'
            }`}
          >
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Evidence-First Guarantees
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                <strong>1. Community Memory Priority:</strong> Searches Verified & Resolved knowledge entries first before falling back to open threads.
              </li>
              <li>
                <strong>2. Traceable Source Links:</strong> Every source reference links directly to an existing Problem Workspace (`/workspace/:id`).
              </li>
              <li>
                <strong>3. Collaborator Handoff:</strong> Automatically recommends a specialist when your query matches their proven project skills.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};
