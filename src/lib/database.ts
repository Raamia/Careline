import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentData,
  QueryConstraint,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { db } from './firebase';
import { adminDb } from './firebase-admin';
import { 
  User, 
  Patient, 
  Doctor, 
  Referral, 
  Provider, 
  MedicalRecord, 
  ClinicianBrief, 
  PatientExplainer, 
  DecisionCard, 
  AgentTask,
  AvailabilitySlot,
  CostEstimate
} from '../types';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PATIENTS: 'patients',
  DOCTORS: 'doctors',
  REFERRALS: 'referrals',
  PROVIDERS: 'providers',
  MEDICAL_RECORDS: 'medical_records',
  CLINICIAN_BRIEFS: 'clinician_briefs',
  PATIENT_EXPLAINERS: 'patient_explainers',
  DECISION_CARDS: 'decision_cards',
  AGENT_TASKS: 'agent_tasks',
  AVAILABILITY: 'availability',
  COST_ESTIMATES: 'cost_estimates'
} as const;

// Generic database utilities
export class DatabaseService {
  private isServer: boolean;
  
  constructor(isServer = false) {
    this.isServer = isServer;
  }
  
  private get database(): any {
    return this.isServer ? adminDb : db;
  }

  // Generic CRUD operations
  async create<T extends DocumentData>(collectionName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(this.database, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  async get<T>(collectionName: string, id: string): Promise<T | null> {
    const docRef = doc(this.database, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  async update<T extends DocumentData>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(this.database, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  }

  async delete(collectionName: string, id: string): Promise<void> {
    const docRef = doc(this.database, collectionName, id);
    await deleteDoc(docRef);
  }

  async list<T>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(collection(this.database, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  }
}

// Specialized service classes
export class UserService extends DatabaseService {
  async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<Patient>(COLLECTIONS.PATIENTS, patientData);
  }

  async createDoctor(doctorData: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<Doctor>(COLLECTIONS.DOCTORS, doctorData);
  }

  async getPatient(id: string): Promise<Patient | null> {
    return this.get<Patient>(COLLECTIONS.PATIENTS, id);
  }

  async getDoctor(id: string): Promise<Doctor | null> {
    return this.get<Doctor>(COLLECTIONS.DOCTORS, id);
  }

  async getUserByEmail(email: string): Promise<Patient | Doctor | null> {
    // Check patients first
    const patients = await this.list<Patient>(COLLECTIONS.PATIENTS, [
      where('email', '==', email)
    ]);
    
    if (patients.length > 0) {
      return patients[0];
    }

    // Check doctors
    const doctors = await this.list<Doctor>(COLLECTIONS.DOCTORS, [
      where('email', '==', email)
    ]);
    
    if (doctors.length > 0) {
      return doctors[0];
    }

    return null;
  }
}

export class ReferralService extends DatabaseService {
  async createReferral(referralData: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<Referral>(COLLECTIONS.REFERRALS, referralData);
  }

  async getReferral(id: string): Promise<Referral | null> {
    return this.get<Referral>(COLLECTIONS.REFERRALS, id);
  }

  async getPatientReferrals(patientId: string): Promise<Referral[]> {
    return this.list<Referral>(COLLECTIONS.REFERRALS, [
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    ]);
  }

  async getDoctorReferrals(doctorId: string): Promise<Referral[]> {
    return this.list<Referral>(COLLECTIONS.REFERRALS, [
      where('toDoctorId', '==', doctorId),
      orderBy('createdAt', 'desc')
    ]);
  }

  async updateReferralStatus(id: string, status: Referral['status']): Promise<void> {
    await this.update<Referral>(COLLECTIONS.REFERRALS, id, { status });
  }
}

export class ProviderService extends DatabaseService {
  async createProvider(providerData: Omit<Provider, 'id'>): Promise<string> {
    return this.create<Provider>(COLLECTIONS.PROVIDERS, providerData);
  }

  async getProvider(id: string): Promise<Provider | null> {
    return this.get<Provider>(COLLECTIONS.PROVIDERS, id);
  }

  async findProvidersBySpecialty(specialty: string, zipCode?: string): Promise<Provider[]> {
    const constraints: QueryConstraint[] = [
      where('specialty', '==', specialty),
      where('acceptingNewPatients', '==', true)
    ];

    return this.list<Provider>(COLLECTIONS.PROVIDERS, constraints);
  }
}

export class DecisionCardService extends DatabaseService {
  async createDecisionCard(cardData: Omit<DecisionCard, 'id' | 'createdAt'>): Promise<string> {
    return this.create<DecisionCard>(COLLECTIONS.DECISION_CARDS, cardData as any);
  }

  async getDecisionCard(referralId: string): Promise<DecisionCard | null> {
    const cards = await this.list<DecisionCard>(COLLECTIONS.DECISION_CARDS, [
      where('referralId', '==', referralId),
      orderBy('createdAt', 'desc'),
      limit(1)
    ]);

    return cards.length > 0 ? cards[0] : null;
  }
}

export class AgentTaskService extends DatabaseService {
  async createTask(taskData: Omit<AgentTask, 'id' | 'createdAt'>): Promise<string> {
    return this.create<AgentTask>(COLLECTIONS.AGENT_TASKS, taskData as any);
  }

  async getTask(id: string): Promise<AgentTask | null> {
    return this.get<AgentTask>(COLLECTIONS.AGENT_TASKS, id);
  }

  async updateTaskStatus(id: string, status: AgentTask['status'], outputs?: Record<string, any>, error?: string): Promise<void> {
    const updateData: Partial<AgentTask> = { status };
    
    if (outputs) {
      updateData.outputs = outputs;
    }
    
    if (error) {
      updateData.error = error;
    }
    
    if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date();
    }

    await this.update<AgentTask>(COLLECTIONS.AGENT_TASKS, id, updateData);
  }

  async getTasksForReferral(referralId: string): Promise<AgentTask[]> {
    return this.list<AgentTask>(COLLECTIONS.AGENT_TASKS, [
      where('referralId', '==', referralId),
      orderBy('createdAt', 'desc')
    ]);
  }
}

export class MedicalRecordService extends DatabaseService {
  async createRecord(recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<MedicalRecord>(COLLECTIONS.MEDICAL_RECORDS, recordData);
  }

  async getPatientRecord(patientId: string): Promise<MedicalRecord | null> {
    const records = await this.list<MedicalRecord>(COLLECTIONS.MEDICAL_RECORDS, [
      where('patientId', '==', patientId),
      orderBy('updatedAt', 'desc'),
      limit(1)
    ]);

    return records.length > 0 ? records[0] : null;
  }
}

export class SummaryService extends DatabaseService {
  async createClinicianBrief(briefData: Omit<ClinicianBrief, 'id' | 'generatedAt'>): Promise<string> {
    return this.create<ClinicianBrief>(COLLECTIONS.CLINICIAN_BRIEFS, {
      ...briefData,
      generatedAt: new Date()
    });
  }

  async createPatientExplainer(explainerData: Omit<PatientExplainer, 'id' | 'generatedAt'>): Promise<string> {
    return this.create<PatientExplainer>(COLLECTIONS.PATIENT_EXPLAINERS, {
      ...explainerData,
      generatedAt: new Date()
    });
  }

  async getClinicianBrief(referralId: string): Promise<ClinicianBrief | null> {
    const briefs = await this.list<ClinicianBrief>(COLLECTIONS.CLINICIAN_BRIEFS, [
      where('referralId', '==', referralId),
      orderBy('generatedAt', 'desc'),
      limit(1)
    ]);

    return briefs.length > 0 ? briefs[0] : null;
  }

  async getPatientExplainer(referralId: string): Promise<PatientExplainer | null> {
    const explainers = await this.list<PatientExplainer>(COLLECTIONS.PATIENT_EXPLAINERS, [
      where('referralId', '==', referralId),
      orderBy('generatedAt', 'desc'),
      limit(1)
    ]);

    return explainers.length > 0 ? explainers[0] : null;
  }
}

// Export service instances
export const userService = new UserService();
export const referralService = new ReferralService();
export const providerService = new ProviderService();
export const decisionCardService = new DecisionCardService();
export const agentTaskService = new AgentTaskService();
export const medicalRecordService = new MedicalRecordService();
export const summaryService = new SummaryService();

// Server-side instances
export const serverUserService = new UserService(true);
export const serverReferralService = new ReferralService(true);
export const serverProviderService = new ProviderService(true);
export const serverDecisionCardService = new DecisionCardService(true);
export const serverAgentTaskService = new AgentTaskService(true);
export const serverMedicalRecordService = new MedicalRecordService(true);
export const serverSummaryService = new SummaryService(true);
