import { useState, useEffect } from 'react';
import { jobsAPI } from '../../services/api';
import { Briefcase, Calendar, Trash2, ExternalLink, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTrackerData = async () => {
    try {
      const appsRes = await jobsAPI.getSaved();
      const mappedApps = (appsRes.data.saved_jobs || []).map(entry => ({
        id: entry.job_id,
        title: entry.job?.title || 'Unknown Title',
        company: entry.job?.company || 'Unknown Company',
        location: entry.job?.location || 'Unknown Location',
        url: entry.job?.url || '#',
        created_at: entry.saved_at,
        status: entry.status || 'saved',
      }));
      setApplications(mappedApps);
    } catch (err) {
      toast.error('Failed to load tracker data');
    } finally {
      setLoading(false);
    }
  };

  const dynamicStats = {
    total_saved: applications.filter(a => a.status === 'saved').length,
    applied: applications.filter(a => a.status === 'applied').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offered: applications.filter(a => a.status === 'offered').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  useEffect(() => {
    fetchTrackerData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await jobsAPI.saveJob({ job_id: id, status: newStatus });
      toast.success('Status updated');
      fetchTrackerData(); // refresh to get new stats
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this job from your tracker?')) return;
    try {
      await jobsAPI.removeSaved(id);
      toast.success('Job removed');
      fetchTrackerData();
    } catch (err) {
      toast.error('Failed to remove job');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'saved': return 'bg-gray-800 text-gray-300 border-gray-700';
      case 'applied': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'interviewing': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'offered': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-gray-800 text-gray-300';
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-enter space-y-8">
      {/* Stats Board */}
      {/* Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card border-gray-800 p-4 text-center">
          <div className="text-2xl font-bold font-display text-white">{dynamicStats.total_saved}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Saved</div>
        </div>
        <div className="card border-blue-500/30 bg-blue-500/5 p-4 text-center">
          <div className="text-2xl font-bold font-display text-blue-400">{dynamicStats.applied}</div>
          <div className="text-xs text-blue-400/70 uppercase tracking-wide mt-1">Applied</div>
        </div>
        <div className="card border-yellow-500/30 bg-yellow-500/5 p-4 text-center">
          <div className="text-2xl font-bold font-display text-yellow-400">{dynamicStats.interviewing}</div>
          <div className="text-xs text-yellow-400/70 uppercase tracking-wide mt-1">Interviews</div>
        </div>
        <div className="card border-green-500/30 bg-green-500/5 p-4 text-center">
          <div className="text-2xl font-bold font-display text-green-400">{dynamicStats.offered}</div>
          <div className="text-xs text-green-400/70 uppercase tracking-wide mt-1">Offers</div>
        </div>
        <div className="card border-red-500/30 bg-red-500/5 p-4 text-center">
          <div className="text-2xl font-bold font-display text-red-400">{dynamicStats.rejected}</div>
          <div className="text-xs text-red-400/70 uppercase tracking-wide mt-1">Rejected</div>
        </div>
      </div>

      {/* Tracker List */}
      <div className="card border-gray-800 overflow-hidden p-0">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2"><Activity size={20} className="text-yellow-500"/> Pipeline</h3>
        </div>
        
        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No jobs tracked</h3>
            <p>Go to the discover tab to find and save jobs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-800 text-sm text-gray-400 bg-gray-900/20">
                  <th className="p-4 font-medium w-[30%]">Job Title & Company</th>
                  <th className="p-4 font-medium">Location</th>
                  <th className="p-4 font-medium">Date Saved</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white mb-1 line-clamp-1">{app.title}</div>
                      <div className="text-sm text-yellow-500 flex items-center gap-1.5">
                        <Briefcase size={14}/> {app.company}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{app.location}</td>
                    <td className="p-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14}/>
                        {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <select 
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border cursor-pointer outline-none ${getStatusColor(app.status)}`}
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      >
                        <option value="saved" className="bg-gray-900 text-white">Saved</option>
                        <option value="applied" className="bg-gray-900 text-white">Applied</option>
                        <option value="interviewing" className="bg-gray-900 text-white">Interviewing</option>
                        <option value="offered" className="bg-gray-900 text-white">Offered</option>
                        <option value="rejected" className="bg-gray-900 text-white">Rejected</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={app.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                          title="View Job Post"
                        >
                          <ExternalLink size={18}/>
                        </a>
                        <button 
                          onClick={() => handleRemove(app.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          title="Remove from Tracker"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
