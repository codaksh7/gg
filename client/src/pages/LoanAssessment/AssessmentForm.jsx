import { useState } from 'react';
import { loansAPI } from '../../services/api';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Study Details', 'Funding', 'Financial Profile', 'Collateral', 'Documents'];

export default function AssessmentForm({ onSuccess }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [formData, setFormData] = useState({
    gender: 'male',
    university_rank: '',
    study: {
      country: '',
      university: '',
      course: '',
      duration_years: 1,
      tuition_per_year: 0,
      living_cost_per_year: 0,
      other_costs: 0
    },
    funding: {
      savings: 0,
      scholarship: 0,
      fees_paid: 0,
      family_contribution: 0,
      other_funding: 0
    },
    financial: {
      annual_income: 0,
      cibil_score: '',
      total_assets: 0,
      total_liabilities: 0,
      employment_type: 'salaried'
    },
    collateral: {
      has_collateral: false,
      property_type: 'residential',
      property_value: 0,
      existing_mortgage: 0,
      property_location: ''
    }
  });

  const handleChange = (section, field, value) => {
    if (section === 'root') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await loansAPI.uploadDocument(file, docType);
      setUploadedFiles(prev => [...prev, res.data.document]);
      toast.success('Document uploaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Parse numbers
      const payload = {
        ...formData,
        university_rank: formData.university_rank ? parseInt(formData.university_rank) : null,
        study: {
          ...formData.study,
          duration_years: parseFloat(formData.study.duration_years),
          tuition_per_year: parseFloat(formData.study.tuition_per_year),
          living_cost_per_year: parseFloat(formData.study.living_cost_per_year),
          other_costs: parseFloat(formData.study.other_costs)
        },
        funding: {
          savings: parseFloat(formData.funding.savings),
          scholarship: parseFloat(formData.funding.scholarship),
          fees_paid: parseFloat(formData.funding.fees_paid),
          family_contribution: parseFloat(formData.funding.family_contribution),
          other_funding: parseFloat(formData.funding.other_funding)
        },
        financial: {
          ...formData.financial,
          annual_income: parseFloat(formData.financial.annual_income),
          cibil_score: formData.financial.cibil_score ? parseInt(formData.financial.cibil_score) : null,
          total_assets: parseFloat(formData.financial.total_assets),
          total_liabilities: parseFloat(formData.financial.total_liabilities)
        },
        collateral: {
          ...formData.collateral,
          property_value: parseFloat(formData.collateral.property_value),
          existing_mortgage: parseFloat(formData.collateral.existing_mortgage)
        }
      };

      const res = await loansAPI.assess(payload);
      onSuccess(res.data, payload);
    } catch (err) {
      toast.error('Failed to generate assessment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid-2 animate-[fadeIn_0.3s_ease]">
            <div className="form-group">
              <label className="form-label">Study Country</label>
              <select className="form-select" value={formData.study.country} onChange={(e) => handleChange('study', 'country', e.target.value)}>
                <option value="">Select country...</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">University</label>
              <input type="text" className="form-input" value={formData.study.university} onChange={(e) => handleChange('study', 'university', e.target.value)} placeholder="e.g. Stanford University" />
            </div>
            <div className="form-group">
              <label className="form-label">University Global Rank (if known)</label>
              <input type="number" className="form-input" value={formData.university_rank} onChange={(e) => handleChange('root', 'university_rank', e.target.value)} placeholder="e.g. 15" />
              <p className="text-xs text-gray-500 mt-1">Some lenders offer non-collateral loans for Top 100 ranked universities.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Course Name</label>
              <input type="text" className="form-input" value={formData.study.course} onChange={(e) => handleChange('study', 'course', e.target.value)} placeholder="e.g. MS Computer Science" />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (Years)</label>
              <input type="number" step="0.5" className="form-input" value={formData.study.duration_years} onChange={(e) => handleChange('study', 'duration_years', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={formData.gender} onChange={(e) => handleChange('root', 'gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Some lenders offer interest rate concessions for female students.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Tuition Fee (Per Year) [INR]</label>
              <input type="number" className="form-input" value={formData.study.tuition_per_year} onChange={(e) => handleChange('study', 'tuition_per_year', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Living Cost (Per Year) [INR]</label>
              <input type="number" className="form-input" value={formData.study.living_cost_per_year} onChange={(e) => handleChange('study', 'living_cost_per_year', e.target.value)} />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="grid-2 animate-[fadeIn_0.3s_ease]">
            <div className="form-group">
              <label className="form-label">Personal Savings [INR]</label>
              <input type="number" className="form-input" value={formData.funding.savings} onChange={(e) => handleChange('funding', 'savings', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Scholarships [INR]</label>
              <input type="number" className="form-input" value={formData.funding.scholarship} onChange={(e) => handleChange('funding', 'scholarship', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Fees Already Paid [INR]</label>
              <input type="number" className="form-input" value={formData.funding.fees_paid} onChange={(e) => handleChange('funding', 'fees_paid', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Family Contribution [INR]</label>
              <input type="number" className="form-input" value={formData.funding.family_contribution} onChange={(e) => handleChange('funding', 'family_contribution', e.target.value)} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid-2 animate-[fadeIn_0.3s_ease]">
            <div className="form-group">
              <label className="form-label">Co-applicant Annual Income [INR]</label>
              <input type="number" className="form-input" value={formData.financial.annual_income} onChange={(e) => handleChange('financial', 'annual_income', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Co-applicant CIBIL Score</label>
              <input type="number" className="form-input" value={formData.financial.cibil_score} onChange={(e) => handleChange('financial', 'cibil_score', e.target.value)} placeholder="e.g. 750" />
            </div>
            <div className="form-group">
              <label className="form-label">Co-applicant Employment Type</label>
              <select className="form-select" value={formData.financial.employment_type} onChange={(e) => handleChange('financial', 'employment_type', e.target.value)}>
                <option value="salaried">Salaried</option>
                <option value="self_employed">Self Employed / Business</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Total Liabilities / Existing Loans [INR]</label>
              <input type="number" className="form-input" value={formData.financial.total_liabilities} onChange={(e) => handleChange('financial', 'total_liabilities', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Total Assets (Excluding Property) [INR]</label>
              <input type="number" className="form-input" value={formData.financial.total_assets} onChange={(e) => handleChange('financial', 'total_assets', e.target.value)} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-[fadeIn_0.3s_ease] max-w-2xl">
            <div className="form-group bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-700"
                  checked={formData.collateral.has_collateral}
                  onChange={(e) => handleChange('collateral', 'has_collateral', e.target.checked)}
                />
                <span className="text-white font-medium">I have property to offer as collateral</span>
              </label>
              <p className="text-sm text-gray-400 mt-2 ml-8">Checking this opens up more loan options with lower interest rates.</p>
            </div>

            {formData.collateral.has_collateral && (
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <select className="form-select" value={formData.collateral.property_type} onChange={(e) => handleChange('collateral', 'property_type', e.target.value)}>
                    <option value="residential">Residential (House/Flat)</option>
                    <option value="commercial">Commercial Property</option>
                    <option value="plot">Empty Plot</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Property Location</label>
                  <input type="text" className="form-input" value={formData.collateral.property_location} onChange={(e) => handleChange('collateral', 'property_location', e.target.value)} placeholder="City, State" />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Property Value [INR]</label>
                  <input type="number" className="form-input" value={formData.collateral.property_value} onChange={(e) => handleChange('collateral', 'property_value', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Existing Mortgage/Loan on Property [INR]</label>
                  <input type="number" className="form-input" value={formData.collateral.existing_mortgage} onChange={(e) => handleChange('collateral', 'existing_mortgage', e.target.value)} />
                </div>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="animate-[fadeIn_0.3s_ease]">
            <p className="text-gray-400 mb-6">Optional: Upload preliminary documents to speed up processing. A detailed checklist will be generated in your assessment.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Document Type</label>
                  <select className="form-select" id="docTypeSelect">
                    <option value="itr">ITR (Last 2 years)</option>
                    <option value="bank_statement">Bank Statement (6 months)</option>
                    <option value="salary_slip">Salary Slips</option>
                    <option value="admission_letter">Proof of Admission</option>
                    <option value="kyc">KYC (PAN/Aadhaar)</option>
                  </select>
                </div>
                
                <label className="upload-zone block">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, document.getElementById('docTypeSelect').value)}
                    disabled={uploading}
                  />
                  <div className="upload-zone-icon"><Upload /></div>
                  <p className="font-medium text-white">{uploading ? 'Uploading...' : 'Click or drag file to upload'}</p>
                  <p className="upload-hint">PDF, JPG, PNG up to 10MB</p>
                </label>
              </div>

              <div>
                <h4 className="font-medium text-white mb-3 flex items-center gap-2"><FileText size={18}/> Uploaded Documents</h4>
                {uploadedFiles.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-gray-800/30 p-4 rounded-lg border border-gray-700/50 border-dashed text-center">
                    No documents uploaded yet
                  </div>
                ) : (
                  <div className="document-list">
                    {uploadedFiles.map((doc, i) => (
                      <div key={i} className="document-item">
                        <CheckCircle2 className="document-item-icon" />
                        <div className="document-item-info">
                          <div className="document-item-name">{doc.filename}</div>
                          <div className="document-item-size text-emerald-400">{(doc.size / 1024).toFixed(1)} KB • {doc.doc_type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card card-loan max-w-4xl mx-auto">
      <div className="stepper">
        {STEPS.map((step, idx) => (
          <div key={step} className={`step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}>
            <div className="step-number">{idx < currentStep ? '✓' : idx + 1}</div>
            <div className="step-label hidden md:block">{step}</div>
            {idx < STEPS.length - 1 && <div className={`step-connector ${idx < currentStep ? 'completed' : ''}`}></div>}
          </div>
        ))}
      </div>

      <div className="mb-8 min-h-[300px]">
        {renderStepContent()}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-800">
        <button 
          className="btn btn-secondary" 
          onClick={prevStep}
          disabled={currentStep === 0 || loading}
        >
          Back
        </button>
        
        {currentStep < STEPS.length - 1 ? (
          <button className="btn btn-loan" onClick={nextStep}>
            Next Step
          </button>
        ) : (
          <button className="btn btn-loan px-8" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Processing...' : 'Generate Assessment'}
          </button>
        )}
      </div>
    </div>
  );
}
