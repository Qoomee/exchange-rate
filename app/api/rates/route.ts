import { NextResponse } from 'next/server';

// 这里使用内存存储，实际应用中应该使用数据库
let exchangeRates = [
  { currency: 'AUD', rate: 0.63432, lastUpdated: 'P4' },
  { currency: 'HKD', rate: 0.12862, lastUpdated: 'P4' },
  { currency: 'IDR', rate: 0.06000, lastUpdated: 'P4' },
  { currency: 'JPY', rate: 0.00670, lastUpdated: 'P4' },
  { currency: 'SGD', rate: 0.74758, lastUpdated: 'P4' },
  { currency: 'THB', rate: 0.02966, lastUpdated: 'P4' },
];

export async function GET() {
  return NextResponse.json(exchangeRates);
}

export async function POST(request: Request) {
  const newRates = await request.json();
  exchangeRates = newRates;
  return NextResponse.json({ success: true });
} 