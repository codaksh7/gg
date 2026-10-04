import { Routes, Route, useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import JobSearch from './JobSearch';
import ApplicationTracker from './ApplicationTracker';

export default function JobDiscovery() {
  const navigate = useNavigate();

  return (
    <div className="container py-8">
      <div className="project-page-header">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/20">
            <Briefcase size={32} />
          </div>
          <h1>Job Discovery & Tracking</h1>
        </div>
        <p>Find part-time, internship, and full-time roles, and track your applications.</p>
      </div>

      <div className="tabs mb-8 inline-flex">
        <button 
          className={`tab ${!window.location.pathname.includes('/tracker') ? 'active' : ''}`}
          onClick={() => navigate('/jobs')}
        >
          Discover Jobs
        </button>
        <button 
          className={`tab ${window.location.pathname.includes('/tracker') ? 'active' : ''}`}
          onClick={() => navigate('/jobs/tracker')}
        >
          Application Tracker
        </button>
      </div>

      <Routes>
        <Route path="/" element={<JobSearch />} />
        <Route path="/tracker" element={<ApplicationTracker />} />
      </Routes>
    </div>
  );
}
