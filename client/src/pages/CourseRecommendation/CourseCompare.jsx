import { useState, useEffect } from 'react';
import { coursesAPI } from '../../services/api';
import { CheckCircle2, XCircle, ChevronDown, Plus } from 'lucide-react';

export default function CourseCompare() {
  const [allCourses, setAllCourses] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await coursesAPI.getAll();
        setAllCourses(res.data.courses);
        if (res.data.courses.length >= 2) {
          setSelectedIds([res.data.courses[0].id, res.data.courses[1].id]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleAddCourse = (id) => {
    if (selectedIds.length >= 4) return;
    if (!selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
      setSearchQuery('');
    }
  };

  const handleRemoveCourse = (id) => {
    setSelectedIds(selectedIds.filter(cId => cId !== id));
  };

  const getSelectedCourses = () => {
    return selectedIds.map(id => allCourses.find(c => c.id === id)).filter(Boolean);
  };

  const filteredSearch = allCourses.filter(c => 
    !selectedIds.includes(c.id) && 
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     c.university.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const compareCourses = getSelectedCourses();

  return (
    <div className="page-enter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold">Side-by-Side Comparison</h2>
        
        {selectedIds.length < 4 && (
          <div className="relative w-full md:w-80 z-50">
            <div className="flex items-center relative">
              <input 
                type="text" 
                className="form-input w-full pr-10"
                placeholder="Search to add course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Plus size={18} className="text-gray-400 absolute right-3 pointer-events-none" />
            </div>
            
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-border-color rounded-lg shadow-xl max-h-60 overflow-y-auto z-50" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                {filteredSearch.length > 0 ? (
                  filteredSearch.slice(0, 5).map(course => (
                    <div 
                      key={course.id}
                      className="p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => handleAddCourse(course.id)}
                    >
                      <div className="text-sm font-medium text-white truncate">{course.name}</div>
                      <div className="text-xs text-orange-400">{course.university}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-500 text-center">No courses found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {compareCourses.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">⚖️</div>
          <h3>Select courses to compare</h3>
          <p>Search and add up to 4 courses to compare them side-by-side.</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-4 w-48 sticky left-0 bg-bg-primary z-10 border-b border-gray-800 shadow-[1px_0_0_#2A2A3A]">Features</th>
                {compareCourses.map(course => (
                  <th key={course.id} className="p-4 min-w-[280px] w-[280px] align-top border-b border-gray-800">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="badge badge-course">{course.degree_type}</div>
                      <button onClick={() => handleRemoveCourse(course.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                        <XCircle size={18} />
                      </button>
                    </div>
                    <h3 className="font-bold text-white text-lg leading-tight mb-1">{course.name}</h3>
                    <p className="text-orange-400 font-medium text-sm">{course.university}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Core Details */}
              <tr>
                <td colSpan={compareCourses.length + 1} className="p-4 bg-gray-900/50 font-semibold text-sm uppercase tracking-wider text-gray-400 border-b border-gray-800 sticky left-0 shadow-[1px_0_0_#2A2A3A]">
                  Core Details
                </td>
              </tr>
              <tr className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors">
                <td className="p-4 font-medium text-gray-300 sticky left-0 bg-bg-primary z-10 shadow-[1px_0_0_#2A2A3A]">Location</td>
                {compareCourses.map(c => (
                  <td key={c.id} className="p-4 text-white">{c.city}, {c.country}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors">
                <td className="p-4 font-medium text-gray-300 sticky left-0 bg-bg-primary z-10 shadow-[1px_0_0_#2A2A3A]">Field</td>
                {compareCourses.map(c => (
                  <td key={c.id} className="p-4 text-white">{c.field}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors">
                <td className="p-4 font-medium text-gray-300 sticky left-0 bg-bg-primary z-10 shadow-[1px_0_0_#2A2A3A]">Global Rank</td>
                {compareCourses.map(c => (
                  <td key={c.id} className="p-4 text-white">
                    {c.ranking <= 100 ? <span className="text-yellow-400 font-bold">#{c.ranking}</span> : `#${c.ranking}`}
                  </td>
                ))}
              </tr>

              {/* Financials & Duration */}
              <tr>
                <td colSpan={compareCourses.length + 1} className="p-4 bg-gray-900/50 font-semibold text-sm uppercase tracking-wider text-gray-400 border-b border-gray-800 sticky left-0 shadow-[1px_0_0_#2A2A3A]">
                  Logistics & Financials
                </td>
              </tr>
              <tr className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors">
                <td className="p-4 font-medium text-gray-300 sticky left-0 bg-bg-primary z-10 shadow-[1px_0_0_#2A2A3A]">Duration</td>
                {compareCourses.map(c => (
                  <td key={c.id} className="p-4 text-white">{c.duration_months} months</td>
                ))}
              </tr>
              <tr className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors">
                <td className="p-4 font-medium text-gray-300 sticky left-0 bg-bg-primary z-10 shadow-[1px_0_0_#2A2A3A]">Tuition (Annual)</td>
                {compareCourses.map(c => (
                  <td key={c.id} className="p-4 text-white font-medium">${c.tuition_per_year_usd.toLocaleString()} USD</td>
                ))}
              </tr>
              <tr className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors">
                <td className="p-4 font-medium text-gray-300 sticky left-0 bg-bg-primary z-10 shadow-[1px_0_0_#2A2A3A]">Scholarships</td>
                {compareCourses.map(c => (
                  <td key={c.id} className="p-4">
                    {c.scholarship_available ? <CheckCircle2 className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
                  </td>
                ))}
              </tr>

              {/* Requirements & Outcomes */}
              <tr>
                <td colSpan={compareCourses.length + 1} className="p-4 bg-gray-900/50 font-semibold text-sm uppercase tracking-wider text-gray-400 border-b border-gray-800 sticky left-0 shadow-[1px_0_0_#2A2A3A]">
                  Outcomes
                </td>
              </tr>
              <tr className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors">
                <td className="p-4 font-medium text-gray-300 sticky left-0 bg-bg-primary z-10 shadow-[1px_0_0_#2A2A3A] align-top">Work Permit</td>
                {compareCourses.map(c => (
                  <td key={c.id} className="p-4 text-sm text-green-400 leading-relaxed align-top">{c.work_permit_info}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors">
                <td className="p-4 font-medium text-gray-300 sticky left-0 bg-bg-primary z-10 shadow-[1px_0_0_#2A2A3A] align-top">Top Careers</td>
                {compareCourses.map(c => (
                  <td key={c.id} className="p-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      {c.career_outcomes.slice(0, 3).map(outcome => (
                        <span key={outcome} className="text-sm text-gray-300 bg-gray-800/50 px-2 py-1 rounded inline-block w-fit">
                          {outcome}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
