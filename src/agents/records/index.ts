import { MedicalRecord, Condition, Medication, LabResult, Allergy } from '@/types';
import { serverAgentTaskService, serverMedicalRecordService } from '@/lib/database';

interface RecordsAgentInput {
  referralId: string;
  patientId: string;
  recordSources?: string[]; // URLs or paths to records
}

interface RecordsAgentOutput {
  medicalRecord: MedicalRecord;
  recordsProcessed: number;
}

// Mock medical records data - in production, this would parse real PDFs/HL7/FHIR
const mockMedicalRecords = {
  'patient-001': {
    conditions: [
      {
        id: 'cond-001',
        code: 'I25.9',
        display: 'Chronic ischemic heart disease, unspecified',
        onsetDate: '2023-06-15',
        status: 'active' as const,
        severity: 'moderate' as const
      },
      {
        id: 'cond-002',
        code: 'I10',
        display: 'Essential hypertension',
        onsetDate: '2022-03-10',
        status: 'active' as const,
        severity: 'mild' as const
      },
      {
        id: 'cond-003',
        code: 'E78.5',
        display: 'Hyperlipidemia, unspecified',
        onsetDate: '2022-03-10',
        status: 'active' as const,
        severity: 'mild' as const
      }
    ],
    medications: [
      {
        id: 'med-001',
        name: 'Metoprolol',
        dosage: '50mg',
        frequency: 'twice daily',
        prescribedDate: '2023-06-15',
        status: 'active' as const
      },
      {
        id: 'med-002',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'once daily',
        prescribedDate: '2022-03-10',
        status: 'active' as const
      },
      {
        id: 'med-003',
        name: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'once daily at bedtime',
        prescribedDate: '2022-03-10',
        status: 'active' as const
      },
      {
        id: 'med-004',
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'once daily',
        prescribedDate: '2023-06-15',
        status: 'active' as const
      }
    ],
    allergies: [
      {
        id: 'allergy-001',
        allergen: 'Penicillin',
        reaction: 'Skin rash, hives',
        severity: 'moderate' as const
      },
      {
        id: 'allergy-002',
        allergen: 'Shellfish',
        reaction: 'Anaphylaxis',
        severity: 'severe' as const
      }
    ],
    labResults: [
      {
        id: 'lab-001',
        testName: 'BNP',
        value: '450',
        unit: 'pg/mL',
        referenceRange: '<100',
        status: 'abnormal' as const,
        date: '2024-01-10'
      },
      {
        id: 'lab-002',
        testName: 'Troponin I',
        value: '<0.01',
        unit: 'ng/mL',
        referenceRange: '<0.04',
        status: 'normal' as const,
        date: '2024-01-10'
      },
      {
        id: 'lab-003',
        testName: 'Creatinine',
        value: '1.2',
        unit: 'mg/dL',
        referenceRange: '0.7-1.3',
        status: 'normal' as const,
        date: '2024-01-10'
      },
      {
        id: 'lab-004',
        testName: 'LDL Cholesterol',
        value: '95',
        unit: 'mg/dL',
        referenceRange: '<100',
        status: 'normal' as const,
        date: '2024-01-05'
      }
    ]
  },
  'patient-002': {
    conditions: [
      {
        id: 'cond-004',
        code: 'I48.91',
        display: 'Atrial fibrillation, unspecified',
        onsetDate: '2024-01-20',
        status: 'active' as const,
        severity: 'moderate' as const
      },
      {
        id: 'cond-005',
        code: 'I10',
        display: 'Essential hypertension',
        onsetDate: '2020-05-15',
        status: 'active' as const,
        severity: 'moderate' as const
      }
    ],
    medications: [
      {
        id: 'med-005',
        name: 'Amlodipine',
        dosage: '5mg',
        frequency: 'once daily',
        prescribedDate: '2020-05-15',
        status: 'active' as const
      },
      {
        id: 'med-006',
        name: 'Hydrochlorothiazide',
        dosage: '25mg',
        frequency: 'once daily',
        prescribedDate: '2020-05-15',
        status: 'active' as const
      }
    ],
    allergies: [
      {
        id: 'allergy-003',
        allergen: 'No known drug allergies',
        reaction: 'None',
        severity: 'mild' as const
      }
    ],
    labResults: [
      {
        id: 'lab-005',
        testName: 'TSH',
        value: '2.1',
        unit: 'mIU/L',
        referenceRange: '0.5-4.5',
        status: 'normal' as const,
        date: '2024-01-18'
      },
      {
        id: 'lab-006',
        testName: 'Sodium',
        value: '140',
        unit: 'mmol/L',
        referenceRange: '136-145',
        status: 'normal' as const,
        date: '2024-01-18'
      }
    ]
  }
};

