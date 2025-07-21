import { NextResponse } from 'next/server';
import { exchangeRateService } from '@/lib/supabase';

export async function GET() {
  try {
    // 获取最新的期间
    const latestPeriod = await exchangeRateService.getLatestPeriod();
    
    // 获取最新期间的汇率数据
    const rates = await exchangeRateService.getRatesByPeriod(latestPeriod);
    
    // 如果数据库为空，返回空数组
    if (!rates || rates.length === 0) {
      return NextResponse.json([]);
    }
    
    // 转换数据格式以保持与前端的兼容性
    const formattedRates = rates.map(rate => ({
      currency: rate.currency,
      rate: rate.rate,
      lastUpdated: rate.period
    }));
    
    return NextResponse.json(formattedRates);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newRates: Array<{currency: string; rate: number; lastUpdated?: string; period?: string}> = await request.json();
    
    // 转换数据格式以适应数据库
    const ratesToUpdate = newRates.map(rate => ({
      currency: rate.currency,
      rate: rate.rate,
      period: rate.lastUpdated || rate.period || 'P5'
    }));
    
    await exchangeRateService.upsertRates(ratesToUpdate);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating exchange rates:', error);
    return NextResponse.json(
      { error: 'Failed to update exchange rates' },
      { status: 500 }
    );
  }
} 
