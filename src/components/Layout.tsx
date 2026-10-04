import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Database,
  Compass,
  Users,
  Bot,
  Calendar,
  MessageSquare,
  Bookmark,
  User as UserIcon,
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Network,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from './Avatar';
import { SearchModal } from './SearchModal';
import { OnboardingModal } from './OnboardingModal';
import { JudgeWalkthroughModal } from './JudgeWalkthroughModal';

const NAV_ITEMS = [
  { to: '/', label: 'Intelligence Hub', icon: Home, end: true },
  { to: '/memory', label: 'Community Memory', icon: Database },
  { to: '/copilot', label: 'Community Copilot', icon: Bot },
  { to: '/matchmaking', label: 'Problem Matchmaking', icon: Users },
  { to: '/communities', label: 'Communities', icon: Compass },
  { to: '/events', label: 'Events & Meetups', icon: Calendar },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/profile', label: 'My Profile', icon: UserIcon },
  { to: '/settings', label: 'Privacy & AI Status', icon: Settings },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    knowledgeEntries,
    notifications,
    conversations,
    connections,
    theme,
    toggleTheme,
    openGlobalSearchWithQuery,
    setIsJudgeGuideOpen,
    openOnboardingModal,
    resetDemoData,
    markNotificationRead,
    markAllNotificationsRead,
    toastMessage,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;
  const unreadMessagesCount =
    conversations.reduce((acc, c) => acc + c.unreadCount, 0) +
    connections.filter((c) => c.status === 'pending_incoming').length;

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotifOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row ${
        isLight
          ? 'bg-slate-50 text-slate-900'
          : 'bg-[#0B0F19] text-slate-100'
      }`}
    >
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r transition-all duration-150 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-slate-950/90 border-slate-800/80'
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/60">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 min-w-0 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Network className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <span
                className={`text-lg font-bold tracking-tight truncate ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                ConnectAI
              </span>
            )}
          </NavLink>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const showMsgBadge =
              item.to === '/messages' && unreadMessagesCount > 0;
            const showMemBadge = item.to === '/memory';

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={sidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>
                {!sidebarCollapsed && showMsgBadge && (
                  <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {unreadMessagesCount}
                  </span>
                )}
                {!sidebarCollapsed && showMemBadge && (
                  <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {knowledgeEntries.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div
          className={`p-3 border-t space-y-2 ${
            isLight ? 'border-slate-200' : 'border-slate-800/80'
          }`}
        >
          {!sidebarCollapsed ? (
            <>
              <button
                onClick={() => setIsJudgeGuideOpen(true)}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Judge Demo Flow
                </span>
                <span className="font-mono text-[10px]">8 Steps</span>
              </button>
              <div className="px-2 py-1 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Local Retrieval
                </span>
                <span className="font-mono text-[10px]">Demo Mode</span>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsJudgeGuideOpen(true)}
              title="Judge Demo Flow"
              className="w-full p-2 rounded-lg bg-blue-600/15 text-blue-400 flex items-center justify-center hover:bg-blue-600/25"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className={`sticky top-0 z-30 h-16 px-4 sm:px-6 border-b flex items-center justify-between gap-4 backdrop-blur-md ${
            isLight
              ? 'bg-white/90 border-slate-200'
              : 'bg-slate-950/85 border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => openGlobalSearchWithQuery('')}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2 text-xs rounded-lg border transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-500 hover:border-slate-300'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">
                  Search Verified Solutions, Resolved Questions, Experts...
                </span>
              </span>
              <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Search
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/memory')}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Community Memory ({knowledgeEntries.length})</span>
            </button>

            <button
              onClick={() => navigate('/copilot')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Community Copilot</span>
            </button>

            <button
              onClick={() => setIsJudgeGuideOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Explore Demo</span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
              className={`p-2 rounded-lg border transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isLight ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                className={`relative p-2 rounded-lg border transition-colors ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-100">
                        Smart Notifications
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Prioritized problem replies & collaborator matches
                      </p>
                    </div>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/80">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 transition-colors ${
                          n.isRead ? 'bg-slate-900/40' : 'bg-blue-950/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-100">
                            {n.title}
                          </span>
                          <button
                            onClick={() => markNotificationRead(n.id)}
                            className="text-[10px] font-mono text-slate-400 hover:text-slate-200 shrink-0"
                          >
                            {n.isRead ? 'Unread' : 'Read'}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                          {n.body}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                          <span>
                            {n.priority} · {n.timestamp}
                          </span>
                          <button
                            onClick={() => {
                              if (!n.isRead) markNotificationRead(n.id);
                              setNotifOpen(false);
                              navigate(n.actionUrl);
                            }}
                            className="text-blue-400 hover:text-blue-300 font-medium"
                          >
                            {n.actionLabel} →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500/40 transition-all"
                aria-label="User profile menu"
              >
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="sm"
                  status="online"
                />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3.5 border-b border-slate-800">
                    <div className="text-xs font-semibold text-slate-100 truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {currentUser.role}
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-emerald-400">
                      Local Retrieval · Demo Mode
                    </div>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      My Profile & Contributions
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setIsJudgeGuideOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-blue-300 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      8-Step Judge Walkthrough
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        openOnboardingModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Customize Onboarding Preferences
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      Privacy & AI Status
                    </button>
                    <hr className="border-slate-800 my-1" />
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        resetDemoData();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      Reset Demo Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 flex flex-col z-10">
              <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <Network className="w-4 h-4" />
                  </div>
                  <span className="text-base font-bold text-white">
                    ConnectAI
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-slate-900 border border-blue-500/50 text-xs font-medium text-slate-100 shadow-xl flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          {toastMessage}
        </div>
      )}

      <SearchModal />
      <OnboardingModal />
      <JudgeWalkthroughModal />
    </div>
  );
};
