'use client';

import Image from 'next/image';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useCareline } from '@/hooks/useCareline';

interface UserData {
  id: string;
  role: 'patient' | 'doctor';
  name: string;
  email: string;
}

interface ReferralData {
  id: string;
  specialty: string;
  chief_complaint: string;
  status: string;
  priority: string;
  created_at: string;
  doctor?: { name: string };
  patient?: { name: string };
}

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { 
    syncUser, 
    getReferrals, 
    createReferral, 
    findSpecialists, 
    explainCosts, 
    summarizeRecords, 
    generateReferral
  } = useCareline();

  const initializeUser = useCallback(async () => {
    try {
      setLoadingData(true);
      console.log('Initializing user...');
      
      // Try to get user from database first
      const userReferrals = await getReferrals();
      console.log('Referrals response:', userReferrals);
      
      // If we can get referrals, the user exists in database
      if (Array.isArray(userReferrals)) {
        // User exists, create real user object
        setUserData({
          id: user?.sub || 'authenticated-user',
          role: 'patient', // Can be updated from database later
          name: user?.name || 'Patient',
          email: user?.email || 'patient@example.com'
        });
        setReferrals(userReferrals);
        console.log('User initialized with real data');
      } else {
        // Try to sync user with database
        console.log('Syncing user with database...');
        const syncedUser = await syncUser('patient');
        console.log('Sync result:', syncedUser);
        
        if (syncedUser) {
          setUserData(syncedUser);
          // Try to get referrals again
          const newUserReferrals = await getReferrals();
          setReferrals(Array.isArray(newUserReferrals) ? newUserReferrals : []);
          console.log('User synced successfully');
        } else {
          throw new Error('Failed to sync user');
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      // Create a demo user if database connection fails
      setUserData({
        id: 'demo-user',
        role: 'patient',
        name: user?.name || 'Demo User',
        email: user?.email || 'demo@example.com'
      });
      setReferrals([]); // Empty referrals for demo
    } finally {
      setLoadingData(false);
    }
  }, [syncUser, getReferrals, user?.name, user?.email, user?.sub]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && !userData) {
      initializeUser();
    }
  }, [user, isLoading, router, userData, initializeUser]);

  const handleCreateReferral = async () => {
    if (userData?.id === 'demo-user') {
      alert('Demo Mode: To create real referrals, please set up Supabase database using the INTEGRATION_SETUP.md guide.');
      return;
    }

    const specialty = prompt('What specialty do you need? (e.g., Cardiology, Dermatology)');
    const complaint = prompt('Briefly describe your chief complaint:');
    
    if (specialty && complaint) {
      const newReferral = await createReferral({
        specialty,
        chief_complaint: complaint,
        priority: 'routine'
      });
      
      if (newReferral) {
        setReferrals([newReferral, ...referrals]);
      }
    }
  };

  const handleAskGemini = async (referral: ReferralData) => {
    if (userData?.id === 'demo-user') {
      alert('Demo Mode: To use AI specialist search, please set up Gemini API using the INTEGRATION_SETUP.md guide.');
      return;
    }

    const result = await findSpecialists(referral.specialty, '32304', 'Blue Cross');
    if (result?.specialists?.length > 0) {
      alert(`Found ${result.specialists.length} specialists:\n\n${result.specialists.map((s: { name: string; practice: string }) => `${s.name} - ${s.practice}`).join('\n')}`);
    }
  };

  const handleCostExplainer = async () => {
    if (userData?.id === 'demo-user') {
      alert('Demo Mode: To use AI cost analysis, please set up Gemini API using the INTEGRATION_SETUP.md guide.');
      return;
    }

    const procedure = prompt('What procedure do you need cost information for?');
    const insurance = prompt('What insurance do you have? (or press Cancel to skip)');
    
    if (procedure) {
      const result = await explainCosts(procedure, insurance || '');
      if (result && !result.error) {
        alert(`Cost Estimate: ${result.estimatedCost}\n\nExplanation: ${result.explanation}`);
      }
    }
  };

  const handleRecordsSummarizer = async () => {
    if (userData?.id === 'demo-user') {
      alert('Demo Mode: To use AI document analysis, please set up Gemini API using the INTEGRATION_SETUP.md guide.');
      return;
    }

    const documentText = prompt('Paste your medical document text or summary:');
    if (documentText) {
      const result = await summarizeRecords(documentText, undefined, userData?.role === 'doctor');
      if (result && !result.error) {
        const summary = userData?.role === 'doctor' ? result.clinicalSummary : result.patientSummary;
        alert(`AI Summary:\n\n${summary}`);
      }
    }
  };

  const handleGenerateReferral = async (referral: ReferralData) => {
    if (userData?.id === 'demo-user') {
      alert('Demo Mode: To use AI referral generation, please set up Gemini API using the INTEGRATION_SETUP.md guide.');
      return;
    }

    const result = await generateReferral(
      { name: user?.name || 'Patient', age: 35 }, // Demo patient info
      referral.chief_complaint,
      referral.specialty,
      referral.priority,
      referral.id
    );
    
    if (result && !result.error) {
      alert(`Referral Generated!\n\nInstructions: ${result.patientInstructions}\n\nTimeframe: ${result.estimatedTimeframe}`);
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return null; // Will redirect to login
  }

  // Prevent patients from accessing doctor dashboard
  if (userData.role !== 'patient' && userData.role !== 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Invalid user role. Please contact support.</p>
        </div>
      </div>
    );
  }

  const PatientDashboard = () => {
    const activeReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'accepted').length;
    const completedReferrals = referrals.filter(r => r.status === 'completed').length;

    return (
      <div className="space-y-6">
        {/* Patient Overview Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Referrals</dt>
                    <dd className="text-lg font-medium text-gray-900">{activeReferrals}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900">{completedReferrals}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Referrals</dt>
                    <dd className="text-lg font-medium text-gray-900">{referrals.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Account Status</dt>
                    <dd className="text-lg font-medium text-gray-900">Active</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Referrals */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Current Referrals</h3>
              <button 
                onClick={handleCreateReferral}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                + New Referral
              </button>
            </div>
            
            <div className="space-y-4">
              {referrals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No referrals yet. Create your first referral to get started!</p>
                </div>
              ) : (
                referrals.map((referral) => (
                  <div key={referral.id} className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 capitalize">
                          {referral.specialty} for {referral.chief_complaint}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {referral.doctor?.name || 'No doctor assigned yet'}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            referral.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                            referral.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {referral.status === 'pending' ? 'Pending Review' :
                             referral.status === 'accepted' ? 'Accepted' :
                             referral.status === 'completed' ? 'Completed' :
                             referral.status}
                          </span>
                          <span className="ml-2 text-xs text-gray-500 capitalize">
                            Priority: {referral.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleAskGemini(referral)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          ✨ Ask Gemini
                        </button>
                        <button 
                          onClick={() => handleGenerateReferral(referral)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* AI-Powered Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium">Gemini Directory Agent</h3>
                <p className="text-purple-100 text-sm mt-1">Find in-network specialists near you</p>
              </div>
            </div>
            <button 
              onClick={() => handleAskGemini({ specialty: 'General', id: '', chief_complaint: '', status: '', priority: '', created_at: '' })}
              className="mt-4 bg-white text-purple-600 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Find Specialists
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium">Cost Explainer</h3>
                <p className="text-blue-100 text-sm mt-1">Get AI cost analysis for procedures</p>
              </div>
            </div>
            <button 
              onClick={handleCostExplainer}
              className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Explain Costs
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DoctorDashboard = () => {
    const newReferrals = referrals.filter(r => r.status === 'pending').length;
    const activePatients = referrals.filter(r => r.status === 'accepted').length;

    return (
      <div className="space-y-6">
        {/* Doctor Overview Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">New Referrals</dt>
                    <dd className="text-lg font-medium text-gray-900">{newReferrals}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Patients</dt>
                    <dd className="text-lg font-medium text-gray-900">{activePatients}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Referrals</dt>
                    <dd className="text-lg font-medium text-gray-900">{referrals.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">AI Available</dt>
                    <dd className="text-lg font-medium text-gray-900">Ready</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Inbox */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Incoming Referrals</h3>
            
            <div className="space-y-4">
              {referrals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No referrals yet. Patients will appear here when they create referrals.</p>
                </div>
              ) : (
                referrals.map((referral) => (
                  <div key={referral.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {referral.patient?.name || 'Patient'}
                          </h4>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            referral.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            referral.priority === 'stat' ? 'bg-red-200 text-red-900' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {referral.priority === 'stat' ? 'STAT' : referral.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Chief Complaint:</strong> {referral.chief_complaint}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Specialty:</strong> {referral.specialty}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-xs text-gray-500">
                            Created: {new Date(referral.created_at).toLocaleDateString()}
                          </span>
                          <span className={`text-xs ${
                            referral.status === 'pending' ? 'text-yellow-600' :
                            referral.status === 'accepted' ? 'text-blue-600' :
                            'text-green-600'
                          }`}>
                            Status: {referral.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <button 
                          onClick={() => handleGenerateReferral(referral)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          View Details
                        </button>
                        {referral.status === 'pending' && (
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* AI Tools for Doctors */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium">Records Summarizer</h3>
                <p className="text-green-100 text-sm mt-1">AI-generated clinical summaries</p>
              </div>
            </div>
            <button 
              onClick={handleRecordsSummarizer}
              className="mt-4 bg-white text-green-600 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Process Records
            </button>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium">Referral Generator</h3>
                <p className="text-indigo-100 text-sm mt-1">Create standardized referral packets</p>
              </div>
            </div>
            <button 
              onClick={handleCostExplainer}
              className="mt-4 bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Generate Referral
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image
                src="/croppedcarline.png"
                alt="Careline"
                width={256}
                height={98}
                className="h-12 w-auto mr-3"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {userData.role === 'patient' ? 'Patient Dashboard' : 'Provider Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                  {userData.role === 'patient' ? 'Manage your referrals and health records' : 'Review patient referrals and records'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/api/auth/logout"
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium transition-colors"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Database Status Notice */}
          {userData.id === 'demo-user' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Demo Mode - Database Not Connected
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        You&apos;re viewing a demo version. To enable full functionality with real data and AI features, 
                        please set up Supabase and Gemini API using the <code className="bg-yellow-100 px-1 rounded">INTEGRATION_SETUP.md</code> guide.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Message */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Careline! 🎉
              </h2>
              <p className="text-gray-600">
                {userData.role === 'patient' 
                  ? 'Your AI-powered healthcare referral platform. Get specialist recommendations, upload records, and track your care journey.'
                  : 'Review patient referrals with AI-generated summaries. Access structured medical records and streamlined patient data.'
                }
              </p>
            </div>
          </div>

          {/* Role-based Dashboard Content */}
          {userData.role === 'patient' ? <PatientDashboard /> : <DoctorDashboard />}
        </div>
      </main>
    </div>
  );
}
