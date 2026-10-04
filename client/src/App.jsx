import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Project Pages
import CourseRecommendation from './pages/CourseRecommendation';
import LoanAssessment from './pages/LoanAssessment';
import JobDiscovery from './pages/JobDiscovery';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1E1E2E', color: '#fff', border: '1px solid #333' } }} />
      <Navbar />
      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Project Routes */}
          <Route path="/courses/*" element={
            <ProtectedRoute>
              <CourseRecommendation />
            </ProtectedRoute>
          } />
          
          <Route path="/loans/*" element={
            <ProtectedRoute>
              <LoanAssessment />
            </ProtectedRoute>
          } />
          
          <Route path="/jobs/*" element={
            <ProtectedRoute>
              <JobDiscovery />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
