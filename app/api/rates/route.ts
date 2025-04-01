import { NextResponse } from 'next/server';

// 这里使用内存存储，实际应用中应该使用数据库
let exchangeRates = [
  { currency: 'AUD', rate: 0.62941, lastUpdated: 'P4' },
  { currency: 'HKD', rate: 0.12860, lastUpdated: 'P4' },
  { currency: 'IDR', rate: 0.06000, lastUpdated: 'P4' },
  { currency: 'JPY', rate: 0.00670, lastUpdated: 'P4' },
  { currency: 'SGD', rate: 0.74655, lastUpdated: 'P4' },
  { currency: 'THB', rate: 0.02943, lastUpdated: 'P4' },
];

export async function GET() {
  return NextResponse.json(exchangeRates);
}

export async function POST(request: Request) {
  const newRates = await request.json();
  exchangeRates = newRates;
  return NextResponse.json({ success: true });
} 