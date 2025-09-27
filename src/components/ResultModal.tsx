'use client';

import Modal from './Modal';

interface Specialist {
  name: string;
  practice: string;
  address?: string;
  notes?: string;
  rating?: number;
}

interface SpecialistsData {
  specialists: Specialist[];
}

interface CostsData {
  estimatedCost: string;
  explanation: string;
  copay?: string;
  deductible?: string;
  notes?: string;
}

interface SummaryData {
  clinicalSummary?: string;
  patientSummary?: string;
  keyFindings?: string[];
  keyPoints?: string[];
  bulletPoints?: string[];
  recommendations?: string[];
  nextSteps?: string[];
  immediateActions?: string[];
  questionsForDoctor?: string[];
  redFlags?: string[];
}

interface ReferralData {
  summary?: string;
}

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'specialists' | 'costs' | 'summary' | 'referral';
  data: unknown;
}

export default function ResultModal({ isOpen, onClose, title, type, data }: ResultModalProps) {

  const renderSpecialists = () => {
    const specialistsData = data as SpecialistsData;
    
    if (!specialistsData?.specialists?.length) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-slate-400">No specialists found in your area. Try adjusting your search criteria.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-200">
                Found <strong>{specialistsData.specialists.length}</strong> specialists in your area
              </p>
              <p className="text-xs text-blue-300/70">Provider details and location information below</p>
            </div>
          </div>
        </div>
        
        {specialistsData.specialists.map((specialist: Specialist, index: number) => (
          <div key={index} className="enterprise-card border-slate-600 hover:border-blue-500 p-5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-100 text-lg">{specialist.name}</h4>
                    <p className="text-slate-300 font-medium">{specialist.practice}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {specialist.rating && (
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm text-slate-300 font-medium">{specialist.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {specialist.address && (
                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-slate-400">{specialist.address}</p>
                    </div>
                  )}
                  
                  
                  {specialist.notes && (
                    <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <p className="text-sm text-slate-300 italic">{specialist.notes}</p>
                    </div>
                  )}
                </div>
                
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCosts = () => {
    const costsData = data as CostsData;
    
    return (
      <div className="space-y-6">
        <div className="enterprise-card border-slate-600 p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Estimated Cost:</span>
              <span className="font-bold text-slate-100 text-xl">{costsData.estimatedCost}</span>
            </div>
            {costsData.copay && (
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Your Copay:</span>
                <span className="font-semibold text-slate-100">{costsData.copay}</span>
              </div>
            )}
            {costsData.deductible && (
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Deductible:</span>
                <span className="font-semibold text-slate-100">{costsData.deductible}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="enterprise-card border-slate-600 p-6">
          <p className="text-slate-200 leading-relaxed">{costsData.explanation}</p>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const summaryData = data as SummaryData;
    const isPatientSummary = summaryData.patientSummary && summaryData.bulletPoints;
    
    if (isPatientSummary) {
      // Enhanced Patient Summary with 15-20 bullet points
      return (
        <div className="space-y-6">
          {/* Overview */}
          <div className="enterprise-card border-slate-600 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-slate-100">Document Summary</h4>
            </div>
            <p className="text-slate-300 leading-relaxed">{summaryData.patientSummary}</p>
          </div>

          {/* Comprehensive Bullet Points */}
          <div className="enterprise-card border-slate-600 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-slate-100">Detailed Explanation</h4>
            </div>
            <div className="grid gap-3">
              {summaryData.bulletPoints?.map((point, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs font-medium">{index + 1}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Immediate Actions */}
          {summaryData.immediateActions && summaryData.immediateActions.length > 0 && (
            <div className="enterprise-card border-amber-500/30 bg-amber-500/5 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-amber-200">Action Items</h4>
              </div>
              <div className="space-y-2">
                {summaryData.immediateActions.map((action, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-amber-400 font-medium flex-shrink-0">→</span>
                    <p className="text-amber-200 font-medium">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions for Doctor */}
          {summaryData.questionsForDoctor && summaryData.questionsForDoctor.length > 0 && (
            <div className="enterprise-card border-purple-500/30 bg-purple-500/5 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-purple-200">Questions for Your Doctor</h4>
              </div>
              <div className="space-y-2">
                {summaryData.questionsForDoctor.map((question, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-purple-400 font-medium flex-shrink-0">?</span>
                    <p className="text-purple-200">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Clinical Summary (for doctors) - keep original format
    const summary = summaryData.clinicalSummary;
    const points = summaryData.keyFindings || summaryData.keyPoints || [];
    const recommendations = summaryData.recommendations || summaryData.nextSteps || [];
    
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Clinical Summary</h4>
          <p className="text-green-800 leading-relaxed">{summary}</p>
        </div>
        
        {points.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Key Points</h4>
            <ul className="space-y-1">
              {points.map((point: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              {summaryData.recommendations ? 'Recommendations' : 'Next Steps'}
            </h4>
            <ul className="space-y-1">
              {recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">→</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {summaryData.redFlags && summaryData.redFlags.length > 0 && (
          <div className="border-l-4 border-red-400 bg-red-50 p-4">
            <h4 className="font-semibold text-red-900 mb-2">Important Notes</h4>
            <ul className="space-y-1">
              {summaryData.redFlags.map((flag: string, index: number) => (
                <li key={index} className="text-red-800 text-sm">{flag}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderReferral = () => {
    const referralData = data as ReferralData;
    
    console.log('🔍 Rendering referral with data:', referralData);
    
    return (
      <div className="space-y-4">
        {referralData?.summary ? (
          <div className="enterprise-card p-6">
            <p className="text-gray-300 leading-relaxed text-lg">
              {referralData.summary}
            </p>
          </div>
        ) : (
          <div className="enterprise-card p-6">
            <p className="text-gray-400 text-center">
              No referral summary available. Please try generating the referral again.
            </p>
            <pre className="text-xs text-gray-500 mt-4 overflow-auto">
              {JSON.stringify(referralData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const getContent = () => {
    switch (type) {
      case 'specialists': return renderSpecialists();
      case 'costs': return renderCosts();
      case 'summary': return renderSummary();
      case 'referral': return renderReferral();
      default: return <p>No data available</p>;
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="xl">
      <div className="space-y-6">
        {getContent()}
      </div>
    </Modal>
  );
}
