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
          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
            Medical Specialty <span className="text-red-500">*</span>
          </label>
          <select
            id="specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
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
          <label htmlFor="complaint" className="block text-sm font-medium text-gray-700 mb-2">
            Chief Complaint <span className="text-red-500">*</span>
          </label>
          <textarea
            id="complaint"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Briefly describe your symptoms or reason for referral..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 resize-none"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Provide a clear description of your symptoms or condition
          </p>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Priority Level
          </label>
          <div className="space-y-2">
            {[
              { value: 'routine', label: 'Routine', desc: 'Non-urgent, can wait weeks', color: 'green' },
              { value: 'urgent', label: 'Urgent', desc: 'Needs attention within days', color: 'yellow' },
              { value: 'stat', label: 'STAT', desc: 'Immediate attention required', color: 'red' }
            ].map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="priority"
                  value={option.value}
                  checked={priority === option.value}
                  onChange={(e) => setPriority(e.target.value as 'routine' | 'urgent' | 'stat')}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-all duration-200 ${
                  priority === option.value 
                    ? `border-${option.color}-500 bg-${option.color}-500` 
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {priority === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs bg-${option.color}-100 text-${option.color}-800`}>
                      {option.value === 'stat' ? 'Emergency' : option.value}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!specialty.trim() || !complaint.trim()}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Create Referral
          </button>
        </div>
      </form>
    </Modal>
  );
}
