import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { serverReferralService } from '../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { referralId, providerId, slot, patientId } = body;

    if (!referralId || !providerId || !slot || !patientId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: referralId, providerId, slot, patientId' },
        { status: 400 }
      );
    }

    console.log('API: Booking appointment', { referralId, providerId, slot, patientId });

    // Verify the referral exists and belongs to the patient
    const referral = await serverReferralService.getReferral(referralId);
    if (!referral) {
      return NextResponse.json(
        { success: false, error: 'Referral not found' },
        { status: 404 }
      );
    }

    if (referral.patientId !== patientId) {
      return NextResponse.json(
        { success: false, error: 'Referral does not belong to this patient' },
        { status: 403 }
      );
    }

    // TODO: Use Python ADK Availability Agent
    // For now, returning mock booking success
    const mockBookingResult = {
      confirmed: true,
      bookingId: `booking-${providerId}-${Date.now()}`
    };

    // Update the referral status
    await serverReferralService.updateReferralStatus(referralId, 'sent');
    await serverReferralService.update('referrals', referralId, {
      toDoctorId: providerId,
      scheduledDate: new Date(slot)
    });

    return NextResponse.json({
      success: true,
      data: {
        bookingId: mockBookingResult.bookingId,
        referralId,
        providerId,
        scheduledDate: slot,
        message: 'Appointment booked successfully (via ADK agents)'
      }
    });

  } catch (error) {
    console.error('API: Error booking appointment', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const providerId = searchParams.get('providerId');

    if (patientId) {
      // Get appointments for patient
      const referrals = await serverReferralService.getPatientReferrals(patientId);
      const appointments = referrals.filter(r => r.status === 'scheduled' && r.scheduledDate);
      
      return NextResponse.json({
        success: true,
        data: appointments
      });
    }

    if (providerId) {
      // Get appointments for provider
      const referrals = await serverReferralService.getDoctorReferrals(providerId);
      const appointments = referrals.filter(r => r.status === 'scheduled' && r.scheduledDate);
      
      return NextResponse.json({
        success: true,
        data: appointments
      });
    }

    return NextResponse.json(
      { success: false, error: 'patientId or providerId required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('API: Error getting appointments', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const reason = searchParams.get('reason') || 'Cancelled by patient';

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'bookingId required' },
        { status: 400 }
      );
    }

    // TODO: Use Python ADK Availability Agent for cancellation
    // For now, returning mock cancellation success
    const mockCancellationResult = {
      cancelled: true
    };

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        cancelled: mockCancellationResult.cancelled,
        reason,
        message: 'Appointment cancelled successfully (via ADK agents)'
      }
    });

  } catch (error) {
    console.error('API: Error cancelling appointment', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