export class RecordsAgent {
  async parseRecords(input: RecordsAgentInput): Promise<RecordsAgentOutput> {
    console.log('Records Agent: Parsing medical records', input);
    
    const taskId = await serverAgentTaskService.createTask({
      type: 'records',
      referralId: input.referralId,
      status: 'running',
      inputs: input
    });

    try {
      // Simulate record processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get mock data for this patient
      const mockData = (mockMedicalRecords as any)[input.patientId];
      
      if (!mockData) {
        throw new Error(`No medical records found for patient ${input.patientId}`);
      }

      // Create medical record object
      const medicalRecord: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        patientId: input.patientId,
        conditions: mockData.conditions,
        medications: mockData.medications,
        allergies: mockData.allergies,
        labResults: mockData.labResults
      };

      // Save to database
      const recordId = await serverMedicalRecordService.createRecord(medicalRecord);

      const savedRecord = await serverMedicalRecordService.get('medical_records', recordId);
      if (!savedRecord) {
        throw new Error('Failed to save medical record');
      }

      console.log(`Records Agent: Processed ${mockData.conditions.length + mockData.medications.length + mockData.labResults.length} records for patient ${input.patientId}`);

      const output: RecordsAgentOutput = {
        medicalRecord: savedRecord as MedicalRecord,
        recordsProcessed: mockData.conditions.length + mockData.medications.length + mockData.labResults.length
      };

      await serverAgentTaskService.updateTaskStatus(taskId, 'completed', output);
      
      return output;

    } catch (error) {
      console.error('Records Agent: Error parsing records', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await serverAgentTaskService.updateTaskStatus(taskId, 'failed', undefined, errorMessage);
      throw error;
    }
  }

  async parsePdfRecord(pdfUrl: string): Promise<{
    conditions: Condition[];
    medications: Medication[];
    labResults: LabResult[];
    allergies: Allergy[];
  }> {
    console.log('Records Agent: Parsing PDF record', pdfUrl);
    
    // Simulate PDF processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // In a real implementation, this would:
    // 1. Download the PDF
    // 2. Extract text using OCR or PDF parsing
    // 3. Use NLP to identify medical entities
    // 4. Map to FHIR-like structure
    
    // For now, return mock data
    return {
      conditions: [],
      medications: [],
      labResults: [],
      allergies: []
    };
  }

  async parseHL7Message(hl7Message: string): Promise<{
    conditions: Condition[];
    medications: Medication[];
    labResults: LabResult[];
    allergies: Allergy[];
  }> {
    console.log('Records Agent: Parsing HL7 message');
    
    // Simulate HL7 processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real implementation, this would:
    // 1. Parse HL7 segments
    // 2. Extract relevant medical data
    // 3. Map to our internal structure
    
    return {
      conditions: [],
      medications: [],
      labResults: [],
      allergies: []
    };
  }

  async extractMedicalEntities(text: string): Promise<{
    medications: string[];
    conditions: string[];
    allergies: string[];
    procedures: string[];
  }> {
    console.log('Records Agent: Extracting medical entities from text');
    
    // Simulate NLP processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real implementation, this would use medical NLP models like:
    // - spaCy with medical models
    // - AWS Comprehend Medical
    // - Azure Text Analytics for Health
    // - Custom trained models
    
    const medications = this.extractMedicationsFromText(text);
    const conditions = this.extractConditionsFromText(text);
    const allergies = this.extractAllergiesFromText(text);
    const procedures = this.extractProceduresFromText(text);

    return {
      medications,
      conditions,
      allergies,
      procedures
    };
  }

  private extractMedicationsFromText(text: string): string[] {
    // Simple regex-based extraction for demo
    const medicationPatterns = [
      /\b(metoprolol|lisinopril|atorvastatin|aspirin|amlodipine|hydrochlorothiazide)\b/gi,
      /\b\w+\s*\d+\s*mg\b/gi
    ];

    const medications: string[] = [];
    for (const pattern of medicationPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        medications.push(...matches);
      }
    }

    return Array.from(new Set(medications)); // Remove duplicates
  }

  private extractConditionsFromText(text: string): string[] {
    // Simple keyword extraction for demo
    const conditionKeywords = [
      'hypertension', 'diabetes', 'heart disease', 'atrial fibrillation',
      'hyperlipidemia', 'coronary artery disease', 'heart failure'
    ];

    const conditions: string[] = [];
    for (const keyword of conditionKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        conditions.push(keyword);
      }
    }

    return conditions;
  }

  private extractAllergiesFromText(text: string): string[] {
    // Simple allergy extraction for demo
    const allergyPatterns = [
      /allergic to\s+(\w+)/gi,
      /allergy:\s*(\w+)/gi,
      /\ballergies?\s*:\s*([^.]+)/gi
    ];

    const allergies: string[] = [];
    for (const pattern of allergyPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        allergies.push(...matches.map(match => match.split(':').pop()?.trim() || ''));
      }
    }

    return Array.from(new Set(allergies));
  }

  private extractProceduresFromText(text: string): string[] {
    // Simple procedure extraction for demo
    const procedureKeywords = [
      'echocardiogram', 'ekg', 'stress test', 'catheterization',
      'biopsy', 'x-ray', 'mri', 'ct scan'
    ];

    const procedures: string[] = [];
    for (const keyword of procedureKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        procedures.push(keyword);
      }
    }

    return procedures;
  }

  async validateRecordIntegrity(record: MedicalRecord): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    console.log('Records Agent: Validating record integrity');
    
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required fields
    if (!record.patientId) {
      errors.push('Patient ID is required');
    }

    // Check for medication interactions
    const activemedications = record.medications.filter(med => med.status === 'active');
    if (activemedications.length > 10) {
      warnings.push('Patient is on a high number of medications - check for polypharmacy');
    }

    // Check for critical allergies
    const severeAllergies = record.allergies.filter(allergy => allergy.severity === 'severe');
    if (severeAllergies.length > 0) {
      warnings.push(`Patient has severe allergies: ${severeAllergies.map(a => a.allergen).join(', ')}`);
    }

    // Check for abnormal lab values
    const abnormalLabs = record.labResults.filter(lab => lab.status === 'abnormal' || lab.status === 'critical');
    if (abnormalLabs.length > 0) {
      warnings.push(`Abnormal lab values found: ${abnormalLabs.map(lab => lab.testName).join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}
