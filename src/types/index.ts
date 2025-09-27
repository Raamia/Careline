// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient extends User {
  role: 'patient';
  zipCode: string;
  insurance: {
    provider: string;
    planType: string;
    memberId: string;
  };
}

export interface Doctor extends User {
  role: 'doctor';
  npiNumber: string;
  specialty: string;
  practice: string;
  acceptingNewPatients: boolean;
}

// Referral System Types
export interface Referral {
  id: string;
  patientId: string;
  fromDoctorId: string;
  toDoctorId?: string;
  specialty: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'sent' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  scheduledDate?: Date;
  notes?: string;
}

// Provider Directory Types
export interface Provider {
  id: string;
  name: string;
  npiNumber: string;
  specialty: string;
  practice: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email?: string;
  distanceKm?: number;
  inNetwork: boolean;
  rating?: number;
  acceptingNewPatients: boolean;
}

// Availability Types
export interface AvailabilitySlot {
  providerId: string;
  slot: string; // ISO datetime string
  duration: number; // minutes
  appointmentType: string;
}

// Cost Estimation Types
export interface CostEstimate {
  providerId: string;
  estimateLow: number;
  estimateHigh: number;
  copay?: number;
  deductible?: number;
  coinsurance?: number;
  notes?: string;
}

// Medical Records Types (FHIR-lite)
export interface Condition {
  id: string;
  code: string;
  display: string;
  onsetDate?: string;
  status: 'active' | 'inactive' | 'resolved';
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  status: 'active' | 'discontinued' | 'completed';
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status: 'normal' | 'abnormal' | 'critical';
  date: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  conditions: Condition[];
  medications: Medication[];
  allergies: Allergy[];
  labResults: LabResult[];
  createdAt: Date;
  updatedAt: Date;
}

// AI Summary Types
export interface ClinicianBrief {
  id: string;
  referralId: string;
  patientId: string;
  problemList: string[];
  currentMedications: string[];
  allergies: string[];
  keyLabs: string[];
  redFlags: string[];
  clinicalSummary: string;
  recommendations?: string[];
  generatedAt: Date;
}

export interface PatientExplainer {
  id: string;
  referralId: string;
  patientId: string;
  summary: string;
  whatToExpect: string;
  whatToBring: string[];
  questions: string[];
  generatedAt: Date;
}

// Decision Card Types
export interface DecisionCard {
  id: string;
  referralId: string;
  providers: Provider[];
  availability: AvailabilitySlot[];
  costEstimates: CostEstimate[];
  patientExplainer?: PatientExplainer;
  createdAt: Date;
}

// Agent Task Types
export interface AgentTask {
  id: string;
  type: 'orchestrator' | 'directory' | 'availability' | 'cost' | 'records' | 'summarizer' | 'loop';
  referralId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pub/Sub Event Types
export interface ReferralCreatedEvent {
  type: 'referral.created';
  referralId: string;
  patientId: string;
  specialty: string;
  timestamp: Date;
}

export interface RecordsUpdatedEvent {
  type: 'records.updated';
  patientId: string;
  referralId?: string;
  timestamp: Date;
}

export interface TaskCompletedEvent {
  type: 'task.completed';
  taskId: string;
  referralId: string;
  agentType: string;
  outputs: Record<string, any>;
  timestamp: Date;
}
