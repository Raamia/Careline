'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Hero() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect logged-in users to dashboard
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  // Don't render hero if user is logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <main className="relative min-h-screen flex flex-col">
      {/* Powered by Gemini AI badge */}
      <div className="flex justify-center pt-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-600 border border-red-200">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          Powered by Gemini AI
        </div>
      </div>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex items-center">
        <div className="text-center w-full">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            AI-Powered Healthcare{' '}
            <br className="hidden sm:block" />
            <span className="text-red-600">Referrals</span> That Actually Work
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Replace outdated phone calls and faxes with intelligent referral management.
            <br className="hidden sm:block" />
            Connect patients with the right specialists instantly, with AI handling the
            <br className="hidden sm:block" />
            heavy lifting.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={user ? "/dashboard" : "/signup"}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-3 rounded-md transition-colors flex items-center group"
            >
              {user ? "Go to Dashboard" : "Get Started"}
              <svg
                className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
            <button className="text-gray-700 hover:text-gray-900 font-medium px-8 py-3 rounded-md transition-colors border border-gray-300 hover:border-gray-400">
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
