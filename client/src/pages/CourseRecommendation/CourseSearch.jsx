import { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, BookOpen } from 'lucide-react';
import { coursesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function CourseSearch() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState([]);
  const [filters, setFilters] = useState({
    country: '',
    degree_type: '',
  });
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await coursesAPI.search(query, filters);
      setCourses(res.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const cRes = await coursesAPI.getCountries();
        setCountries(cRes.data.countries);
        await fetchCourses();
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []); // Run once on mount

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query, filters]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
              placeholder="Search courses, universities, keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="form-select h-12 md:w-48"
            name="country"
            value={filters.country}
            onChange={handleFilterChange}
          >
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select 
            className="form-select h-12 md:w-48"
            name="degree_type"
            value={filters.degree_type}
            onChange={handleFilterChange}
          >
            <option value="">All Degrees</option>
            <option value="Bachelors">Bachelors</option>
            <option value="Masters">Masters</option>
            <option value="PhD">PhD</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No courses found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
      ) : (
        <div className="grid-3">
          {courses.map(course => (
            <div key={course.id} className="card card-course flex flex-col h-full hover:-translate-y-1 transition-transform">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="badge badge-course">{course.degree_type}</span>
                  {course.ranking <= 100 && <span className="text-xs text-yellow-500 font-medium">Ranked #{course.ranking}</span>}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{course.name}</h3>
                <p className="text-orange-400 text-sm font-medium mb-4">{course.university}</p>
                
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">{course.description}</p>
              </div>
              
              <div className="mt-auto border-t border-gray-800 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5"><MapPin size={14}/> Location</span>
                  <span className="text-white text-right">{course.city}, {course.country}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5"><DollarSign size={14}/> Tuition</span>
                  <span className="text-white font-medium">${course.tuition_per_year_usd.toLocaleString()}/yr</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5"><BookOpen size={14}/> Field</span>
                  <span className="text-white text-right truncate max-w-[150px]" title={course.field}>{course.field}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
