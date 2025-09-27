import { GoogleGenerativeAI } from '@google/generative-ai';
import { ClinicianBrief, PatientExplainer, Referral, MedicalRecord } from '@/types';
import { 
  serverAgentTaskService, 
  serverSummaryService, 
  serverMedicalRecordService 
} from '@/lib/database';

interface SummarizerAgentInput {
  referralId: string;
  patientId: string;
  referral: Referral;
  medicalRecord?: MedicalRecord;
}

interface SummarizerAgentOutput {
  clinicianBrief: ClinicianBrief;
  patientExplainer: PatientExplainer;
}

export class SummarizerAgent {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateSummaries(input: SummarizerAgentInput): Promise<SummarizerAgentOutput> {
    console.log('Summarizer Agent: Generating AI summaries', input);
    
    const taskId = await serverAgentTaskService.createTask({
      type: 'summarizer',
      referralId: input.referralId,
      status: 'running',
      inputs: input
    });

    try {
      // Get medical record if not provided
      let medicalRecord = input.medicalRecord;
      if (!medicalRecord) {
        const fetchedRecord = await serverMedicalRecordService.getPatientRecord(input.patientId);
        if (!fetchedRecord) {
          throw new Error('No medical record found for patient');
        }
        medicalRecord = fetchedRecord;
      }

      // Generate both summaries in parallel
      const [clinicianBrief, patientExplainer] = await Promise.all([
        this.generateClinicianBrief(input.referral, medicalRecord),
        this.generatePatientExplainer(input.referral, medicalRecord)
      ]);

      // Save summaries to database
      const [briefId, explainerId] = await Promise.all([
        serverSummaryService.createClinicianBrief(clinicianBrief),
        serverSummaryService.createPatientExplainer(patientExplainer)
      ]);

      console.log('Summarizer Agent: Successfully generated summaries', { briefId, explainerId });

      const output: SummarizerAgentOutput = {
        clinicianBrief: { ...clinicianBrief, id: briefId, generatedAt: new Date() },
        patientExplainer: { ...patientExplainer, id: explainerId, generatedAt: new Date() }
      };

      await serverAgentTaskService.updateTaskStatus(taskId, 'completed', output);
      
      return output;

    } catch (error) {
      console.error('Summarizer Agent: Error generating summaries', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await serverAgentTaskService.updateTaskStatus(taskId, 'failed', undefined, errorMessage);
      throw error;
    }
  }

  private async generateClinicianBrief(
    referral: Referral, 
    medicalRecord: MedicalRecord
  ): Promise<Omit<ClinicianBrief, 'id' | 'generatedAt'>> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = this.buildClinicianPrompt(referral, medicalRecord);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the structured response
    const parsedBrief = this.parseClinicianResponse(text);

    return {
      referralId: referral.id,
      patientId: referral.patientId,
      problemList: parsedBrief.problemList,
      currentMedications: parsedBrief.currentMedications,
      allergies: parsedBrief.allergies,
      keyLabs: parsedBrief.keyLabs,
      redFlags: parsedBrief.redFlags,
      clinicalSummary: parsedBrief.clinicalSummary,
      recommendations: parsedBrief.recommendations
    };
  }

  private async generatePatientExplainer(
    referral: Referral, 
    medicalRecord: MedicalRecord
  ): Promise<Omit<PatientExplainer, 'id' | 'generatedAt'>> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = this.buildPatientPrompt(referral, medicalRecord);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the structured response
    const parsedExplainer = this.parsePatientResponse(text);

