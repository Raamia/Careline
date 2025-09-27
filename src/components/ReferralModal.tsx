'use client';

import { useState } from 'react';
import Modal from './Modal';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { specialty: string; complaint: string; priority: 'routine' | 'urgent' | 'stat' }) => void;
}

export default function ReferralModal({ isOpen, onClose, onSubmit }: ReferralModalProps) {
  const [specialty, setSpecialty] = useState('');
  const [complaint, setComplaint] = useState('');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (specialty.trim() && complaint.trim()) {
      onSubmit({ specialty: specialty.trim(), complaint: complaint.trim(), priority });
      // Reset form
      setSpecialty('');
      setComplaint('');
      setPriority('routine');
      onClose();
    }
  };

  const handleClose = () => {
    setSpecialty('');
    setComplaint('');
    setPriority('routine');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Referral" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Specialty Selection */}
        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-slate-200 mb-2">
            Medical Specialty <span className="text-red-400">*</span>
          </label>
          <select
            id="specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            required
          >
            <option value="">Select a specialty...</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Endocrinology">Endocrinology</option>
            <option value="Gastroenterology">Gastroenterology</option>
            <option value="Neurology">Neurology</option>
            <option value="Oncology">Oncology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Pulmonology">Pulmonology</option>
            <option value="Urology">Urology</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Chief Complaint */}
        <div>
          <label htmlFor="complaint" className="block text-sm font-medium text-slate-200 mb-2">
            Chief Complaint <span className="text-red-400">*</span>
          </label>
          <textarea
            id="complaint"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Briefly describe your symptoms or reason for referral..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
            required
          />
          <p className="mt-1 text-xs text-slate-400">
            Provide a clear description of your symptoms or condition
          </p>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-4">
            Priority Level
          </label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { 
                value: 'routine', 
                label: 'Routine', 
                desc: 'Non-urgent, can wait weeks', 
                icon: '🟢',
                colorClass: 'border-green-500/50 bg-green-500/10 text-green-300',
                selectedClass: 'border-green-400 bg-green-400/20 ring-2 ring-green-400/30'
              },
              { 
                value: 'urgent', 
                label: 'Urgent', 
                desc: 'Needs attention within days', 
                icon: '🟡',
                colorClass: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
                selectedClass: 'border-amber-400 bg-amber-400/20 ring-2 ring-amber-400/30'
              },
              { 
                value: 'stat', 
                label: 'Emergency', 
                desc: 'Immediate attention required', 
                icon: '🔴',
                colorClass: 'border-red-500/50 bg-red-500/10 text-red-300',
                selectedClass: 'border-red-400 bg-red-400/20 ring-2 ring-red-400/30'
              }
            ].map((option) => (
              <label 
                key={option.value} 
                className={`
                  relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 
                  ${priority === option.value 
                    ? option.selectedClass 
                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
                  }
                `}
              >
                <input
                  type="radio"
                  name="priority"
                  value={option.value}
                  checked={priority === option.value}
                  onChange={(e) => setPriority(e.target.value as 'routine' | 'urgent' | 'stat')}
                  className="sr-only"
                />
                
                {/* Selection Indicator */}
                <div className="flex items-center mr-4">
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                    ${priority === option.value 
                      ? 'border-blue-400 bg-blue-500' 
                      : 'border-slate-400'
                    }
                  `}>
                    {priority === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{option.icon}</span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100">{option.label}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{option.desc}</p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`
                      px-3 py-1 rounded-full text-xs font-medium border
                      ${priority === option.value ? option.colorClass : 'border-slate-600 bg-slate-700 text-slate-300'}
                    `}>
                      {option.value === 'stat' ? 'STAT' : option.label}
                    </div>
                  </div>
                </div>
              </label>
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
            disabled={!specialty.trim() || !complaint.trim()}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            Create Referral
          </button>
        </div>
      </form>
    </Modal>
  );
}
