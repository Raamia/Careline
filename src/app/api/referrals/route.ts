import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { serverReferralService, serverDecisionCardService } from '@/lib/database';
import { Referral } from '@/types';

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
    const { 
      patientId, 
      fromDoctorId, 
      toDoctorId, 
      specialty, 
      reason, 
      urgency, 
      notes 
    } = body;

    if (!patientId || !fromDoctorId || !specialty || !reason || !urgency) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create referral
    const referralData: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'> = {
      patientId,
      fromDoctorId,
      toDoctorId,
      specialty,
      reason,
      urgency: urgency as 'routine' | 'urgent' | 'stat',
      status: 'pending',
      notes
    };

    const referralId = await serverReferralService.createReferral(referralData);

    // Trigger orchestrator agent
    try {
      const orchestratorResponse = await fetch(
        `${process.env.AUTH0_BASE_URL}/api/agents/orchestrator`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referralId,
            patientId,
            specialty
          })
        }
      );

      if (!orchestratorResponse.ok) {
        console.error('Failed to trigger orchestrator agent');
      }
    } catch (error) {
      console.error('Error triggering orchestrator agent:', error);
      // Don't fail the referral creation if the agent fails
    }

    return NextResponse.json({
      success: true,
      data: {
        referralId,
        message: 'Referral created successfully'
      }
    });

  } catch (error) {
    console.error('API: Error creating referral', error);
    
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
    const doctorId = searchParams.get('doctorId');
    const referralId = searchParams.get('referralId');

    if (referralId) {
      // Get specific referral
      const referral = await serverReferralService.getReferral(referralId);
      if (!referral) {
        return NextResponse.json(
          { success: false, error: 'Referral not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: referral
      });
    }

    if (patientId) {
      // Get referrals for patient
      const referrals = await serverReferralService.getPatientReferrals(patientId);
      return NextResponse.json({
        success: true,
        data: referrals
      });
    }

    if (doctorId) {
      // Get referrals for doctor
      const referrals = await serverReferralService.getDoctorReferrals(doctorId);
      return NextResponse.json({
        success: true,
        data: referrals
      });
    }

    return NextResponse.json(
      { success: false, error: 'patientId, doctorId, or referralId required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('API: Error getting referrals', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
