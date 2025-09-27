'use client';

import { useState } from 'react';
import Modal from './Modal';

interface RecordsSummarizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { documentText: string; forDoctor: boolean }) => void;
  userRole: 'patient' | 'doctor';
}

export default function RecordsSummarizerModal({ isOpen, onClose, onSubmit, userRole }: RecordsSummarizerModalProps) {
  const [documentText, setDocumentText] = useState('');
  const [summaryType, setSummaryType] = useState<'patient' | 'doctor'>(userRole);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentText.trim()) {
      onSubmit({ 
        documentText: documentText.trim(), 
        forDoctor: summaryType === 'doctor' 
      });
      setDocumentText('');
      onClose();
    }
  };

  const handleClose = () => {
    setDocumentText('');
    setSummaryType(userRole);
    onClose();
  };

  const exampleTexts = [
    {
      title: "Lab Results",
      content: "CBC: WBC 7.2, RBC 4.5, Hgb 14.2, Hct 42.1, Platelets 250. Chemistry: Glucose 95, BUN 18, Creatinine 1.0, eGFR >60."
    },
    {
      title: "Radiology Report", 
      content: "CT Chest w/o contrast: No acute pulmonary embolism. Mild emphysematous changes. Small bilateral pleural effusions."
    },
    {
      title: "Progress Note",
      content: "Patient reports improvement in shortness of breath since starting ACE inhibitor. Blood pressure well controlled at 125/78. Continue current medications."
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI Records Summarizer" maxWidth="xl">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-200">
                Paste medical documents, lab results, or clinical notes. Our AI will create {summaryType === 'doctor' ? 'clinical summaries for healthcare providers' : 'easy-to-understand explanations for patients'}.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Summary Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-4">
              Summary Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`
                cursor-pointer border-2 rounded-xl p-5 transition-all duration-200 relative
                ${summaryType === 'patient' 
                  ? 'border-green-400 bg-green-400/10 ring-2 ring-green-400/20' 
                  : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
                }
              `}>
                <input
                  type="radio"
                  name="summaryType"
                  value="patient"
                  checked={summaryType === 'patient'}
                  onChange={(e) => setSummaryType(e.target.value as 'patient' | 'doctor')}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                    ${summaryType === 'patient' 
                      ? 'border-green-400 bg-green-500' 
                      : 'border-slate-400'
                    }
                  `}>
                    {summaryType === 'patient' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div className="font-semibold text-slate-100">Patient-Friendly</div>
                    </div>
                    <div className="text-xs text-slate-400">Easy-to-understand explanation</div>
                  </div>
                </div>
              </label>
              
              <label className={`
                cursor-pointer border-2 rounded-xl p-5 transition-all duration-200 relative
                ${summaryType === 'doctor' 
                  ? 'border-blue-400 bg-blue-400/10 ring-2 ring-blue-400/20' 
                  : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
                }
              `}>
                <input
                  type="radio"
                  name="summaryType"
                  value="doctor"
                  checked={summaryType === 'doctor'}
                  onChange={(e) => setSummaryType(e.target.value as 'patient' | 'doctor')}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                    ${summaryType === 'doctor' 
                      ? 'border-blue-400 bg-blue-500' 
                      : 'border-slate-400'
                    }
                  `}>
                    {summaryType === 'doctor' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="font-semibold text-slate-100">Clinical Summary</div>
                    </div>
                    <div className="text-xs text-slate-400">Medical terminology for providers</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Document Text Input */}
          <div>
            <label htmlFor="documentText" className="block text-sm font-medium text-slate-200 mb-2">
              Medical Document Text <span className="text-red-400">*</span>
            </label>
            <textarea
              id="documentText"
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste your medical document, lab results, clinical notes, or any healthcare text here..."
              rows={8}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none font-mono text-sm"
              required
            />
            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-slate-400">
                Accepts lab results, radiology reports, clinical notes, discharge summaries, etc.
              </p>
              <p className="text-xs text-slate-500">
                {documentText.length} characters
              </p>
            </div>
          </div>

          {/* Example Documents */}
          <div>
            <p className="text-sm font-medium text-slate-200 mb-3">Example documents to try:</p>
            <div className="space-y-2">
              {exampleTexts.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setDocumentText(example.content)}
                  className="w-full text-left p-3 border border-slate-600 bg-slate-800/50 rounded-lg hover:border-slate-500 hover:bg-slate-800 transition-colors duration-200"
                >
                  <div className="font-medium text-sm text-slate-100">{example.title}</div>
                  <div className="text-xs text-slate-400 truncate">{example.content}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 hover:border-slate-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!documentText.trim()}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Summarize Document</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
