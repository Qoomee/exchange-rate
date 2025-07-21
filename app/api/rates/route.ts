import { NextResponse } from 'next/server';
import { exchangeRateService, type ExchangeRate } from '@/lib/supabase';

export async function GET() {
  try {
    // 获取最新的期间
    const latestPeriod = await exchangeRateService.getLatestPeriod();
    
    // 获取最新期间的汇率数据
    const rates = await exchangeRateService.getRatesByPeriod(latestPeriod);
    
    // 如果数据库为空，返回默认数据
    if (!rates || rates.length === 0) {
      const defaultRates = [
        { currency: 'AUD', rate: 0.64000, period: latestPeriod },
        { currency: 'HKD', rate: 0.12892, period: latestPeriod },
        { currency: 'IDR', rate: 0.06000, period: latestPeriod },
        { currency: 'JPY', rate: 0.00670, period: latestPeriod },
        { currency: 'SGD', rate: 0.76046, period: latestPeriod },
        { currency: 'THB', rate: 0.02980, period: latestPeriod },
      ];
      
      // 将默认数据插入数据库
      await exchangeRateService.upsertRates(defaultRates);
      return NextResponse.json(defaultRates.map(rate => ({
        currency: rate.currency,
        rate: rate.rate,
        lastUpdated: rate.period
      })));
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
    const newRates: any[] = await request.json();
    
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
