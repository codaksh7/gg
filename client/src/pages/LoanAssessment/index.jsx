import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import AssessmentForm from './AssessmentForm';
import AssessmentResult from './AssessmentResult';

export default function LoanAssessment() {
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="container py-8">
      <div className="project-page-header">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
            <DollarSign size={32} />
          </div>
          <h1>Education Loan Assessment Tool</h1>
        </div>
        <p>Calculate your funding gap, check collateral options, and find eligible lenders.</p>
      </div>

      <Routes>
        <Route path="/" element={
          assessmentResult ? (
            <AssessmentResult 
              result={assessmentResult} 
              requestData={requestData}
              onReset={() => {
                setAssessmentResult(null);
                setRequestData(null);
              }}
            />
          ) : (
            <AssessmentForm 
              onSuccess={(result, reqData) => {
                setAssessmentResult(result);
                setRequestData(reqData);
              }}
            />
          )
        } />
      </Routes>
    </div>
  );
}
