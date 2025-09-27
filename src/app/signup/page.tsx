'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('patient');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/croppedcarline.png"
            alt="Careline"
            className="h-16 w-auto"
          />
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="text-base font-medium text-gray-900">
                I am a:
              </label>
              <p className="text-sm leading-5 text-gray-500">
                Choose your account type to get started
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('patient')}
                  className={`relative rounded-lg border-2 p-4 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                    selectedRole === 'patient'
                      ? 'border-red-600 bg-red-50 hover:bg-red-100'
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedRole === 'patient'
                          ? 'bg-red-600'
                          : 'border-2 border-gray-300'
                      }`}>
                        {selectedRole === 'patient' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <span className="block text-sm font-semibold text-gray-900">
                        Patient
                      </span>
                      <span className="block text-sm text-gray-600">
                        I need referrals to specialists
                      </span>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedRole('provider')}
                  className={`relative rounded-lg border-2 p-4 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                    selectedRole === 'provider'
                      ? 'border-red-600 bg-red-50 hover:bg-red-100'
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedRole === 'provider'
                          ? 'bg-red-600'
                          : 'border-2 border-gray-300'
                      }`}>
                        {selectedRole === 'provider' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <span className="block text-sm font-semibold text-gray-900">
                        Healthcare Provider
                      </span>
                      <span className="block text-sm text-gray-600">
                        I manage patient referrals
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Auth0 Signup Button */}
            <div>
              <a
                href="/api/auth/login?screen_hint=signup"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Create Account
              </a>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            {/* Social Signup Options */}
            <div className="flex justify-center">
              <a
                href="/api/auth/login?connection=google-oauth2&screen_hint=signup"
                className="w-full max-w-xs inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </a>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              What you'll get:
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI-powered specialist matching
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Instant cost explanations
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Digital referral management
              </li>
            </ul>
          </div>

          {/* Help Text */}
          <div className="mt-6">
            <p className="text-center text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-red-600 hover:text-red-500">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-red-600 hover:text-red-500">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
