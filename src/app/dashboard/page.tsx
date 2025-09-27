'use client';

import Image from 'next/image';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useCareline } from '@/hooks/useCareline';
import { useGeolocation } from '@/hooks/useGeolocation';
import ReferralModal from '@/components/ReferralModal';
import CostExplainerModal from '@/components/CostExplainerModal';
import RecordsSummarizerModal from '@/components/RecordsSummarizerModal';
import ResultModal from '@/components/ResultModal';
import LoadingModal from '@/components/LoadingModal';

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
  
  // Modal states
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState<{
    title: string;
    type: 'specialists' | 'costs' | 'summary' | 'referral';
    data: unknown;
  } | null>(null);

  // AI Loading states
  const [isLoadingSpecialists, setIsLoadingSpecialists] = useState(false);
  const [isLoadingCosts, setIsLoadingCosts] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isLoadingReferral, setIsLoadingReferral] = useState(false);
  const { 
    syncUser, 
    getReferrals, 
    createReferral, 
    findSpecialists, 
    explainCosts, 
    summarizeRecords, 
    generateReferral
  } = useCareline();
  
  const { 
    location, 
    loading: locationLoading, 
    error: locationError, 
    getLocation 
  } = useGeolocation();

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

  const handleCreateReferral = () => {
    if (userData?.id === 'demo-user') {
      alert('Demo Mode: To create real referrals, please set up Supabase database using the INTEGRATION_SETUP.md guide.');
      return;
    }
    setShowReferralModal(true);
  };

  const handleReferralSubmit = async (data: { specialty: string; complaint: string; priority: 'routine' | 'urgent' | 'stat' }) => {
    setShowReferralModal(false); // Close the input modal
    const newReferral = await createReferral({
      specialty: data.specialty,
      chief_complaint: data.complaint,
      priority: data.priority
    });
    
    if (newReferral) {
      setReferrals([newReferral, ...referrals]);
    }
  };

  const handleAskGemini = async (referral: ReferralData) => {
    if (userData?.id === 'demo-user') {
      alert('Demo Mode: To use AI specialist search, please set up Gemini API using the INTEGRATION_SETUP.md guide.');
      return;
    }

    try {
      setIsLoadingSpecialists(true);
      
      // Get user's location first
      let userLocation = location;
      if (!userLocation) {
        console.log('Getting user location...');
        userLocation = await getLocation();
      }
      
      // Determine location string for search
      let locationStr = '32304'; // Fallback ZIP code
      if (userLocation) {
        if (userLocation.zipCode) {
          locationStr = userLocation.zipCode;
        } else if (userLocation.city && userLocation.state) {
          locationStr = `${userLocation.city}, ${userLocation.state}`;
        } else {
          locationStr = `${userLocation.latitude}, ${userLocation.longitude}`;
        }
        console.log('Using location:', locationStr);
      } else {
        console.warn('Unable to get user location, using default ZIP code');
      }
      
      const result = await findSpecialists(referral.specialty, locationStr, 'Blue Cross');
      if (result) {
        setResultData({
          title: `Specialists for ${referral.specialty}`,
          type: 'specialists',
          data: result
        });
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('Error finding specialists:', error);
    } finally {
      setIsLoadingSpecialists(false);
    }
  };

  const handleCostExplainer = () => {
    if (userData?.id === 'demo-user') {
      alert('Demo Mode: To use AI cost analysis, please set up Gemini API using the INTEGRATION_SETUP.md guide.');
      return;
    }
    setShowCostModal(true);
  };

  const handleCostSubmit = async (data: { procedure: string; insurance: string }) => {
    try {
      setShowCostModal(false); // Close the input modal
      setIsLoadingCosts(true);
      const result = await explainCosts(data.procedure, data.insurance);
      if (result && !result.error) {
        setResultData({
          title: `Cost Analysis: ${data.procedure}`,
          type: 'costs',
          data: result
        });
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('Error analyzing costs:', error);
    } finally {
      setIsLoadingCosts(false);
    }
  };

  const handleRecordsSummarizer = () => {
    if (userData?.id === 'demo-user') {
      alert('Demo Mode: To use AI document analysis, please set up Gemini API using the INTEGRATION_SETUP.md guide.');
      return;
    }
    setShowRecordsModal(true);
  };

  const handleRecordsSubmit = async (data: { documentText: string; forDoctor: boolean }) => {
    try {
      setShowRecordsModal(false); // Close the input modal
      setIsLoadingRecords(true);
      const result = await summarizeRecords(data.documentText, undefined, data.forDoctor);
      if (result && !result.error) {
        setResultData({
          title: data.forDoctor ? 'Clinical Summary' : 'Patient Summary',
          type: 'summary',
          data: result
        });
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('Error analyzing records:', error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleGenerateReferral = async (referral: ReferralData) => {
    if (userData?.id === 'demo-user') {
      alert('Demo Mode: To use AI referral generation, please set up Gemini API using the INTEGRATION_SETUP.md guide.');
      return;
    }

    try {
      setIsLoadingReferral(true);
      const result = await generateReferral(
        { name: user?.name || 'Patient', age: 35 }, // Demo patient info
        referral.chief_complaint,
        referral.specialty,
        referral.priority,
        referral.id
      );
      
      if (result && !result.error) {
        setResultData({
          title: `Referral Packet: ${referral.specialty}`,
          type: 'referral',
          data: result
        });
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('Error generating referral:', error);
    } finally {
      setIsLoadingReferral(false);
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Healthcare Overview</h1>
            <p className="text-slate-400 mt-1">Manage your care journey with AI-powered insights</p>
          </div>
          <button
            onClick={handleCreateReferral}
            className="enterprise-button flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Referral</span>
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="enterprise-metric">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Cases</p>
                <p className="text-3xl font-bold text-slate-100 mt-2">{activeReferrals}</p>
                <p className="text-slate-400 text-xs mt-1">Referrals in progress</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="enterprise-metric">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-slate-100 mt-2">{completedReferrals}</p>
                <p className="text-slate-400 text-xs mt-1">Successful outcomes</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="enterprise-metric">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Care Events</p>
                <p className="text-3xl font-bold text-slate-100 mt-2">{referrals.length}</p>
                <p className="text-slate-400 text-xs mt-1">Lifetime referrals</p>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Active Referrals */}
        <div className="enterprise-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-100">Active Referrals</h3>
                <p className="text-slate-400 text-sm mt-1">Manage your ongoing healthcare requests</p>
              </div>
            </div>

            <div className="space-y-4">
              {referrals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-400">No active referrals. Start your care journey with AI assistance.</p>
                </div>
              ) : (
                referrals.map((referral) => (
                  <div key={referral.id} className="enterprise-card border-slate-600 hover:border-blue-500">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-slate-100 font-medium capitalize">
                              {referral.specialty}
                            </h4>
                            <span className={`status-badge ${
                              referral.status === 'pending' ? 'pending' :
                              referral.status === 'accepted' ? 'active' :
                              referral.priority === 'urgent' ? 'urgent' : 'active'
                            }`}>
                              {referral.status === 'pending' ? 'Under Review' :
                               referral.status === 'accepted' ? 'In Progress' :
                               referral.status}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mb-3">{referral.chief_complaint}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-400">
                            <span>Provider: {referral.doctor?.name || 'Matching in progress'}</span>
                            <span>Priority: {referral.priority}</span>
                            <span>{new Date(referral.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleAskGemini(referral)}
                            className="enterprise-button secondary text-xs px-3 py-1"
                          >
                            AI Search
                          </button>
                          <button
                            onClick={() => handleGenerateReferral(referral)}
                            className="text-slate-400 hover:text-blue-400 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DoctorDashboard = () => {
    const newReferrals = referrals.filter(r => r.status === 'pending').length;
    const activePatients = referrals.filter(r => r.status === 'accepted').length;

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Provider Console</h1>
            <p className="text-slate-400 mt-1">AI-powered referral management and patient insights</p>
          </div>
                   <div className="flex space-x-3">
                     <button
                       onClick={handleRecordsSummarizer}
                       className="enterprise-button secondary flex items-center space-x-2"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                       </svg>
                       <span>Analyze Documents</span>
                     </button>
                   </div>
        </div>

        {/* Clinical Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="enterprise-metric">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold text-slate-100 mt-2">{newReferrals}</p>
                <p className="text-slate-400 text-xs mt-1">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-amber-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="enterprise-metric">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Patients</p>
                <p className="text-3xl font-bold text-slate-100 mt-2">{activePatients}</p>
                <p className="text-slate-400 text-xs mt-1">Under care</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="enterprise-metric">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Cases</p>
                <p className="text-3xl font-bold text-slate-100 mt-2">{referrals.length}</p>
                <p className="text-slate-400 text-xs mt-1">All referrals</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="enterprise-metric">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">AI Insights</p>
                <p className="text-3xl font-bold text-slate-100 mt-2">Ready</p>
                <p className="text-slate-400 text-xs mt-1">System online</p>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Queue */}
        <div className="enterprise-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-100">Patient Queue</h3>
                <p className="text-slate-400 text-sm mt-1">Review and manage incoming referrals</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {referrals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-400">No pending referrals. Your queue is clear.</p>
                </div>
              ) : (
                referrals.map((referral) => (
                  <div key={referral.id} className="enterprise-card border-slate-600 hover:border-blue-500">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-slate-100 font-medium">
                              {referral.patient?.name || 'Patient'}
                            </h4>
                            <span className={`status-badge ${
                              referral.priority === 'urgent' ? 'urgent' :
                              referral.priority === 'stat' ? 'urgent' :
                              'pending'
                            }`}>
                              {referral.priority === 'stat' ? 'STAT' : referral.priority}
                            </span>
                            <span className={`status-badge ${
                              referral.status === 'pending' ? 'pending' :
                              referral.status === 'accepted' ? 'active' :
                              'active'
                            }`}>
                              {referral.status}
                            </span>
                          </div>
                          <div className="space-y-1 mb-3">
                            <p className="text-slate-300 text-sm">
                              <span className="text-slate-400">Chief Complaint:</span> {referral.chief_complaint}
                            </p>
                            <p className="text-slate-300 text-sm">
                              <span className="text-slate-400">Specialty:</span> {referral.specialty}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-slate-400">
                            <span>Created: {new Date(referral.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button 
                            onClick={() => handleGenerateReferral(referral)}
                            className="enterprise-button text-xs px-3 py-1"
                          >
                            Review
                          </button>
                          {referral.status === 'pending' && (
                            <button className="enterprise-button secondary text-xs px-3 py-1">
                              Accept
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 sidebar-nav z-50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-8 border-b border-slate-700">
            <Image
              src="/croppedcarline.png"
              alt="Careline"
              width={256}
              height={98}
              className="h-8 w-auto mr-3 brightness-0 invert"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-100">Careline</h1>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Healthcare AI</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-6">
            <div className="space-y-2">
              <a href="#" className="nav-item active">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Overview
              </a>
                       <button onClick={handleRecordsSummarizer} className="nav-item w-full text-left">
                         <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                         Document Analysis
                       </button>
                       <button onClick={handleCostExplainer} className="nav-item w-full text-left">
                         <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                         </svg>
                         Cost Intelligence
                       </button>
              <button onClick={() => handleAskGemini({ specialty: 'General', id: '', chief_complaint: '', status: '', priority: '', created_at: '' })} className="nav-item w-full text-left">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Provider Search
              </button>
            </div>
          </nav>

          {/* User Profile */}
          <div className="px-4 py-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {userData.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{userData.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{userData.role}</p>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/api/auth/logout"
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <main className="p-8">
          {/* Database Status Notice */}
          {userData.id === 'demo-user' && (
            <div className="enterprise-card border-amber-600/30 mb-6">
              <div className="p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-300">
                      Demo Mode - Limited Functionality
                    </h3>
                    <div className="mt-2 text-sm text-slate-300">
                      <p>
                        Running in demonstration mode. Configure Supabase and Gemini API for full functionality.
                        <code className="bg-slate-800 px-1 rounded ml-1 text-amber-300">INTEGRATION_SETUP.md</code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Role-based Dashboard Content */}
          {userData.role === 'patient' ? <PatientDashboard /> : <DoctorDashboard />}
        </main>
      </div>

               {/* Modals */}
               <ReferralModal
                 isOpen={showReferralModal}
                 onClose={() => setShowReferralModal(false)}
                 onSubmit={handleReferralSubmit}
               />
               
               <CostExplainerModal
                 isOpen={showCostModal}
                 onClose={() => setShowCostModal(false)}
                 onSubmit={handleCostSubmit}
               />
               
               <RecordsSummarizerModal
                 isOpen={showRecordsModal}
                 onClose={() => setShowRecordsModal(false)}
                 onSubmit={handleRecordsSubmit}
                 userRole={userData?.role || 'patient'}
               />
               
               {resultData && (
                 <ResultModal
                   isOpen={showResultModal}
                   onClose={() => {
                     setShowResultModal(false);
                     setResultData(null);
                   }}
                   title={resultData.title}
                   type={resultData.type}
                   data={resultData.data}
                 />
               )}

               {/* AI Loading Modals */}
               <LoadingModal
                 isOpen={isLoadingSpecialists}
                 title="Finding Specialists"
                 message={locationLoading 
                   ? "Getting your location to find nearby specialists..."
                   : "Our AI is searching for qualified healthcare providers in your area. This may take a few moments..."
                 }
               />
               
               <LoadingModal
                 isOpen={isLoadingCosts}
                 title="Analyzing Costs"
                 message="AI is calculating estimated costs and insurance coverage details for your procedure..."
               />
               
               <LoadingModal
                 isOpen={isLoadingRecords}
                 title="Analyzing Documents"
                 message="Our AI is carefully reviewing your medical documents and preparing a comprehensive summary..."
               />
               
               <LoadingModal
                 isOpen={isLoadingReferral}
                 title="Generating Referral"
                 message="AI is creating a professional referral packet with all necessary documentation and instructions..."
               />
    </div>
  );
}
