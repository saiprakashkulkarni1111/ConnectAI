import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Send,
  Check,
  X,
  UserCheck,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';

export const MessagesPage: React.FC = () => {
  const {
    currentUser,
    conversations,
    connections,
    members,
    sendMessage,
    acceptConnectionRequest,
    rejectConnectionRequest,
    theme,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const convIdParam = searchParams.get('conv');

  const [activeConvId, setActiveConvId] = useState<string>(
    convIdParam || conversations[0]?.id || ''
  );
  const [contactSearch, setContactSearch] = useState('');
  const [draftText, setDraftText] = useState('');

  useEffect(() => {
    if (convIdParam && conversations.some((c) => c.id === convIdParam)) {
      setActiveConvId(convIdParam);
    }
  }, [convIdParam, conversations]);

  const incomingRequests = useMemo(() => {
    return connections
      .filter((c) => c.status === 'pending_incoming')
      .map((conn) => {
        const user = members.find((m) => m.id === conn.userId);
        return { conn, user };
      })
      .filter((item) => !!item.user);
  }, [connections, members]);

  const filteredConversations = useMemo(() => {
    if (!contactSearch.trim()) return conversations;
    const q = contactSearch.toLowerCase();
    return conversations.filter(
      (c) =>
        c.participantName.toLowerCase().includes(q) ||
        c.participantRole.toLowerCase().includes(q)
    );
  }, [conversations, contactSearch]);

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  const activeParticipantProfile = useMemo(() => {
    if (!activeConversation) return null;
    return members.find((m) => m.id === activeConversation.participantId) || null;
  }, [activeConversation, members]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !draftText.trim()) return;
    sendMessage(activeConversation.id, draftText);
    setDraftText('');
  };

  const isLight = theme === 'light';

  return (
    <div className="space-y-6">
      {/* Header & Honest Prototype Notice */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-blue-400">
            Direct Collaborator Messaging & Connection Requests
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
            Messages & Connections
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Coordinate hackathon builds, mentorship sessions, and project collaborations.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            Prototype Demo Mode: Messages and connection states are persisted locally in your browser.
          </span>
        </div>
      </div>

      {/* Pending Connection Requests Banner */}
      {incomingRequests.length > 0 && (
        <div
          className={`p-5 rounded-xl border space-y-3 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/80 border-blue-500/30'
          }`}
        >
          <h2 className="text-xs font-semibold text-blue-400 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Pending Incoming Connection Requests ({incomingRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {incomingRequests.map(({ conn, user }) => {
              if (!user) return null;
              return (
                <div
                  key={conn.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      size="md"
                      status={user.onlineStatus}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-100">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {user.role} · {conn.connectedAt}
                      </div>
                      {conn.note && (
                        <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                          “{conn.note}”
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => rejectConnectionRequest(conn.id)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                    <button
                      onClick={() => acceptConnectionRequest(conn.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept & Connect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Three-Pane Messaging Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Pane: Contacts & Conversations List (4 cols) */}
        <div
          className={`lg:col-span-4 rounded-xl border overflow-hidden flex flex-col h-[560px] ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="p-3.5 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70">
            {filteredConversations.map((conv) => {
              const isSelected = activeConversation?.id === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                    isSelected
                      ? 'bg-blue-600/15 border-l-2 border-l-blue-500'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <Avatar
                    src={conv.participantAvatar}
                    name={conv.participantName}
                    size="md"
                    status={conv.participantStatus}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold truncate">
                        {conv.participantName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {conv.lastMessageAt}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {conv.participantRole}
                    </div>
                    <p className="mt-1 text-xs text-slate-300 truncate">
                      {lastMsg
                        ? lastMsg.text
                        : 'Start a technical conversation...'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Pane: Active Conversation Thread (5 cols) */}
        <div
          className={`lg:col-span-5 rounded-xl border flex flex-col h-[560px] overflow-hidden ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          {activeConversation ? (
            <>
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={activeConversation.participantAvatar}
                    name={activeConversation.participantName}
                    size="sm"
                    status={activeConversation.participantStatus}
                  />
                  <div>
                    <div className="text-xs font-semibold">
                      {activeConversation.participantName}
                    </div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {activeConversation.participantStatus} (Demo Status) ·{' '}
                      {activeConversation.participantRole}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeConversation.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-xs text-slate-400 p-6">
                    Say hello to {activeConversation.participantName} and share what you are building!
                  </div>
                ) : (
                  activeConversation.messages.map((m) => {
                    const isMe = m.senderId === currentUser.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          isMe ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-950 border border-slate-800 text-slate-200'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="mt-1 text-[10px] font-mono text-slate-500 px-1">
                          {m.timestamp}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="p-3 border-t border-slate-800 bg-slate-950/50 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder={`Message ${activeConversation.participantName}...`}
                  className="flex-1 px-3.5 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Select a conversation to view messages.
            </div>
          )}
        </div>

        {/* Right Pane: Collaborator Profile Preview (3 cols) */}
        <div
          className={`lg:col-span-3 rounded-xl border p-4 space-y-4 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          {activeParticipantProfile ? (
            <>
              <div className="text-xs font-mono text-slate-400">
                Collaborator Profile Preview
              </div>
              <div className="flex items-center gap-3">
                <Avatar
                  src={activeParticipantProfile.avatar}
                  name={activeParticipantProfile.name}
                  size="lg"
                  status={activeParticipantProfile.onlineStatus}
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold truncate">
                    {activeParticipantProfile.name}
                  </h3>
                  <div className="text-xs text-blue-400 truncate">
                    {activeParticipantProfile.role}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {activeParticipantProfile.location}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeParticipantProfile.headline}
              </p>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">Current Project:</div>
                <div className="text-slate-200 font-medium">
                  {activeParticipantProfile.currentProject}
                </div>
              </div>

              <div className="text-xs space-y-1">
                <div>
                  <span className="text-slate-400">Skills: </span>
                  <span className="text-slate-200">
                    {activeParticipantProfile.skills.join(' · ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Goal: </span>
                  <span className="text-slate-200">
                    {activeParticipantProfile.collaborationType}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate(`/matchmaking?member=${activeParticipantProfile.id}`)
                }
                className="w-full py-2 px-3 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Open Full Match Breakdown</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="text-xs text-slate-400">
              Select a contact to preview their skills and active project.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
