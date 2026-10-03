import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import PolarMapPage from './pages/PolarMapPage';
import StationDetailPage from './pages/StationDetailPage';
import ExpeditionsPage from './pages/ExpeditionsPage';
import ExpeditionDetailPage from './pages/ExpeditionDetailPage';
import ResearchProjectsPage from './pages/ResearchProjectsPage';
import ResearchProjectDetailPage from './pages/ResearchProjectDetailPage';
import DatasetsPage from './pages/DatasetsPage';
import DatasetDetailPage from './pages/DatasetDetailPage';
import ReportsPage from './pages/ReportsPage';
import PublicationsPage from './pages/PublicationsPage';
import LearningHubPage from './pages/LearningHubPage';
import MediaStudioPage from './pages/MediaStudioPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicOutreachFeedPage from './pages/PublicOutreachFeedPage';
import UploadResearchPage from './pages/UploadResearchPage';

import ProtectedRoute from './components/ProtectedRoute';
import MediaPage from './pages/MediaPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="map" element={<PolarMapPage />} />
        <Route path="stations/:id" element={<StationDetailPage />} />
        <Route path="expeditions" element={<ExpeditionsPage />} />
        <Route path="expeditions/:id" element={<ExpeditionDetailPage />} />
        <Route path="research" element={<ResearchProjectsPage />} />
        <Route path="research/:id" element={<ResearchProjectDetailPage />} />
        <Route path="datasets" element={<DatasetsPage />} />
        <Route path="datasets/:id" element={<DatasetDetailPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/:id" element={<ReportsPage />} />
        <Route path="publications" element={<PublicationsPage />} />
        <Route path="publications/:id" element={<PublicationsPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="learn" element={<LearningHubPage />} />
        <Route
          path="media-studio"
          element={
            <ProtectedRoute allowedRoles={['researcher', 'admin']}>
              <MediaStudioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="upload-research"
          element={
            <ProtectedRoute allowedRoles={['researcher', 'admin']}>
              <UploadResearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="outreach" element={<PublicOutreachFeedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
