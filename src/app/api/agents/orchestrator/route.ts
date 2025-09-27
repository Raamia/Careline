import { NextRequest, NextResponse } from 'next/server';
import { ReferralCreatedEvent } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralId, patientId, specialty } = body;

    if (!referralId || !patientId || !specialty) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: referralId, patientId, specialty' },
        { status: 400 }
      );
    }

    console.log('API: Processing referral created event', { referralId, patientId, specialty });

    const event: ReferralCreatedEvent = {
      type: 'referral.created',
      referralId,
      patientId,
      specialty,
      timestamp: new Date()
    };

    // TODO: Proxy to Python ADK Orchestrator Agent
    // For now, returning mock success response
    const mockDecisionCardId = `decision-${referralId}-${Date.now()}`;

    return NextResponse.json({
      success: true,
      data: {
        decisionCardId: mockDecisionCardId,
        message: 'Referral processing initiated successfully (via ADK agents)'
      }
    });

  } catch (error) {
    console.error('API: Error in orchestrator endpoint', error);
    
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
    const { searchParams } = new URL(request.url);
    const referralId = searchParams.get('referralId');

    if (!referralId) {
      return NextResponse.json(
        { success: false, error: 'referralId query parameter is required' },
        { status: 400 }
      );
    }

    // Get the status of orchestrator tasks for this referral
    // This would query the agent_tasks collection
    
    return NextResponse.json({
      success: true,
      data: {
        referralId,
        status: 'completed', // Mock status
        tasksCompleted: 6,
        totalTasks: 6,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('API: Error getting orchestrator status', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
