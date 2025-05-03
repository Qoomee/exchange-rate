import { NextResponse } from 'next/server';

// 这里使用内存存储，实际应用中应该使用数据库
let exchangeRates = [
  { currency: 'AUD', rate: 0.64000, lastUpdated: 'P5' },
  { currency: 'HKD', rate: 0.12892, lastUpdated: 'P5' },
  { currency: 'IDR', rate: 0.06000, lastUpdated: 'P5' },
  { currency: 'JPY', rate: 0.00670, lastUpdated: 'P5' },
  { currency: 'SGD', rate: 0.76046, lastUpdated: 'P5' },
  { currency: 'THB', rate: 0.02980, lastUpdated: 'P5' },
];

export async function GET() {
  return NextResponse.json(exchangeRates);
}

export async function POST(request: Request) {
  const newRates = await request.json();
  exchangeRates = newRates;
  return NextResponse.json({ success: true });
} 
