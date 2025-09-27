'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { IncomingReferralCard } from '@/components/doctor/incoming-referral-card';
import { ClinicalBrief } from '@/components/doctor/clinical-brief';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Filter, Bell } from 'lucide-react';
import { Referral, ClinicianBrief as ClinicianBriefType, Patient } from '@/types';

// Mock data for doctor portal
const mockIncomingReferrals: Referral[] = [
  {
    id: 'ref-001',
    patientId: 'patient-001',
    fromDoctorId: 'doctor-primary-001',
    specialty: 'Cardiology',
    reason: 'Patient presents with exertional dyspnea and chest pain. Exercise tolerance decreased over 3 months. Family history of CAD.',
    urgency: 'urgent',
    status: 'pending',
    createdAt: new Date('2024-01-20T10:30:00Z'),
    updatedAt: new Date('2024-01-20T10:30:00Z'),
    notes: 'Patient has been on metoprolol 50mg BID. Recent echo shows mild LV dysfunction. Please evaluate for ischemic workup.'
  },
  {
    id: 'ref-002',
    patientId: 'patient-002',
    fromDoctorId: 'doctor-primary-002',
    specialty: 'Cardiology',
    reason: 'Palpitations and syncope episode. Patient reports irregular heartbeat sensations.',
    urgency: 'stat',
    status: 'pending',
    createdAt: new Date('2024-01-20T14:15:00Z'),
    updatedAt: new Date('2024-01-20T14:15:00Z'),
    notes: 'Patient had syncope while driving. EKG shows possible atrial fibrillation. Urgent evaluation needed.'
  },
  {
    id: 'ref-003',
    patientId: 'patient-003',
    fromDoctorId: 'doctor-primary-003',
    specialty: 'Cardiology',
    reason: 'Hypertension management and cardiac risk assessment for upcoming surgery.',
    urgency: 'routine',
    status: 'pending',
    createdAt: new Date('2024-01-19T09:00:00Z'),
    updatedAt: new Date('2024-01-19T09:00:00Z'),
    notes: 'Pre-operative cardiac clearance needed for elective knee replacement surgery.'
  }
];

const mockClinicalBriefs: { [key: string]: ClinicianBriefType } = {
  'ref-001': {
    id: 'brief-001',
    referralId: 'ref-001',
    patientId: 'patient-001',
    problemList: [
      'Exertional dyspnea',
      'Chest pain on exertion',
      'Mild left ventricular dysfunction',
      'Hypertension',
      'Hyperlipidemia'
    ],
    currentMedications: [
      'Metoprolol 50mg BID',
      'Lisinopril 10mg daily',
      'Atorvastatin 20mg daily',
      'Aspirin 81mg daily'
    ],
    allergies: ['Penicillin (rash)', 'Shellfish (anaphylaxis)'],
    keyLabs: [
      'BNP: 450 pg/mL (elevated)',
      'Troponin: <0.01 ng/mL (normal)',
      'Creatinine: 1.2 mg/dL',
      'LDL: 95 mg/dL'
    ],
    redFlags: [
      'Progressive exercise intolerance over 3 months',
      'Family history of premature CAD (father MI at age 45)'
    ],
    clinicalSummary: 'A 58-year-old patient with progressive exertional dyspnea and chest pain over 3 months. Recent echocardiogram shows mild LV dysfunction (EF 45%). Strong family history of coronary artery disease. Currently on appropriate heart failure medications but symptoms are worsening despite therapy.',
    recommendations: [
      'Consider stress testing or coronary angiography given worsening symptoms',
      'Optimize heart failure medications if ischemia is ruled out',
      'Monitor closely for signs of heart failure progression'
    ],
    generatedAt: new Date('2024-01-20T10:35:00Z')
  },
  'ref-002': {
    id: 'brief-002',
    referralId: 'ref-002',
    patientId: 'patient-002',
    problemList: [
      'Atrial fibrillation (new onset)',
      'Syncope while driving',
      'Palpitations',
      'Hypertension'
    ],
    currentMedications: [
      'Amlodipine 5mg daily',
      'Hydrochlorothiazide 25mg daily'
    ],
    allergies: ['NKDA'],
    keyLabs: [
      'TSH: 2.1 mIU/L (normal)',
      'Electrolytes: within normal limits',
      'CBC: normal'
    ],
    redFlags: [
      'Syncope episode while driving - safety concern',
      'New onset atrial fibrillation',
      'Rapid ventricular response on EKG (HR 140-160)'
    ],
    clinicalSummary: 'A 72-year-old patient presenting with new onset atrial fibrillation and syncope. EKG shows atrial fibrillation with rapid ventricular response. This is a high-risk presentation requiring urgent evaluation for rate control, rhythm management, and stroke prevention.',
    recommendations: [
      'Urgent rate control with beta-blocker or calcium channel blocker',
      'Initiate anticoagulation based on CHA2DS2-VASc score',
      'Consider cardioversion if recent onset',
      'Echocardiogram to assess cardiac structure and function'
    ],
    generatedAt: new Date('2024-01-20T14:20:00Z')
  }
};

