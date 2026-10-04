import { useState, useEffect } from 'react';
import { Search, MapPin, Building, Clock, Bookmark, BookmarkCheck, ExternalLink, Filter, RefreshCw, X, DollarSign } from 'lucide-react';
import { jobsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  
  const [filters, setFilters] = useState({
    job_type: '',
    work_model: '',
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [jobsRes, savedRes] = await Promise.all([
        jobsAPI.getListings({ q: query, ...filters }),
        jobsAPI.getSaved()
      ]);
      
      setJobs(jobsRes.data.jobs);
      
      // Extract IDs of saved jobs
      const savedIds = new Set((savedRes.data.saved_jobs || []).map(item => item.job_id));
      setSavedJobIds(savedIds);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!loading) fetchJobs();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query, filters]);

  const handleRefreshScraper = async () => {
    setRefreshing(true);
    try {
      toast('Running scraper to find new jobs...', { icon: '🔄' });
      await jobsAPI.refresh();
      toast.success('Scraping complete! Found new jobs.');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to run scraper');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveJob = async (job) => {
    try {
      if (savedJobIds.has(job.id)) {
        await jobsAPI.removeSaved(job.id);
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(job.id);
          return newSet;
        });
        toast.success('Job removed from saved');
        return;
      }
      
      await jobsAPI.saveJob({
        job_id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url
      });
      
      setSavedJobIds(prev => new Set(prev).add(job.id));
      toast.success('Job saved to tracker');
    } catch (err) {
      toast.error('Failed to save or remove job');
    }
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'part-time': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'internship': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'full-time': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="page-enter">
      <div className="card mb-8 p-6 bg-gray-900 border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              className="form-input pl-12 h-12 w-full"
              placeholder="Search job titles, skills, companies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="form-select h-12 md:w-48"
            name="job_type"
            value={filters.job_type}
            onChange={(e) => setFilters(prev => ({...prev, job_type: e.target.value}))}
          >
            <option value="">Any Type</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
          </select>
          
          <select 
            className="form-select h-12 md:w-48"
            name="work_model"
            value={filters.work_model}
            onChange={(e) => setFilters(prev => ({...prev, work_model: e.target.value}))}
          >
            <option value="">Any Model</option>
            <option value="On-site">On-site</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <button 
            className="btn btn-outline h-12 px-4 whitespace-nowrap"
            onClick={handleRefreshScraper}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden md:inline">Refresh Data</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💼</div>
          <h3>No jobs found</h3>
          <p>Try adjusting your search filters or run the scraper to find new listings.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map(job => {
            const isSaved = savedJobIds.has(job.id);
            const postedDate = new Date(job.posted_date);
            const timeAgo = isNaN(postedDate) ? 'recently' : formatDistanceToNow(postedDate, { addSuffix: true });

            return (
              <div key={job.id} className="card card-job flex flex-col hover:-translate-y-1 transition-transform group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 rounded-md text-xs font-bold border inline-block w-fit ${getTypeColor(job.job_type)}`}>
                    {job.job_type}
                  </div>
                  <button 
                    className={`p-1.5 rounded-md transition-colors ${isSaved ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-800'}`}
                    onClick={() => handleSaveJob(job)}
                    title={isSaved ? "Saved" : "Save Job"}
                  >
                    {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                  <a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a>
                </h3>
                
                <div className="text-gray-300 font-medium mb-4 flex items-center gap-2">
                  <Building size={16} className="text-gray-500" /> {job.company}
                </div>
                
                <div className="mt-auto space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={16} />
                    <span className="truncate">{job.location} • {job.work_model}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={16} />
                    <span>Posted {timeAgo}</span>
                  </div>
                  {job.pay && (
                    <div className="text-emerald-400 font-medium pt-2">
                      {job.pay}
                    </div>
                  )}
                  {job.description && (
                    <p className="text-gray-400 text-sm mt-4 line-clamp-3">
                      {job.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800">
                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="btn w-full text-sm border border-gray-700 bg-gray-800/50 hover:bg-yellow-500/10 hover:border-yellow-500 hover:text-yellow-400 text-white transition-colors"
                  >
                    View Description
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Premium Job Description Modal */}
      {selectedJob && (
        <div 
          className="flex items-center justify-center p-4 sm:p-6" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out' }}
          onClick={() => setSelectedJob(null)}
        >
          <div 
            className="flex flex-col shadow-2xl" 
            style={{ 
              maxWidth: '48rem', 
              width: '100%',
              maxHeight: '85vh', 
              backgroundColor: '#1C1C24', 
              borderRadius: '24px',
              border: '1px solid rgba(192, 132, 252, 0.2)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(124, 92, 252, 0.1)',
              transform: 'scale(1)',
              transition: 'transform 0.2s'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header Section */}
            <div className="p-6 sm:p-8 flex justify-between items-start" style={{ background: 'linear-gradient(to right, rgba(28,28,36,1), rgba(35,35,45,1))', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="pr-4">
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ padding: '8px 12px', background: 'rgba(234, 179, 8, 0.1)', color: '#FBBF24', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {selectedJob.job_type}
                  </div>
                  {selectedJob.source && (
                    <div style={{ padding: '8px 12px', background: 'rgba(59, 130, 246, 0.1)', color: '#60A5FA', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                      {selectedJob.source}
                    </div>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>{selectedJob.title}</h3>
                <p className="text-gray-400 text-lg flex items-center gap-2">
                  <Building size={18} className="text-gray-500" />
                  {selectedJob.company}
                </p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)} 
                className="text-gray-500 hover:text-white transition-colors"
                style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}
              >
                <X size={22} />
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              
              {/* Metadata Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div className="text-gray-500 text-xs uppercase tracking-wider mb-2 font-semibold">Location</div>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <MapPin size={18} className="text-purple-400" />
                    {selectedJob.location}
                  </div>
                </div>
                
                {selectedJob.pay && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <div className="text-emerald-500/70 text-xs uppercase tracking-wider mb-2 font-semibold">Compensation</div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <DollarSign size={18} />
                      {selectedJob.pay}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Description Content */}
              <div>
                <h4 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <Bookmark size={20} className="text-purple-400" />
                  About the Role
                </h4>
                <div className="text-gray-300 text-[15px] whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
                  {selectedJob.description || "No detailed description provided by the company."}
                </div>
              </div>

              {/* Action Button */}
              {selectedJob.url && (
                <div className="mt-8 pt-6 border-t border-gray-800/50">
                  <a 
                    href={selectedJob.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'linear-gradient(135deg, #7C5CFC 0%, #60A5FA 100%)', color: 'white', padding: '16px 32px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.4)' }}
                  >
                    Apply on Company Website <ExternalLink size={18} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
