import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudySphereProvider } from './context/StudySphereContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Import Pages
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Chat } from './pages/Chat';
import { StudyModes } from './pages/StudyModes';
import { LearnMode } from './pages/LearnMode';
import { SummaryMode } from './pages/SummaryMode';
import { QuizMode } from './pages/QuizMode';
import { Flashcards } from './pages/Flashcards';
import { VivaMode } from './pages/VivaMode';
import { KnowledgeMap } from './pages/KnowledgeMap';
import { Viewer } from './pages/Viewer';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <StudySphereProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page (Distraction-free outside Dashboard) */}
          <Route path="/" element={<Landing />} />

          {/* Core App nested under DashboardLayout template */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/study-modes" element={<StudyModes />} />
            <Route path="/learn" element={<LearnMode />} />
            <Route path="/summary" element={<SummaryMode />} />
            <Route path="/quiz" element={<QuizMode />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/viva" element={<VivaMode />} />
            <Route path="/map" element={<KnowledgeMap />} />
            <Route path="/viewer" element={<Viewer />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch-all redirecting to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StudySphereProvider>
  );
}
