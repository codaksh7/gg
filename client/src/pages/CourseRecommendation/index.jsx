import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import ProfileForm from './ProfileForm';
import RecommendationView from './RecommendationView';
import CourseSearch from './CourseSearch';
import CourseCompare from './CourseCompare';

export default function CourseRecommendation() {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

  return (
    <div className="container py-8">
      <div className="project-page-header">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/20">
            <BookOpen size={32} />
          </div>
          <h1>Course Recommendation Assistant</h1>
        </div>
        <p>Smart matching based on academic background, goals, and budget.</p>
      </div>

      <div className="tabs mb-8 inline-flex">
        <button 
          className={`tab ${!window.location.pathname.includes('/search') && !window.location.pathname.includes('/compare') ? 'active' : ''}`}
          onClick={() => navigate('/courses')}
        >
          Assistant Profile
        </button>
        <button 
          className={`tab ${window.location.pathname.includes('/search') ? 'active' : ''}`}
          onClick={() => navigate('/courses/search')}
        >
          Explore Courses
        </button>
        <button 
          className={`tab ${window.location.pathname.includes('/compare') ? 'active' : ''}`}
          onClick={() => navigate('/courses/compare')}
        >
          Compare
        </button>
      </div>

      <Routes>
        <Route path="/" element={
          profile && recommendations.length > 0 ? (
            <RecommendationView 
              profile={profile} 
              recommendations={recommendations} 
              onReset={() => { setProfile(null); setRecommendations([]); }}
            />
          ) : (
            <ProfileForm 
              onSuccess={(prof, recs) => {
                setProfile(prof);
                setRecommendations(recs);
              }}
            />
          )
        } />
        <Route path="/search" element={<CourseSearch />} />
        <Route path="/compare" element={<CourseCompare />} />
      </Routes>
    </div>
  );
}
