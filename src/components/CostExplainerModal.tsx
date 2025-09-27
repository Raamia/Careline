'use client';

import { useState } from 'react';
import Modal from './Modal';

interface CostExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { procedure: string; insurance: string }) => void;
}

export default function CostExplainerModal({ isOpen, onClose, onSubmit }: CostExplainerModalProps) {
  const [procedure, setProcedure] = useState('');
  const [insurance, setInsurance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (procedure.trim()) {
      onSubmit({ procedure: procedure.trim(), insurance: insurance.trim() });
      setProcedure('');
      setInsurance('');
      onClose();
    }
  };

  const handleClose = () => {
    setProcedure('');
    setInsurance('');
    onClose();
  };

  const commonProcedures = [
    'MRI Scan',
    'CT Scan',
    'Ultrasound',
    'X-Ray',
    'Blood Work',
    'EKG/ECG',
    'Colonoscopy',
    'Mammogram',
    'Physical Therapy',
    'Specialist Consultation'
  ];

  const commonInsurance = [
    'Blue Cross Blue Shield',
    'Aetna',
    'Cigna',
    'UnitedHealth',
    'Humana',
    'Medicare',
    'Medicaid',
    'Kaiser Permanente'
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI Cost Explainer" maxWidth="lg">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-200">
                Our AI will analyze your procedure and insurance to provide cost estimates and coverage explanations in plain English.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Procedure Input */}
          <div>
            <label htmlFor="procedure" className="block text-sm font-medium text-slate-200 mb-2">
              Procedure or Treatment <span className="text-red-400">*</span>
            </label>
            <input
              id="procedure"
              type="text"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              placeholder="e.g., MRI of the brain, Cardiology consultation..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              required
            />
            
            {/* Quick Select Procedures */}
            <div className="mt-3">
              <p className="text-xs text-slate-400 mb-2">Common procedures:</p>
              <div className="flex flex-wrap gap-2">
                {commonProcedures.slice(0, 6).map((proc) => (
                  <button
                    key={proc}
                    type="button"
                    onClick={() => setProcedure(proc)}
                    className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded-full hover:bg-slate-600 border border-slate-600 transition-colors duration-200"
                  >
                    {proc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Insurance Input */}
          <div>
            <label htmlFor="insurance" className="block text-sm font-medium text-slate-200 mb-2">
              Insurance Provider
              <span className="text-slate-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              id="insurance"
              type="text"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
              placeholder="e.g., Blue Cross Blue Shield, Aetna..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            
            {/* Quick Select Insurance */}
            <div className="mt-3">
              <p className="text-xs text-slate-400 mb-2">Common insurance providers:</p>
              <div className="flex flex-wrap gap-2">
                {commonInsurance.slice(0, 4).map((ins) => (
                  <button
                    key={ins}
                    type="button"
                    onClick={() => setInsurance(ins)}
                    className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded-full hover:bg-slate-600 border border-slate-600 transition-colors duration-200"
                  >
                    {ins}
                  </button>
                ))}
              </div>
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
              disabled={!procedure.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Analyze Costs</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
