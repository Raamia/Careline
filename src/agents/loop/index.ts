import { RecordsUpdatedEvent, Referral } from '@/types';
import { 
  serverAgentTaskService, 
  serverReferralService,
  serverSummaryService 
} from '@/lib/database';
import { SummarizerAgent } from '../summarizer';

export class LoopAgent {
  async processRecordsUpdated(event: RecordsUpdatedEvent): Promise<void> {
    console.log('Loop Agent: Processing records updated event', event);
    
    const taskId = await serverAgentTaskService.createTask({
      type: 'loop',
      referralId: event.referralId || 'unknown',
      status: 'running',
      inputs: {
        patientId: event.patientId,
        referralId: event.referralId,
        timestamp: event.timestamp
      }
    });

    try {
      // Find all active referrals for this patient
      const referrals = await this.getActiveReferralsForPatient(event.patientId);
      
      if (referrals.length === 0) {
        console.log('Loop Agent: No active referrals found for patient', event.patientId);
        await serverAgentTaskService.updateTaskStatus(taskId, 'completed', {
          message: 'No active referrals to update'
        });
        return;
      }

      // Regenerate summaries for each active referral
      const summarizerAgent = new SummarizerAgent();
      const updateTasks = referrals.map(async (referral: any) => {
        try {
          console.log('Loop Agent: Regenerating summaries for referral', referral.id);
          
          // Get existing summaries to compare
          const existingBrief = await serverSummaryService.getClinicianBrief(referral.id);
          const existingExplainer = await serverSummaryService.getPatientExplainer(referral.id);
          
          // Generate new summaries
          const newSummaries = await summarizerAgent.generateSummaries({
            referralId: referral.id,
            patientId: event.patientId,
            referral: referral as Referral
          });

          // In a real system, we would:
          // 1. Compare new vs old summaries
          // 2. Send notifications if significant changes
          // 3. Update the UI in real-time
          // 4. Notify the receiving physician
          
          return {
            referralId: referral.id,
            updated: true,
            hasSignificantChanges: this.detectSignificantChanges(
              existingBrief, 
              newSummaries.clinicianBrief
            )
          };
          
        } catch (error) {
          console.error('Loop Agent: Error updating referral', referral.id, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          return {
            referralId: referral.id,
            updated: false,
            error: errorMessage
          };
        }
      });

      const results = await Promise.allSettled(updateTasks);
      
      const successfulUpdates = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)
        .filter(value => value.updated);

      const significantChanges = successfulUpdates.filter(update => update.hasSignificantChanges);

      console.log(`Loop Agent: Updated ${successfulUpdates.length} referrals, ${significantChanges.length} with significant changes`);

      // Send notifications for significant changes
      for (const change of significantChanges) {
        await this.sendUpdateNotification(change.referralId, event.patientId);
      }

      await serverAgentTaskService.updateTaskStatus(taskId, 'completed', {
        referralsProcessed: referrals.length,
        successfulUpdates: successfulUpdates.length,
        significantChanges: significantChanges.length,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason })
      });

    } catch (error) {
      console.error('Loop Agent: Error processing records updated event', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await serverAgentTaskService.updateTaskStatus(taskId, 'failed', undefined, errorMessage);
      throw error;
    }
  }

  async processLabResultsAdded(patientId: string, labResults: any[]): Promise<void> {
    console.log('Loop Agent: Processing new lab results', { patientId, labCount: labResults.length });
    
    // Check for critical values that need immediate attention
    const criticalResults = labResults.filter(lab => lab.status === 'critical');
    
    if (criticalResults.length > 0) {
      await this.handleCriticalLabResults(patientId, criticalResults);
    }

    // Trigger records updated event
    await this.processRecordsUpdated({
      type: 'records.updated',
      patientId,
      timestamp: new Date()
    });
  }

  async processMedicationChanges(patientId: string, medicationChanges: any[]): Promise<void> {
    console.log('Loop Agent: Processing medication changes', { patientId, changes: medicationChanges.length });
    
    // Check for drug interactions or contraindications
    await this.checkMedicationInteractions(patientId, medicationChanges);

    // Trigger records updated event
    await this.processRecordsUpdated({
      type: 'records.updated',
      patientId,
      timestamp: new Date()
    });
  }

  private async getActiveReferralsForPatient(patientId: string) {
    // Get all referrals for this patient that are pending or sent
    return await serverReferralService.list('referrals', [
      // where('patientId', '==', patientId),
      // where('status', 'in', ['pending', 'sent']),
      // orderBy('createdAt', 'desc')
    ]);
  }

  private detectSignificantChanges(
    oldBrief: any, 
    newBrief: any
  ): boolean {
    if (!oldBrief) return true; // First time generating

    // Check for new red flags
    const oldRedFlags = oldBrief.redFlags || [];
    const newRedFlags = newBrief.redFlags || [];
    const hasNewRedFlags = newRedFlags.some((flag: string) => !oldRedFlags.includes(flag));

    // Check for new problems
    const oldProblems = oldBrief.problemList || [];
    const newProblems = newBrief.problemList || [];
    const hasNewProblems = newProblems.some((problem: string) => !oldProblems.includes(problem));

    // Check for new abnormal labs
    const oldLabs = oldBrief.keyLabs || [];
    const newLabs = newBrief.keyLabs || [];
    const hasNewAbnormalLabs = newLabs.some((lab: string) => 
      !oldLabs.includes(lab) && (lab.includes('abnormal') || lab.includes('elevated'))
    );

    return hasNewRedFlags || hasNewProblems || hasNewAbnormalLabs;
  }

  private async sendUpdateNotification(referralId: string, patientId: string): Promise<void> {
    console.log('Loop Agent: Sending update notification', { referralId, patientId });
    
    // In a real system, this would:
    // 1. Find the receiving physician for this referral
    // 2. Send them an email/SMS/push notification
    // 3. Update the UI with a notification badge
    // 4. Log the notification for tracking
    
    // For now, just log it
    console.log(`Notification sent: Updated medical summary available for referral ${referralId}`);
  }

  private async handleCriticalLabResults(patientId: string, criticalResults: any[]): Promise<void> {
    console.log('Loop Agent: Handling critical lab results', { patientId, criticalResults });
    
    // In a real system, this would:
    // 1. Immediately notify all physicians caring for this patient
    // 2. Create urgent alerts in the UI
    // 3. Potentially auto-escalate based on protocols
    // 4. Log for quality assurance

    for (const result of criticalResults) {
      console.log(`CRITICAL LAB ALERT: ${result.testName} = ${result.value} for patient ${patientId}`);
    }
  }

  private async checkMedicationInteractions(patientId: string, medicationChanges: any[]): Promise<void> {
    console.log('Loop Agent: Checking medication interactions', { patientId, medicationChanges });
    
    // In a real system, this would:
    // 1. Check against drug interaction databases
    // 2. Verify against patient allergies
    // 3. Check for duplicate therapies
    // 4. Alert physicians to potential issues
    
    // Mock implementation
    const interactions = medicationChanges.filter(med => 
      med.name.toLowerCase().includes('warfarin') || 
      med.name.toLowerCase().includes('digoxin')
    );

    if (interactions.length > 0) {
      console.log(`MEDICATION INTERACTION ALERT: High-risk medications detected for patient ${patientId}`);
    }
  }

  async schedulePeriodicUpdates(): Promise<void> {
    console.log('Loop Agent: Scheduling periodic updates');
    
    // In a real system, this would:
    // 1. Set up cron jobs or scheduled functions
    // 2. Periodically check for stale summaries
    // 3. Refresh summaries for active referrals
    // 4. Clean up completed or cancelled referrals
    
    // This could be implemented with:
    // - Vercel Cron Jobs
    // - AWS EventBridge
    // - Google Cloud Scheduler
    // - Azure Functions Timer Triggers
  }

  async processManualRefresh(referralId: string): Promise<void> {
    console.log('Loop Agent: Processing manual refresh request', { referralId });
    
    // This would be called when a physician clicks "refresh" on a summary
    const referral = await serverReferralService.getReferral(referralId);
    
    if (!referral) {
      throw new Error('Referral not found');
    }

    await this.processRecordsUpdated({
      type: 'records.updated',
      patientId: referral.patientId,
      referralId: referralId,
      timestamp: new Date()
    });
  }
}
