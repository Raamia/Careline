import { AvailabilitySlot } from '@/types';
import { serverAgentTaskService } from '@/lib/database';

interface AvailabilityAgentInput {
  referralId: string;
  providerIds: string[];
  urgency?: 'routine' | 'urgent' | 'stat';
  preferredTimeframe?: 'week' | 'month' | 'quarter';
}

interface AvailabilityAgentOutput {
  availability: AvailabilitySlot[];
}

export class AvailabilityAgent {
  async getAvailability(input: AvailabilityAgentInput): Promise<AvailabilityAgentOutput> {
    console.log('Availability Agent: Fetching availability', input);
    
    const taskId = await serverAgentTaskService.createTask({
      type: 'availability',
      referralId: input.referralId,
      status: 'running',
      inputs: input
    });

    try {
      // Simulate API delay for fetching from provider systems
      await new Promise(resolve => setTimeout(resolve, 1500));

      const slots: AvailabilitySlot[] = [];

      // Generate mock availability for each provider
      for (const providerId of input.providerIds) {
        const providerSlots = this.generateMockAvailability(
          providerId, 
          input.urgency || 'routine'
        );
        slots.push(...providerSlots);
      }

      // Sort by date
      slots.sort((a, b) => new Date(a.slot).getTime() - new Date(b.slot).getTime());

      console.log(`Availability Agent: Found ${slots.length} available slots`);

      const output: AvailabilityAgentOutput = {
        availability: slots
      };

      await serverAgentTaskService.updateTaskStatus(taskId, 'completed', output);
      
      return output;

    } catch (error) {
      console.error('Availability Agent: Error fetching availability', error);
      await serverAgentTaskService.updateTaskStatus(taskId, 'failed', undefined, error.message);
      throw error;
    }
  }

  private generateMockAvailability(
    providerId: string, 
    urgency: 'routine' | 'urgent' | 'stat'
  ): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = [];
    const now = new Date();
    
    // Determine how far out to look based on urgency
    let startDays = 1;
    let endDays = 30;
    let slotCount = 3;

    switch (urgency) {
      case 'stat':
        startDays = 0;
        endDays = 3;
        slotCount = 2;
        break;
      case 'urgent':
        startDays = 1;
        endDays = 7;
        slotCount = 3;
        break;
      case 'routine':
        startDays = 7;
        endDays = 60;
        slotCount = 5;
        break;
    }

    // Generate random slots
    for (let i = 0; i < slotCount; i++) {
      const randomDays = Math.floor(Math.random() * (endDays - startDays)) + startDays;
      const slotDate = new Date(now);
      slotDate.setDate(slotDate.getDate() + randomDays);
      
      // Random time between 8 AM and 5 PM
      const hour = Math.floor(Math.random() * 9) + 8;
      const minute = Math.random() < 0.5 ? 0 : 30;
      slotDate.setHours(hour, minute, 0, 0);

      slots.push({
        providerId,
        slot: slotDate.toISOString(),
        duration: this.getAppointmentDuration(providerId),
        appointmentType: this.getAppointmentType(urgency)
      });
    }

    return slots;
  }

  private getAppointmentDuration(providerId: string): number {
    // Different specialties have different appointment durations
    // This would be configured per provider in a real system
    if (providerId.includes('cardio')) {
      return 60; // Cardiology consultations are typically 60 minutes
    } else if (providerId.includes('derm')) {
      return 30; // Dermatology visits are typically 30 minutes
    } else if (providerId.includes('ortho')) {
      return 45; // Orthopedic visits are typically 45 minutes
    }
    return 45; // Default
  }

  private getAppointmentType(urgency: 'routine' | 'urgent' | 'stat'): string {
    switch (urgency) {
      case 'stat':
        return 'emergency_consultation';
      case 'urgent':
        return 'urgent_consultation';
      case 'routine':
        return 'new_patient_consultation';
      default:
        return 'consultation';
    }
  }

  async bookAppointment(
    providerId: string, 
    slot: string, 
    patientId: string, 
    referralId: string
  ): Promise<{ bookingId: string; confirmed: boolean }> {
    console.log('Availability Agent: Booking appointment', { providerId, slot, patientId, referralId });
    
    // Simulate booking delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock booking response
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // In a real system, this would:
    // 1. Reserve the slot in the provider's system
    // 2. Send confirmation to patient and provider
    // 3. Create calendar entries
    // 4. Update the referral status
    
    return {
      bookingId,
      confirmed: true
    };
  }

  async cancelAppointment(bookingId: string, reason: string): Promise<{ cancelled: boolean }> {
    console.log('Availability Agent: Cancelling appointment', { bookingId, reason });
    
    // Simulate cancellation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real system, this would:
    // 1. Cancel the appointment in the provider's system
    // 2. Notify patient and provider
    // 3. Free up the slot for other patients
    // 4. Update referral status if needed

    return { cancelled: true };
  }

  async rescheduleAppointment(
    bookingId: string, 
    newSlot: string
  ): Promise<{ rescheduled: boolean; newBookingId: string }> {
    console.log('Availability Agent: Rescheduling appointment', { bookingId, newSlot });
    
    // Simulate rescheduling delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newBookingId = `booking-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    return {
      rescheduled: true,
      newBookingId
    };
  }

  async getProviderSchedule(
    providerId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<AvailabilitySlot[]> {
    console.log('Availability Agent: Getting provider schedule', { providerId, startDate, endDate });
    
    // This would connect to the provider's scheduling system
    // For now, return mock data
    return this.generateMockAvailability(providerId, 'routine');
  }
}
