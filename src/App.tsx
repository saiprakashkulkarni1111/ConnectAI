/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { HomeFeed } from './pages/HomeFeed';
import { CommunityMemoryPage } from './pages/CommunityMemoryPage';
import { ProblemWorkspacePage } from './pages/ProblemWorkspacePage';
import { Communities } from './pages/Communities';
import { AIMatchmaking } from './pages/AIMatchmaking';
import { KnowledgeAssistant } from './pages/KnowledgeAssistant';
import { EventsPage } from './pages/EventsPage';
import { MessagesPage } from './pages/MessagesPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomeFeed />} />
            <Route path="/memory" element={<CommunityMemoryPage />} />
            <Route path="/workspace/:postId" element={<ProblemWorkspacePage />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/communities/:id" element={<Communities />} />
            <Route path="/matchmaking" element={<AIMatchmaking />} />
            <Route path="/copilot" element={<KnowledgeAssistant />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}
