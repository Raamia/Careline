import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { serverDecisionCardService } from '@/lib/database';

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
    const referralId = searchParams.get('referralId');

    if (!referralId) {
      return NextResponse.json(
        { success: false, error: 'referralId query parameter is required' },
        { status: 400 }
      );
    }

    console.log('API: Getting decision card for referral', referralId);

    const decisionCard = await serverDecisionCardService.getDecisionCard(referralId);

    if (!decisionCard) {
      return NextResponse.json(
        { success: false, error: 'Decision card not found. The AI agents may still be processing this referral.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: decisionCard
    });

  } catch (error) {
    console.error('API: Error getting decision card', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
