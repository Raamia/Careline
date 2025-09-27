'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Stethoscope, ArrowRight, Users, Clock, DollarSign } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // TODO: Determine user role and redirect appropriately
      // For now, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-2" />
              <span className="text-2xl font-bold text-gray-900">CareLine</span>
            </div>
            <div className="space-x-4">
              <a
                href="/api/auth/login?screen_hint=signup&role=patient"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Patient Portal
              </a>
              <a
                href="/api/auth/login?screen_hint=signup&role=doctor"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Doctor Portal
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Intelligent Medical Referrals
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            CareLine connects patients with specialists seamlessly using AI-powered matching, 
            transparent pricing, and instant availability. No more waiting weeks for referral coordination.
          </p>
          <div className="flex justify-center space-x-6">
            <a
              href="/api/auth/login?role=patient"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
            >
              I'm a Patient
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href="/api/auth/login?role=doctor"
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
            >
              I'm a Doctor
              <Stethoscope className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How CareLine Works
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Patient Flow */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center mb-6">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">For Patients</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Instant Referral Cards</h4>
                    <p className="text-gray-600">See your referrals immediately with clear explanations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Choose Your Specialist</h4>
                    <p className="text-gray-600">Browse in-network providers with transparent pricing</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Plain English Explanations</h4>
                    <p className="text-gray-600">Understand your condition and what to expect</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Flow */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center mb-6">
                <Stethoscope className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">For Doctors</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">AI-Generated Briefs</h4>
                    <p className="text-gray-600">Receive clean, structured patient summaries</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Key Information First</h4>
                    <p className="text-gray-600">Problem list, medications, allergies, and red flags</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Auto-Updates</h4>
                    <p className="text-gray-600">Get notified when new records arrive</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-16 bg-white rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose CareLine?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Save Time</h3>
              <p className="text-gray-600">
                No more waiting weeks for referral coordination. See options instantly.
              </p>
            </div>
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-gray-600">
                Know your costs upfront with accurate insurance estimates.
              </p>
            </div>
            <div className="text-center">
              <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Better Care</h3>
              <p className="text-gray-600">
                AI-powered matching ensures you see the right specialist for your needs.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-6 w-6 text-red-500 mr-2" />
            <span className="text-xl font-bold">CareLine</span>
          </div>
          <p className="text-gray-400">
            Intelligent Medical Referrals - Connecting patients with the right care.
          </p>
        </div>
      </footer>
    </div>
  );
}
