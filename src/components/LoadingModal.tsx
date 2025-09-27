'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LoadingModalProps {
  isOpen: boolean;
  title: string;
  message: string;
}

export default function LoadingModal({ isOpen, title, message }: LoadingModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-in fade-in-0" />
        
        <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-8 w-full max-w-md transform transition-all duration-300 animate-in zoom-in-95">
          {/* Loading Animation */}
          <div className="flex flex-col items-center space-y-6">
            {/* Animated Spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
            </div>
            
            {/* AI Icon */}
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            {/* Title */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
            </div>
            
            {/* Progress Dots */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
