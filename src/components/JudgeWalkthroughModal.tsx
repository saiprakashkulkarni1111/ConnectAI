import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Search,
  Bot,
  Users,
  RotateCcw,
  ArrowRight,
  Wrench,
  CheckCircle2,
  Database,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const JudgeWalkthroughModal: React.FC = () => {
  const {
    isJudgeGuideOpen,
    setIsJudgeGuideOpen,
    openGlobalSearchWithQuery,
    markQuestionResolved,
    savePostToCommunityMemory,
    resetDemoData,
  } = useApp();
  const navigate = useNavigate();

  if (!isJudgeGuideOpen) return null;

  // End-to-End 8-Step Judge Demonstration from Section 10
  const steps = [
    {
      num: '01',
      title: 'Open a Technical Question',
      desc: 'Open the active Python dependency conflict problem (“torch 2.4 + onnxruntime-gpu + numpy 2.x”) inside the Unified Problem-Solving Workspace.',
      actionLabel: 'Open Problem Workspace',
      onClick: () => {
        setIsJudgeGuideOpen(false);
        navigate('/workspace/post-py-deps');
      },
      icon: Wrench,
    },
    {
      num: '02',
      title: 'Retrieve Related Existing Discussions',
      desc: 'Inspect related community posts and verified solutions automatically surfaced inside the problem workspace or via Global Search.',
      actionLabel: 'Search Related Discussions',
      onClick: () => {
        setIsJudgeGuideOpen(false);
        openGlobalSearchWithQuery('PyTorch ONNX');
      },
      icon: FileText,
    },
    {
      num: '03',
      title: 'Ask Community Copilot for Help',
      desc: 'Query the Evidence-First Community Copilot on how to resolve the Python dependency conflict and review the grounded answer.',
      actionLabel: 'Ask Community Copilot',
      onClick: () => {
        setIsJudgeGuideOpen(false);
        navigate(
          '/copilot?q=' +
            encodeURIComponent(
              'How to resolve Python dependency conflicts with PyTorch and ONNX?'
            )
        );
      },
      icon: Bot,
    },
    {
      num: '04',
      title: 'Inspect Original Source References',
      desc: 'Click any supporting source reference in Community Copilot or Community Memory to verify that every citation links to an authentic record.',
      actionLabel: 'Inspect Verified Sources',
      onClick: () => {
        setIsJudgeGuideOpen(false);
        navigate('/memory');
      },
      icon: Database,
    },
    {
      num: '05',
      title: 'Find a Suitable Collaborator (Problem-to-Person)',
      desc: 'Match with domain specialists (Liam O’Connor & Dr. Elena Rostova) based on the exact skills required for this problem (Python, uv, PyTorch, ONNX).',
      actionLabel: 'Match Collaborators for Problem',
      onClick: () => {
        setIsJudgeGuideOpen(false);
        navigate('/matchmaking?problemId=post-py-deps');
      },
      icon: Users,
    },
    {
      num: '06',
      title: 'Mark the Question Resolved',
      desc: 'Accept Liam O’Connor’s reproducible 3-step fix and transition the question lifecycle from Answered to Resolved.',
      actionLabel: 'Mark Question Resolved Now',
      onClick: () => {
        markQuestionResolved('post-py-deps', 'c-py-1');
        setIsJudgeGuideOpen(false);
        navigate('/workspace/post-py-deps');
      },
      icon: CheckCircle2,
    },
    {
      num: '07',
      title: 'Save Accepted Solution to Community Memory',
      desc: 'Preserve the resolved Python dependency solution into Community Memory with full contributor attribution and duplicate prevention.',
      actionLabel: 'Save Solution to Memory Now',
      onClick: () => {
        markQuestionResolved('post-py-deps', 'c-py-1');
        savePostToCommunityMemory('post-py-deps');
        setIsJudgeGuideOpen(false);
        navigate('/memory');
      },
      icon: Database,
    },
    {
      num: '08',
      title: 'Search & Retrieve the Newly Saved Solution',
      desc: 'Search for “Python dependency conflicts” again in Global Search and verify the newly saved Community Memory entry ranks #1.',
      actionLabel: 'Search & Verify #1 Rank',
      onClick: () => {
        markQuestionResolved('post-py-deps', 'c-py-1');
        savePostToCommunityMemory('post-py-deps');
        setIsJudgeGuideOpen(false);
        openGlobalSearchWithQuery('Python dependency conflicts');
      },
      icon: Search,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="iQOO Hackathon End-to-End Judge Walkthrough"
    >
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-800 bg-slate-950/50">
          <div>
            <span className="text-xs font-mono text-blue-400">
              iQOO Hackathon Demonstration · End-to-End Community Intelligence Flow
            </span>
            <h2 className="mt-1 text-xl font-bold text-slate-100">
              8-Step Judge Walkthrough: From Question to Community Memory
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Click through steps 01–08 in order to experience how ConnectAI turns an unresolved technical problem into a verified, reusable knowledge entry.
            </p>
          </div>
          <button
            onClick={() => setIsJudgeGuideOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            aria-label="Close walkthrough"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-mono font-semibold text-blue-400">
                      {step.num}. {step.title}
                    </span>
                    <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <button
                  onClick={step.onClick}
                  className="self-start px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {step.actionLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Want to reset the demo back to the initial state to run the walkthrough again?
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetDemoData();
                setIsJudgeGuideOpen(false);
              }}
              className="px-3.5 py-2 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>
            <button
              onClick={() => setIsJudgeGuideOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
