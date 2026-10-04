import { useState } from 'react';
import { ArrowLeft, CheckCircle2, MapPin, DollarSign, Calendar, TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { coursesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function RecommendationView({ profile, recommendations, onReset }) {
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [notes, setNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const handleSaveNote = async (courseId) => {
    if (!notes.trim()) return;
    setSavingNote(true);
    try {
      await coursesAPI.addNote({
        content: notes,
        course_id: courseId
      });
      toast.success('Note saved to session');
      setNotes('');
    } catch (err) {
      toast.error('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const getRelevanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-500 bg-green-500';
    if (percentage >= 60) return 'text-yellow-500 bg-yellow-500';
    return 'text-orange-500 bg-orange-500';
  };

  return (
    <div className="space-y-6 page-enter">
      <button onClick={onReset} className="back-btn">
        <ArrowLeft size={18} /> Back to Profile Setup
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display mb-2">Your Recommendations</h2>
          <p className="text-gray-400">We found {recommendations.length} courses matching your profile.</p>
        </div>
        
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 max-w-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Profile Summary</div>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-course">{profile.field_of_study || 'Any field'}</span>
            <span className="badge badge-course">{profile.target_degree}</span>
            {profile.budget_max && <span className="badge badge-course">Max ${profile.budget_max}</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {recommendations.map((course, idx) => {
          const isExpanded = expandedCourse === course.id;
          const { percentage, reasons } = course.relevance;
          const colorClass = getRelevanceColor(percentage);

          return (
            <div key={course.id} className="card card-course p-0 overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-gray-800/30 transition-colors"
                onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>
                      <h3 className="text-xl font-bold text-white leading-tight">{course.name}</h3>
                    </div>
                    <p className="text-lg text-orange-400 font-medium mb-4">{course.university}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-300">
                      <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-500"/> {course.city}, {course.country}</div>
                      <div className="flex items-center gap-2"><DollarSign size={16} className="text-gray-500"/> ${course.tuition_per_year_usd.toLocaleString()}/yr</div>
                      <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-500"/> {course.duration_months} months</div>
                      {course.ranking <= 100 && (
                        <div className="flex items-center gap-2 text-yellow-500"><TrendingUp size={16}/> Ranked #{course.ranking}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-auto min-w-[120px]">
                    <div className="text-sm text-gray-400 mb-1">Match Score</div>
                    <div className="relevance-bar mb-1">
                      <div className="progress-bar !bg-gray-700">
                        <div className={`progress-fill ${colorClass.split(' ')[1]}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className={`relevance-percent ${colorClass.split(' ')[0]}`}>{percentage}%</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex justify-end">
                      {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-800 bg-gray-900/50 p-6 animate-[fadeIn_0.3s_ease]">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <Info size={16} className="text-orange-500"/> Why it matches
                      </h4>
                      <ul className="space-y-2 mb-6">
                        {reasons.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0"/> {reason}
                          </li>
                        ))}
                      </ul>

                      <h4 className="font-semibold text-white mb-3">Course Details</h4>
                      <p className="text-sm text-gray-300 mb-4 leading-relaxed">{course.description}</p>
                      
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-1">Intakes:</div>
                        <div className="flex gap-2">
                          {course.intake.map(i => <span key={i} className="badge badge-course">{i}</span>)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700 mb-6">
                        <h4 className="font-semibold text-white mb-4">Requirements & Outcomes</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs text-gray-400 uppercase">Eligibility</div>
                            <div className="text-sm text-gray-200">{course.eligibility}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 uppercase">Work Permit Options</div>
                            <div className="text-sm text-green-400">{course.work_permit_info}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 uppercase mb-1">Career Outcomes</div>
                            <div className="flex flex-wrap gap-2">
                              {course.career_outcomes.map(c => (
                                <span key={c} className="tag">{c}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 border-dashed">
                        <h4 className="text-sm font-semibold text-white mb-2">Add Counsellor Note</h4>
                        <textarea 
                          className="form-textarea !min-h-[80px] mb-2 text-sm" 
                          placeholder="Note down thoughts about this recommendation for the student..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                        <button 
                          className="btn btn-outline btn-sm w-full"
                          onClick={() => handleSaveNote(course.id)}
                          disabled={savingNote || !notes.trim()}
                        >
                          {savingNote ? 'Saving...' : 'Save Note to Session'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
