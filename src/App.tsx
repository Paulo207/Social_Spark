import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { ContentWorkflow } from './pages/ContentWorkflow';
import { MediaLibrary } from './pages/MediaLibrary';
import { AIChatWidget } from './components/AIChatWidget';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/app" element={<DashboardLayout />}>
          <Route path="workflow" element={<ContentWorkflow />} />
          <Route path="media-library" element={<MediaLibrary />} />
        </Route>
        {/* Fallback to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AIChatWidget />
    </Router>
  );
}

export default App;