const mockPatients: { [key: string]: Patient } = {
  'patient-001': {
    id: 'patient-001',
    email: 'john.smith@email.com',
    name: 'John Smith',
    role: 'patient',
    zipCode: '94102',
    insurance: {
      provider: 'Blue Cross Blue Shield',
      planType: 'PPO',
      memberId: 'BC123456789'
    },
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  'patient-002': {
    id: 'patient-002',
    email: 'mary.johnson@email.com',
    name: 'Mary Johnson',
    role: 'patient',
    zipCode: '94105',
    insurance: {
      provider: 'Kaiser Permanente',
      planType: 'HMO',
      memberId: 'KP987654321'
    },
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-01-20')
  },
  'patient-003': {
    id: 'patient-003',
    email: 'robert.davis@email.com',
    name: 'Robert Davis',
    role: 'patient',
    zipCode: '94107',
    insurance: {
      provider: 'Aetna',
      planType: 'PPO',
      memberId: 'AE456789123'
    },
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2024-01-19')
  }
};

export default function DoctorReferralsPage() {
  const { user } = useUser();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);
  const [clinicalBriefs, setClinicalBriefs] = useState<{ [key: string]: ClinicianBriefType }>({});
  const [filter, setFilter] = useState<'all' | 'urgent' | 'routine'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock loading referrals and briefs
    setReferrals(mockIncomingReferrals);
    setClinicalBriefs(mockClinicalBriefs);
  }, []);

  const handleViewDetails = (referralId: string) => {
    setSelectedReferral(referralId);
  };

  const handleQuickAccept = async (referralId: string) => {
    try {
      console.log('Quick accepting referral:', referralId);
      // Mock API call
      setReferrals(prev => prev.map(ref => 
        ref.id === referralId 
          ? { ...ref, status: 'scheduled' }
          : ref
      ));
    } catch (error) {
      console.error('Error accepting referral:', error);
    }
  };

  const handleAcceptReferral = async (referralId: string) => {
    try {
      console.log('Accepting referral:', referralId);
      // Mock API call
      setReferrals(prev => prev.map(ref => 
        ref.id === referralId 
          ? { ...ref, status: 'scheduled' }
          : ref
      ));
      setSelectedReferral(null);
    } catch (error) {
      console.error('Error accepting referral:', error);
    }
  };

  const handleRequestMoreInfo = async (referralId: string) => {
    try {
      console.log('Requesting more info for referral:', referralId);
      // Mock API call - would send request back to referring physician
    } catch (error) {
      console.error('Error requesting more info:', error);
    }
  };

  const handleBack = () => {
    setSelectedReferral(null);
  };

  const filteredReferrals = referrals.filter(referral => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return referral.urgency === 'urgent' || referral.urgency === 'stat';
    if (filter === 'routine') return referral.urgency === 'routine';
    return true;
  });

  const urgentCount = referrals.filter(r => r.urgency === 'urgent' || r.urgency === 'stat').length;

  if (selectedReferral) {
    const referral = referrals.find(r => r.id === selectedReferral);
    const brief = clinicalBriefs[selectedReferral];
    const patient = referral ? mockPatients[referral.patientId] : undefined;

    if (!referral) {
      return <div>Referral not found</div>;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Referrals
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Clinical Brief</h1>
        </div>

        {brief ? (
          <ClinicalBrief
            brief={brief}
            referral={referral}
            patient={patient}
            onAcceptReferral={handleAcceptReferral}
            onRequestMoreInfo={handleRequestMoreInfo}
          />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Generating Clinical Brief</h3>
                  <p className="text-gray-600">
                    Our AI is analyzing patient records and generating a comprehensive summary...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incoming Referrals</h1>
          <p className="text-gray-600 mt-1">
            {referrals.length} total referrals
            {urgentCount > 0 && (
              <span className="ml-2 text-red-600 font-medium">
                • {urgentCount} urgent
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {urgentCount > 0 && (
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2 text-red-500" />
              {urgentCount} Urgent
            </Button>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({referrals.length})
        </Button>
        <Button
          variant={filter === 'urgent' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('urgent')}
        >
          Urgent ({urgentCount})
        </Button>
        <Button
          variant={filter === 'routine' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('routine')}
        >
          Routine ({referrals.filter(r => r.urgency === 'routine').length})
        </Button>
      </div>

      {filteredReferrals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Referrals</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any incoming referrals at the moment."
                : `No ${filter} referrals found.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReferrals.map((referral) => (
            <IncomingReferralCard
              key={referral.id}
              referral={referral}
              brief={clinicalBriefs[referral.id]}
              patientName={mockPatients[referral.patientId]?.name}
              onViewDetails={handleViewDetails}
              onQuickAccept={handleQuickAccept}
            />
          ))}
        </div>
      )}
    </div>
  );
}
