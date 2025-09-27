'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ReferralCard } from '@/components/patient/referral-card';
import { DecisionCard } from '@/components/patient/decision-card';
import DoctorReferralsPage from './doctor-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Referral, DecisionCard as DecisionCardType } from '@/types';

// Mock data - this will be replaced with real API calls
const mockReferrals: Referral[] = [
  {
    id: '1',
    patientId: 'patient-1',
    fromDoctorId: 'doctor-1',
    specialty: 'Cardiology',
    reason: 'Shortness of breath and chest pain during exercise. Need cardiac evaluation.',
    urgency: 'urgent',
    status: 'pending',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    notes: 'Patient has family history of heart disease. Please evaluate for possible CAD.'
  },
  {
    id: '2',
    patientId: 'patient-1',
    fromDoctorId: 'doctor-1',
    specialty: 'Dermatology',
    reason: 'Suspicious mole on back, irregular borders and color changes.',
    urgency: 'routine',
    status: 'scheduled',
    scheduledDate: new Date('2024-02-20'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
  }
];

const mockDecisionCard: DecisionCardType = {
  id: 'decision-1',
  referralId: '1',
  providers: [
    {
      id: 'provider-1',
      name: 'Dr. Sarah Chen',
      npiNumber: '1234567890',
      specialty: 'Cardiology',
      practice: 'Heart & Vascular Institute',
      address: {
        street: '123 Medical Drive',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102'
      },
      phone: '(555) 123-4567',
      distanceKm: 2.5,
      inNetwork: true,
      rating: 4.8,
      acceptingNewPatients: true
    },
    {
      id: 'provider-2',
      name: 'Dr. Michael Rodriguez',
      npiNumber: '1234567891',
      specialty: 'Cardiology',
      practice: 'Bay Area Cardiology',
      address: {
        street: '456 Health Plaza',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105'
      },
      phone: '(555) 987-6543',
      distanceKm: 4.2,
      inNetwork: true,
      rating: 4.7,
      acceptingNewPatients: true
    }
  ],
  availability: [
    {
      providerId: 'provider-1',
      slot: '2024-01-25T14:00:00Z',
      duration: 60,
      appointmentType: 'consultation'
    },
    {
      providerId: 'provider-1',
      slot: '2024-01-26T10:30:00Z',
      duration: 60,
      appointmentType: 'consultation'
    },
    {
      providerId: 'provider-2',
      slot: '2024-01-24T16:00:00Z',
      duration: 45,
      appointmentType: 'consultation'
    }
  ],
  costEstimates: [
    {
      providerId: 'provider-1',
      estimateLow: 250,
      estimateHigh: 400,
      copay: 30,
      notes: 'In-network provider'
    },
    {
      providerId: 'provider-2',
      estimateLow: 300,
      estimateHigh: 450,
      copay: 30,
      notes: 'In-network provider'
    }
  ],
  patientExplainer: {
    id: 'explainer-1',
    referralId: '1',
    patientId: 'patient-1',
    summary: "You're being referred to a heart specialist (cardiologist) because of shortness of breath and chest pain during exercise. This helps make sure your heart is working properly.",
    whatToExpect: "The cardiologist will ask about your symptoms, listen to your heart, and may order tests like an EKG or echocardiogram to check how your heart is functioning.",
    whatToBring: [
      "List of current medications",
      "Insurance card and ID",
      "Any previous heart test results",
      "List of questions about your symptoms"
    ],
    questions: [
      "What tests will I need?",
      "How serious is my condition?",
      "What lifestyle changes should I make?",
      "When will I get my test results?"
    ],
    generatedAt: new Date('2024-01-15')
  },
  createdAt: new Date('2024-01-15')
};

export default function ReferralsPage() {
  const { user } = useUser();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);
  const [decisionCard, setDecisionCard] = useState<DecisionCardType | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null);

  useEffect(() => {
    // Mock loading referrals
    setReferrals(mockReferrals);
    
    // Determine user role - in a real app, this would come from the database
    if (user) {
      const role = user.email?.includes('doctor') ? 'doctor' : 'patient';
      setUserRole(role);
    }
  }, [user]);

  // If user is a doctor, show the doctor interface
  if (userRole === 'doctor') {
    return <DoctorReferralsPage />;
  }

  const handleViewOptions = async (referralId: string) => {
    setLoading(true);
    setSelectedReferral(referralId);
    
    try {
      // Mock API call - this would trigger the orchestrator agent
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDecisionCard(mockDecisionCard);
    } catch (error) {
      console.error('Error loading decision card:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProvider = async (providerId: string, slot: string) => {
    try {
      // Mock API call to send referral
      console.log('Sending referral to provider:', providerId, 'at slot:', slot);
      
      // Update referral status
      setReferrals(prev => prev.map(ref => 
        ref.id === selectedReferral 
          ? { ...ref, status: 'sent', toDoctorId: providerId, scheduledDate: new Date(slot) }
          : ref
      ));
      
      // Go back to referrals list
      setSelectedReferral(null);
      setDecisionCard(null);
    } catch (error) {
      console.error('Error sending referral:', error);
    }
  };

  const handleBack = () => {
    setSelectedReferral(null);
    setDecisionCard(null);
  };

  if (selectedReferral) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Referrals
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Choose Your Specialist</h1>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Finding Your Options</h3>
                  <p className="text-gray-600">
                    Our AI is searching for the best specialists, checking availability, and calculating costs...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : decisionCard ? (
          <DecisionCard
            providers={decisionCard.providers}
            availability={decisionCard.availability}
            costEstimates={decisionCard.costEstimates}
            patientExplainer={decisionCard.patientExplainer}
            onSelectProvider={handleSelectProvider}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Referrals</h1>
        <Button variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {referrals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Referrals Yet</h3>
            <p className="text-gray-600">
              When your doctor refers you to a specialist, you'll see it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {referrals.map((referral) => (
            <ReferralCard
              key={referral.id}
              referral={referral}
              onViewOptions={handleViewOptions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