    return {
      referralId: referral.id,
      patientId: referral.patientId,
      summary: parsedExplainer.summary,
      whatToExpect: parsedExplainer.whatToExpect,
      whatToBring: parsedExplainer.whatToBring,
      questions: parsedExplainer.questions
    };
  }

  private buildClinicianPrompt(referral: Referral, medicalRecord: MedicalRecord): string {
    return `
You are a medical AI assistant creating a structured clinical brief for a ${referral.specialty} specialist. 

REFERRAL INFORMATION:
- Specialty: ${referral.specialty}
- Reason: ${referral.reason}
- Urgency: ${referral.urgency}
- Additional Notes: ${referral.notes || 'None'}

PATIENT MEDICAL RECORD:
Active Conditions:
${medicalRecord.conditions.filter(c => c.status === 'active').map(c => `- ${c.display} (${c.code})`).join('\n')}

Current Medications:
${medicalRecord.medications.filter(m => m.status === 'active').map(m => `- ${m.name} ${m.dosage} ${m.frequency}`).join('\n')}

Allergies:
${medicalRecord.allergies.map(a => `- ${a.allergen}: ${a.reaction} (${a.severity})`).join('\n')}

Recent Lab Results:
${medicalRecord.labResults.map(l => `- ${l.testName}: ${l.value} ${l.unit || ''} (${l.status}) [${l.date}]`).join('\n')}

Please provide a structured clinical brief in the following format:

PROBLEM_LIST:
[List 3-5 key active problems relevant to this referral]

CURRENT_MEDICATIONS:
[List all active medications with dosing]

ALLERGIES:
[List all allergies with severity]

KEY_LABS:
[List relevant recent lab results with values and status]

RED_FLAGS:
[Identify any urgent concerns or safety issues]

CLINICAL_SUMMARY:
[Provide a 2-3 sentence summary of the patient's current clinical status and reason for referral]

RECOMMENDATIONS:
[Suggest 2-3 clinical actions or considerations for the specialist]

Format your response exactly as shown above with clear section headers.
`;
  }

  private buildPatientPrompt(referral: Referral, medicalRecord: MedicalRecord): string {
    return `
You are a medical AI assistant creating a patient-friendly explanation for a ${referral.specialty} referral.

REFERRAL INFORMATION:
- You're being referred to: ${referral.specialty}
- Reason: ${referral.reason}
- Urgency: ${referral.urgency}

Write at a 6th-grade reading level. Be reassuring but honest. Avoid medical jargon.

Please provide a patient explanation in the following format:

SUMMARY:
[2-3 sentences explaining why they're being referred in simple terms]

WHAT_TO_EXPECT:
[Describe what typically happens during this type of specialist visit]

WHAT_TO_BRING:
[List 4-5 items they should bring to the appointment]

QUESTIONS:
[Suggest 3-4 good questions they can ask the specialist]

Format your response exactly as shown above with clear section headers.
`;
  }

  private parseClinicianResponse(response: string): {
    problemList: string[];
    currentMedications: string[];
    allergies: string[];
    keyLabs: string[];
    redFlags: string[];
    clinicalSummary: string;
    recommendations: string[];
  } {
    // Parse the structured response from Gemini
    const sections = this.parseSections(response);

    return {
      problemList: this.parseListSection(sections['PROBLEM_LIST'] || ''),
      currentMedications: this.parseListSection(sections['CURRENT_MEDICATIONS'] || ''),
      allergies: this.parseListSection(sections['ALLERGIES'] || ''),
      keyLabs: this.parseListSection(sections['KEY_LABS'] || ''),
      redFlags: this.parseListSection(sections['RED_FLAGS'] || ''),
      clinicalSummary: sections['CLINICAL_SUMMARY'] || 'Clinical summary not generated.',
      recommendations: this.parseListSection(sections['RECOMMENDATIONS'] || '')
    };
  }

  private parsePatientResponse(response: string): {
    summary: string;
    whatToExpect: string;
    whatToBring: string[];
    questions: string[];
  } {
    const sections = this.parseSections(response);

    return {
      summary: sections['SUMMARY'] || 'Summary not generated.',
      whatToExpect: sections['WHAT_TO_EXPECT'] || 'Information not available.',
      whatToBring: this.parseListSection(sections['WHAT_TO_BRING'] || ''),
      questions: this.parseListSection(sections['QUESTIONS'] || '')
    };
  }

  private parseSections(response: string): { [key: string]: string } {
    const sections: { [key: string]: string } = {};
    const lines = response.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this is a section header
      if (trimmedLine.endsWith(':') && trimmedLine.toUpperCase() === trimmedLine) {
        // Save previous section
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        
        // Start new section
        currentSection = trimmedLine.slice(0, -1);
        currentContent = [];
      } else if (currentSection && trimmedLine) {
        currentContent.push(trimmedLine);
      }
    }

    // Save last section
    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }

  private parseListSection(content: string): string[] {
    if (!content) return [];
    
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[-•*]\s*/, '')) // Remove bullet points
      .filter(line => line.length > 0);
  }

  async regenerateSummaries(referralId: string): Promise<SummarizerAgentOutput> {
    console.log('Summarizer Agent: Regenerating summaries for referral', referralId);
    
    // This would be called by the Loop Agent when records are updated
    // Implementation would fetch the referral and regenerate summaries
    
    throw new Error('Regeneration not implemented yet');
  }

  async updateSummaryWithNewData(
    referralId: string, 
    newData: Partial<MedicalRecord>
  ): Promise<void> {
    console.log('Summarizer Agent: Updating summary with new data', { referralId, newData });
    
    // This would be called when new lab results or medications are added
    // Implementation would update existing summaries with new information
    
    throw new Error('Update not implemented yet');
  }
}
