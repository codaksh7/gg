import { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Building2, Landmark, FileText, Download, Calculator, XCircle } from 'lucide-react';
import { loansAPI } from '../../services/api';

export default function AssessmentResult({ result, requestData, onReset }) {
  const [emiTenure, setEmiTenure] = useState(10);
  const [emiCalculations, setEmiCalculations] = useState({});

  const {
    summary, status, cost_breakdown, funding_available,
    loan_requirement, financial_summary, collateral_assessment,
    eligible_lenders, document_checklist
  } = result;

  const handleCalculateEMI = async (principal, rate, lenderName) => {
    try {
      const res = await loansAPI.calculateEMI(principal, rate, emiTenure);
      setEmiCalculations(prev => ({
        ...prev,
        [lenderName]: res.data
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = () => {
    if (status === 'fully_funded') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (status === 'eligible') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  const StatusIcon = () => {
    if (status === 'fully_funded') return <CheckCircle2 className="text-green-500" size={24} />;
    if (status === 'eligible') return <CheckCircle2 className="text-emerald-500" size={24} />;
    return <AlertTriangle className="text-amber-500" size={24} />;
  };

  return (
    <div className="space-y-8 page-enter">
      <button onClick={onReset} className="back-btn">
        <ArrowLeft size={18} /> Edit Profile Details
      </button>

      {/* Summary Banner */}
      <div className={`p-6 rounded-xl border ${getStatusColor()} flex items-start gap-4`}>
        <div className="mt-1"><StatusIcon /></div>
        <div>
          <h2 className="text-lg font-bold mb-1">Assessment Summary</h2>
          <p>{summary}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Financial Overview */}
        <div className="card card-loan">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Landmark size={20} className="text-emerald-500"/> Financial Overview</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Total Study Cost</span>
                <span className="text-white font-medium">₹{cost_breakdown.total_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-400">Available Funding</span>
                <span className="text-emerald-400 font-medium">- ₹{funding_available.total_available.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-gray-800 flex justify-between text-base font-bold">
                <span className="text-gray-300">Funding Gap (Loan Required)</span>
                <span className="text-white">₹{loan_requirement.loan_required.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase font-semibold mb-3">Applicant Profile</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">CIBIL Score</div>
                  <div className={`font-medium ${financial_summary.cibil_score >= 700 ? 'text-green-400' : 'text-amber-400'}`}>
                    {financial_summary.cibil_score || 'Not provided'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Net Worth</div>
                  <div className="font-medium text-white">₹{financial_summary.net_worth.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {collateral_assessment.has_collateral && (
              <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-lg p-4">
                <div className="text-xs text-emerald-500 uppercase font-semibold mb-2">Collateral Assessment</div>
                <div className="text-sm text-gray-300 mb-3">{collateral_assessment.assessment}</div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Net Property Value</span>
                  <span className="text-white font-medium">₹{collateral_assessment.net_collateral_value.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lender Matches */}
        <div className="card border-gray-800">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Building2 size={20} className="text-blue-500"/> Lender Matches</h3>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {eligible_lenders.length === 0 ? (
              <div className="text-center p-8 text-gray-500">No matching lenders found for your profile.</div>
            ) : (
              eligible_lenders.map((lender, i) => (
                <div key={i} className={`p-4 rounded-lg border ${lender.is_eligible ? 'border-gray-700 bg-gray-800/50' : 'border-red-900/30 bg-red-900/10 opacity-70'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-white text-lg">{lender.lender_full_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge bg-gray-700">{lender.loan_type}</span>
                        {lender.is_eligible ? (
                          <span className="badge badge-success">Eligible</span>
                        ) : (
                          <span className="badge badge-error">Not Eligible</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-display font-bold text-emerald-400">{lender.interest_rate}%</div>
                      <div className="text-xs text-gray-500">Interest Rate</div>
                    </div>
                  </div>

                  {lender.note && <div className="text-sm text-amber-400/80 mb-3 bg-amber-900/10 p-2 rounded">{lender.note}</div>}
                  
                  {!lender.is_eligible && lender.eligibility_issues.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {lender.eligibility_issues.map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-red-400">
                          <XCircle size={14} className="mt-0.5 shrink-0"/> {issue}
                        </div>
                      ))}
                    </div>
                  )}

                  {lender.is_eligible && loan_requirement.loan_required > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-700">
                      {emiCalculations[lender.lender] ? (
                        <div className="bg-gray-900 p-3 rounded text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-400">Monthly EMI ({emiCalculations[lender.lender].tenure_years} yrs):</span>
                            <span className="text-white font-bold">₹{emiCalculations[lender.lender].monthly_emi.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Total Interest:</span>
                            <span className="text-red-400">₹{emiCalculations[lender.lender].total_interest.toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-outline btn-sm w-full text-xs"
                          onClick={() => handleCalculateEMI(loan_requirement.loan_required, lender.interest_rate, lender.lender)}
                        >
                          <Calculator size={14}/> Calculate EMI Estimate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="card border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20} className="text-purple-500"/> Document Checklist</h3>
          <span className="badge bg-gray-800">{document_checklist.route} route</span>
        </div>
        
        <p className="text-sm text-gray-400 mb-6">{document_checklist.note}</p>

        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(document_checklist.document_categories).map(([category, docs]) => {
            const title = category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return (
              <div key={category}>
                <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">{title}</h4>
                <ul className="checklist">
                  {docs.map((doc, idx) => (
                    <li key={idx}>
                      <div className="w-5 h-5 rounded border border-gray-600 flex items-center justify-center shrink-0 mt-0.5 bg-gray-800"></div>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
