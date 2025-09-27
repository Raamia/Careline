import { 
  AgentTask, 
  Referral, 
  DecisionCard,
  ReferralCreatedEvent 
} from '@/types';
import { 
  serverAgentTaskService, 
  serverReferralService, 
  serverDecisionCardService 
} from '@/lib/database';
import { DirectoryAgent } from '../directory';
import { AvailabilityAgent } from '../availability';
import { CostAgent } from '../cost';
import { RecordsAgent } from '../records';
import { SummarizerAgent } from '../summarizer';

export class OrchestratorAgent {
  async processReferralCreated(event: ReferralCreatedEvent): Promise<string> {
    console.log('Orchestrator: Processing referral created event', event);
    
    const taskId = await serverAgentTaskService.createTask({
      type: 'orchestrator',
      referralId: event.referralId,
      status: 'running',
      inputs: {
        referralId: event.referralId,
        patientId: event.patientId,
        specialty: event.specialty
      }
    });

    try {
      // Get referral details
      const referral = await serverReferralService.getReferral(event.referralId);
      if (!referral) {
        throw new Error('Referral not found');
      }

      // Create parallel tasks for all agents
      const tasks = await Promise.allSettled([
        this.runDirectoryAgent(event.referralId, event.specialty, event.patientId),
        this.runRecordsAgent(event.referralId, event.patientId),
      ]);

      // Wait for directory and records to complete before running dependent agents
      const directoryResult = tasks[0];
      const recordsResult = tasks[1];

      if (directoryResult.status === 'rejected') {
        throw new Error(`Directory agent failed: ${directoryResult.reason}`);
      }

      if (recordsResult.status === 'rejected') {
        throw new Error(`Records agent failed: ${recordsResult.reason}`);
      }

      const providers = directoryResult.value.providers;

      // Run dependent agents
      const dependentTasks = await Promise.allSettled([
        this.runAvailabilityAgent(event.referralId, providers),
        this.runCostAgent(event.referralId, providers),
        this.runSummarizerAgent(event.referralId, event.patientId, referral),
      ]);

      // Collect all results
      const availabilityResult = dependentTasks[0];
      const costResult = dependentTasks[1];
      const summarizerResult = dependentTasks[2];

      if (availabilityResult.status === 'rejected') {
        throw new Error(`Availability agent failed: ${availabilityResult.reason}`);
      }

      if (costResult.status === 'rejected') {
        throw new Error(`Cost agent failed: ${costResult.reason}`);
      }

      if (summarizerResult.status === 'rejected') {
        console.warn(`Summarizer agent failed: ${summarizerResult.reason}`);
        // Don't fail the whole process if summarizer fails
      }

      // Create decision card
      const decisionCard: Omit<DecisionCard, 'id' | 'createdAt'> = {
        referralId: event.referralId,
        providers: directoryResult.value.providers,
        availability: availabilityResult.value.availability,
        costEstimates: costResult.value.estimates,
        patientExplainer: summarizerResult.status === 'fulfilled' 
          ? summarizerResult.value.patientExplainer 
          : undefined,
      };

      const decisionCardId = await serverDecisionCardService.createDecisionCard(decisionCard);

      // Update task status
      await serverAgentTaskService.updateTaskStatus(taskId, 'completed', {
        decisionCardId,
        providerCount: providers.length,
        availabilitySlots: availabilityResult.value.availability.length,
        costEstimates: costResult.value.estimates.length,
        summariesGenerated: summarizerResult.status === 'fulfilled'
      });

      console.log('Orchestrator: Successfully processed referral', event.referralId);
      return decisionCardId;

    } catch (error) {
      console.error('Orchestrator: Error processing referral', error);
      await serverAgentTaskService.updateTaskStatus(taskId, 'failed', undefined, error.message);
      throw error;
    }
  }

  private async runDirectoryAgent(referralId: string, specialty: string, patientId: string) {
    const directoryAgent = new DirectoryAgent();
    return await directoryAgent.findProviders({
      referralId,
      specialty,
      patientId
    });
  }

  private async runAvailabilityAgent(referralId: string, providers: any[]) {
    const availabilityAgent = new AvailabilityAgent();
    return await availabilityAgent.getAvailability({
      referralId,
      providerIds: providers.map(p => p.id)
    });
  }

  private async runCostAgent(referralId: string, providers: any[]) {
    const costAgent = new CostAgent();
    return await costAgent.estimateCosts({
      referralId,
      providers
    });
  }

  private async runRecordsAgent(referralId: string, patientId: string) {
    const recordsAgent = new RecordsAgent();
    return await recordsAgent.parseRecords({
      referralId,
      patientId
    });
  }

  private async runSummarizerAgent(referralId: string, patientId: string, referral: Referral) {
    const summarizerAgent = new SummarizerAgent();
    return await summarizerAgent.generateSummaries({
      referralId,
      patientId,
      referral
    });
  }
}
