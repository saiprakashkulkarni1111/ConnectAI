import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Plus,
  Check,
  X,
  Clock,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CommunityEvent } from '../types';

const EVENT_CATEGORIES = [
  'All',
  'My Events',
  'Hackathon',
  'Workshop',
  'Webinar',
  'Study Session',
  'Networking',
] as const;

export const EventsPage: React.FC = () => {
  const {
    events,
    communities,
    toggleEventRegistration,
    createEvent,
    theme,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const eventIdParam = searchParams.get('event');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('Nov 14, 2026');
  const [time, setTime] = useState('06:30 PM IST · 90 Mins');
  const [format, setFormat] = useState<CommunityEvent['format']>('Online');
  const [location, setLocation] = useState('ConnectAI Virtual Stage (Demo)');
  const [category, setCategory] =
    useState<CommunityEvent['category']>('Workshop');
  const [hostCommId, setHostCommId] = useState(
    communities[0]?.id || 'comm-ai-ml'
  );
  const [tagsInput, setTagsInput] = useState('AI Agents, Python, Live Demo');

  useEffect(() => {
    if (eventIdParam) {
      const found = events.find((e) => e.id === eventIdParam);
      if (found) setSelectedEvent(found);
    }
  }, [eventIdParam, events]);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (selectedTab === 'My Events' && !evt.isRegistered) return false;
      if (
        selectedTab !== 'All' &&
        selectedTab !== 'My Events' &&
        evt.category !== selectedTab
      ) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.hostCommunityName.toLowerCase().includes(q) ||
        evt.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [events, selectedTab, searchQuery]);

  const registeredCount = events.filter((e) => e.isRegistered).length;

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    createEvent({
      title,
      description,
      date,
      time,
      format,
      location,
      category,
      hostCommunityId: hostCommId,
      tags,
    });
    setTitle('');
    setDescription('');
    setShowCreateModal(false);
  };

  const isLight = theme === 'light';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-mono text-blue-400">
            Sample Technical Events & Hackathons · Local RSVP Persistence
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Events & Meetups
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Discover upcoming hackathons, hands-on workshops, study sessions, and networking mixers hosted by ConnectAI communities. (Note: All events below are sample demo events stored locally.)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events or topics..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Demo Event
          </button>
        </div>
      </div>

      {/* Category & My Events Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {EVENT_CATEGORIES.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>{tab}</span>
            {tab === 'My Events' && (
              <span className="font-mono text-[11px] opacity-90">
                ({registeredCount})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="p-10 rounded-xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
          <p className="text-sm font-medium text-slate-300">
            No events match the current filter.
          </p>
          <button
            onClick={() => {
              setSelectedTab('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg"
          >
            Show All Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-colors ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-slate-900/75 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                {/* Unboxed Top Metadata Line */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-blue-400">
                      {evt.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{evt.format}</span>
                    <span aria-hidden="true">·</span>
                    <button
                      onClick={() =>
                        navigate(`/communities/${evt.hostCommunityId}`)
                      }
                      className="hover:text-slate-200 hover:underline"
                    >
                      {evt.hostCommunityName}
                    </button>
                  </div>
                  <span className="font-mono text-[11px] text-amber-400">
                    Demo Event
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-semibold leading-snug">
                  {evt.title}
                </h2>

                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {evt.description}
                </p>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/90 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-mono">
                      {evt.date} · {evt.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span className="font-mono tabular-nums">
                      {evt.attendeeCount} / {evt.maxCapacity} attendees registered
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                  <span className="text-slate-500">Topics:</span>
                  {evt.tags.map((t, i) => (
                    <React.Fragment key={t}>
                      {i > 0 && <span aria-hidden="true">·</span>}
                      <span>{t}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedEvent(evt)}
                  className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                >
                  Event Details & Agenda
                </button>

                <button
                  onClick={() => toggleEventRegistration(evt.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    evt.isRegistered
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {evt.isRegistered ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Registered (Unregister)
                    </>
                  ) : (
                    'Register for Event'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={selectedEvent.title}
        >
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-blue-400">
                  {selectedEvent.category} · {selectedEvent.format} · Sample Demo Event
                </div>
                <h2 className="mt-1 text-lg font-bold text-white">
                  {selectedEvent.title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Hosted by {selectedEvent.hostCommunityName} · Lead:{' '}
                  {selectedEvent.speaker.name} ({selectedEvent.speaker.role})
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  if (eventIdParam) setSearchParams({});
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                {selectedEvent.description}
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-200">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="font-mono">
                    {selectedEvent.date} · {selectedEvent.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-200 mb-2">
                  Session Agenda & Schedule
                </h3>
                <ul className="space-y-2">
                  {selectedEvent.agenda.map((item, i) => (
                    <li
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-300 font-mono text-[11px]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Prototype Notice: This is a sample event for the ConnectAI hackathon demonstration. Registration state is stored locally in your browser.
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400">
                {selectedEvent.attendeeCount} / {selectedEvent.maxCapacity} Registered
              </span>
              <button
                onClick={() => {
                  toggleEventRegistration(selectedEvent.id);
                  setSelectedEvent((prev) =>
                    prev
                      ? {
                          ...prev,
                          isRegistered: !prev.isRegistered,
                          attendeeCount: !prev.isRegistered
                            ? prev.attendeeCount + 1
                            : prev.attendeeCount - 1,
                        }
                      : null
                  );
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  selectedEvent.isRegistered
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {selectedEvent.isRegistered
                  ? 'Registered (Click to Unregister)'
                  : 'Confirm Demo Registration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Create Community Demo Event"
        >
          <form
            onSubmit={handleCreateEventSubmit}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  Host a Community Demo Event
                </h2>
                <p className="text-xs text-slate-400">
                  Schedule a workshop, study session, or hackathon sprint in your local prototype.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Local-First AI Agent Evaluation Clinic"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Event Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value as CommunityEvent['category']
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Study Session">Study Session</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Host Community
                  </label>
                  <select
                    value={hostCommId}
                    onChange={(e) => setHostCommId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Time & Duration
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) =>
                      setFormat(e.target.value as CommunityEvent['format'])
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="In-Person">In-Person</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Location / Stream Room
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what attendees will build or learn..."
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Topic Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
              >
                Publish Demo Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
