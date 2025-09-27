'use client';

import { useState } from 'react';
import Modal from './Modal';

interface RecordsSummarizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { documentFile: File; forDoctor: boolean }) => void;
  userRole: 'patient' | 'doctor';
}

export default function RecordsSummarizerModal({ isOpen, onClose, onSubmit, userRole }: RecordsSummarizerModalProps) {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [summaryType, setSummaryType] = useState<'patient' | 'doctor'>(userRole);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentFile) {
      onSubmit({ 
        documentFile: documentFile, 
        forDoctor: summaryType === 'doctor' 
      });
      setDocumentFile(null);
      onClose();
    }
  };

  const handleClose = () => {
    setDocumentFile(null);
    setSummaryType(userRole);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setDocumentFile(file);
    } else {
      alert('Please select a PDF file only.');
    }
  };


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
                Upload medical documents, lab results, or clinical notes as PDF files. Our AI will create {summaryType === 'doctor' ? 'clinical summaries for healthcare providers' : 'easy-to-understand explanations for patients'}.
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

          {/* Document File Upload */}
          <div>
            <label htmlFor="documentFile" className="block text-sm font-medium text-slate-200 mb-2">
              Medical Document (PDF) <span className="text-red-400">*</span>
            </label>
            
            <div className="relative">
              <input
                type="file"
                id="documentFile"
                accept=".pdf"
                onChange={handleFileChange}
                className="sr-only"
                required
              />
              
              <label
                htmlFor="documentFile"
                className={`
                  w-full min-h-[200px] border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center p-8
                  ${documentFile 
                    ? 'border-green-500 bg-green-500/10 hover:bg-green-500/20' 
                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
                  }
                `}
              >
                {documentFile ? (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-300 font-medium mb-2">{documentFile.name}</p>
                    <p className="text-slate-400 text-sm">
                      {(documentFile.size / 1024 / 1024).toFixed(2)} MB • Click to change
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-slate-200 font-medium mb-2">Drop your PDF here or click to browse</p>
                    <p className="text-slate-400 text-sm">
                      Upload medical documents, lab results, or clinical notes (PDF only)
                    </p>
                  </div>
                )}
              </label>
            </div>
            
            <div className="mt-2">
              <p className="text-xs text-slate-400">
                Accepts PDF files containing lab results, radiology reports, clinical notes, discharge summaries, etc.
              </p>
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
              disabled={!documentFile}
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
