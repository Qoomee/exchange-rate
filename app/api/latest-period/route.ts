import { NextResponse } from 'next/server';
import { exchangeRateService } from '@/lib/supabase';

export async function GET() {
  try {
    const latestPeriod = await exchangeRateService.getLatestPeriod();
    return NextResponse.json({ period: latestPeriod });
  } catch (error) {
    console.error('Error fetching latest period:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest period' },
      { status: 500 }
    );
  }
} 