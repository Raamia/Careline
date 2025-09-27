'use client';

import { useState } from 'react';
import Modal from './Modal';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'specialists' | 'costs' | 'summary' | 'referral';
  data: any;
}

export default function ResultModal({ isOpen, onClose, title, type, data }: ResultModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderSpecialists = () => {
    if (!data?.specialists?.length) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No specialists found. Try a different specialty or location.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-purple-700">
            Found <strong>{data.specialists.length}</strong> specialists in your area. Contact information and scheduling details below.
          </p>
        </div>
        
        {data.specialists.map((specialist: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors duration-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{specialist.name}</h4>
                <p className="text-gray-600 mt-1">{specialist.practice}</p>
                {specialist.address && (
                  <p className="text-sm text-gray-500 mt-1">{specialist.address}</p>
                )}
                {specialist.phone && (
                  <p className="text-sm text-blue-600 mt-1">{specialist.phone}</p>
                )}
                {specialist.notes && (
                  <p className="text-sm text-gray-600 mt-2 italic">{specialist.notes}</p>
                )}
              </div>
              <div className="ml-4 flex flex-col items-end space-y-2">
                {specialist.inNetwork && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    In Network
                  </span>
                )}
                {specialist.rating && (
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600">{specialist.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCosts = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Cost Breakdown</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-blue-700">Estimated Cost:</span>
            <span className="font-semibold text-blue-900">{data.estimatedCost}</span>
          </div>
          {data.copay && (
            <div className="flex justify-between">
              <span className="text-blue-700">Your Copay:</span>
              <span className="font-semibold text-blue-900">{data.copay}</span>
            </div>
          )}
          {data.deductible && (
            <div className="flex justify-between">
              <span className="text-blue-700">Deductible:</span>
              <span className="font-semibold text-blue-900">{data.deductible}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Explanation</h4>
        <p className="text-gray-700 leading-relaxed">{data.explanation}</p>
      </div>
      
      {data.notes && (
        <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
          <p className="text-yellow-800 text-sm">{data.notes}</p>
        </div>
      )}
    </div>
  );

  const renderSummary = () => {
    const summary = data.clinicalSummary || data.patientSummary;
    const points = data.keyFindings || data.keyPoints || [];
    const recommendations = data.recommendations || data.nextSteps || [];
    
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">AI Summary</h4>
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
              {data.recommendations ? 'Recommendations' : 'Next Steps'}
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
        
        {data.redFlags && data.redFlags.length > 0 && (
          <div className="border-l-4 border-red-400 bg-red-50 p-4">
            <h4 className="font-semibold text-red-900 mb-2">⚠️ Important Notes</h4>
            <ul className="space-y-1">
              {data.redFlags.map((flag: string, index: number) => (
                <li key={index} className="text-red-800 text-sm">{flag}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderReferral = () => (
    <div className="space-y-4">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-2">Referral Generated</h4>
        <p className="text-indigo-800 text-sm">Your referral packet has been created and is ready for your healthcare provider.</p>
      </div>
      
      {data.patientInstructions && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Patient Instructions</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">{data.patientInstructions}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.estimatedTimeframe && (
          <div className="bg-blue-50 rounded-lg p-3">
            <h5 className="font-medium text-blue-900 mb-1">Timeline</h5>
            <p className="text-blue-800 text-sm">{data.estimatedTimeframe}</p>
          </div>
        )}
        
        {data.urgencyNotes && (
          <div className="bg-yellow-50 rounded-lg p-3">
            <h5 className="font-medium text-yellow-900 mb-1">Priority</h5>
            <p className="text-yellow-800 text-sm">{data.urgencyNotes}</p>
          </div>
        )}
      </div>
      
      {data.requiredDocuments && data.requiredDocuments.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Required Documents</h4>
          <ul className="space-y-1">
            {data.requiredDocuments.map((doc: string, index: number) => (
              <li key={index} className="flex items-center">
                <span className="text-indigo-500 mr-2">📄</span>
                <span className="text-gray-700">{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const getContent = () => {
    switch (type) {
      case 'specialists': return renderSpecialists();
      case 'costs': return renderCosts();
      case 'summary': return renderSummary();
      case 'referral': return renderReferral();
      default: return <p>No data available</p>;
    }
  };

  const getActionButton = () => {
    const text = JSON.stringify(data, null, 2);
    
    return (
      <button
        onClick={() => handleCopy(text)}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
      >
        {copied ? (
          <>
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy Results</span>
          </>
        )}
      </button>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="xl">
      <div className="space-y-6">
        {getContent()}
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Results generated by Careline AI • Always consult with healthcare professionals
          </p>
          <div className="flex space-x-3">
            {getActionButton()}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
