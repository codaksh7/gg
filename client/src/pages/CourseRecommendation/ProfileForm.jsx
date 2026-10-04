import { useState, useEffect } from 'react';
import { coursesAPI } from '../../services/api';
import { Target, Globe, DollarSign, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [fields, setFields] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    education_level: 'Bachelors',
    field_of_study: '',
    target_degree: 'Masters',
    gpa: '',
    preferred_countries: [],
    budget_max: '',
    preferred_intake: '',
    career_goals: '',
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [cRes, fRes] = await Promise.all([
          coursesAPI.getCountries(),
          coursesAPI.getFields()
        ]);
        setCountries(cRes.data.countries);
        setFields(fRes.data.fields);
      } catch (err) {
        console.error("Failed to fetch form options", err);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryToggle = (country) => {
    setFormData(prev => {
      const isSelected = prev.preferred_countries.includes(country);
      if (isSelected) {
        return { ...prev, preferred_countries: prev.preferred_countries.filter(c => c !== country) };
      } else {
        return { ...prev, preferred_countries: [...prev.preferred_countries, country] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Format numeric fields
    const payload = {
      ...formData,
      gpa: formData.gpa ? parseFloat(formData.gpa) : null,
      budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
    };

    try {
      const res = await coursesAPI.recommend(payload);
      toast.success('Recommendations generated successfully!');
      onSuccess(payload, res.data.recommendations);
    } catch (err) {
      toast.error('Failed to generate recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-course max-w-4xl mx-auto">
      <div className="mb-6 border-b border-gray-800 pb-6">
        <h2 className="text-2xl font-bold mb-2">Student Profile Setup</h2>
        <p className="text-gray-400">Fill in the student's details below to generate personalized course recommendations.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label flex items-center gap-2"><GraduationCap size={16}/> Current Education</label>
            <select className="form-select" name="education_level" value={formData.education_level} onChange={handleChange}>
              <option value="High School">High School</option>
              <option value="Bachelors">Bachelors Degree</option>
              <option value="Masters">Masters Degree</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label flex items-center gap-2"><Target size={16}/> Target Degree</label>
            <select className="form-select" name="target_degree" value={formData.target_degree} onChange={handleChange}>
              <option value="Bachelors">Bachelors</option>
              <option value="Masters">Masters</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Field of Interest</label>
            <select className="form-select" name="field_of_study" value={formData.field_of_study} onChange={handleChange} required>
              <option value="">Select a field...</option>
              {fields.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Current GPA (out of 4.0)</label>
            <input 
              type="number" 
              step="0.1" 
              min="0" 
              max="4.0" 
              className="form-input" 
              name="gpa" 
              value={formData.gpa} 
              onChange={handleChange}
              placeholder="e.g. 3.5"
            />
          </div>
        </div>

        <div className="grid-2 mt-4">
          <div className="form-group">
            <label className="form-label flex items-center gap-2"><DollarSign size={16}/> Max Annual Tuition Budget (USD)</label>
            <input 
              type="number" 
              className="form-input" 
              name="budget_max" 
              value={formData.budget_max} 
              onChange={handleChange}
              placeholder="e.g. 40000"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Preferred Intake</label>
            <select className="form-select" name="preferred_intake" value={formData.preferred_intake} onChange={handleChange}>
              <option value="">Any</option>
              <option value="September">Fall (September/October)</option>
              <option value="January">Spring (January/February)</option>
              <option value="June">Summer (June/July)</option>
            </select>
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="form-label flex items-center gap-2"><Globe size={16}/> Preferred Countries</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {countries.map(country => (
              <button
                key={country}
                type="button"
                onClick={() => handleCountryToggle(country)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  formData.preferred_countries.includes(country) 
                    ? 'bg-orange-500 text-white border-orange-500' 
                    : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-orange-500'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group mt-6">
          <label className="form-label">Career Goals & Preferences</label>
          <textarea 
            className="form-textarea" 
            name="career_goals" 
            value={formData.career_goals} 
            onChange={handleChange}
            placeholder="e.g. Want to work as a Software Engineer in Silicon Valley. Looking for programs with strong industry connections and post-study work options."
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" className="btn btn-course btn-lg px-12" disabled={loading}>
            {loading ? 'Analyzing Profile...' : 'Generate Recommendations'}
          </button>
        </div>
      </form>
    </div>
  );
}
