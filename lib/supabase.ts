import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://sbnfbrlubhxaautotwkl.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// 定义汇率数据类型
export interface ExchangeRate {
  id?: number
  currency: string
  rate: number
  period: string
  created_at?: string
  updated_at?: string
}

// 定义数据库操作函数
export const exchangeRateService = {
  // 获取所有汇率
  async getAllRates() {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .order('currency', { ascending: true })
    
    if (error) {
      console.error('Error fetching rates:', error)
      throw error
    }
    
    return data
  },

  // 获取特定期间的汇率
  async getRatesByPeriod(period: string) {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('period', period)
      .order('currency', { ascending: true })
    
    if (error) {
      console.error('Error fetching rates by period:', error)
      throw error
    }
    
    return data
  },

  // 更新或插入汇率
  async upsertRates(rates: ExchangeRate[]) {
    const { data, error } = await supabase
      .from('exchange_rates')
      .upsert(
        rates.map(rate => ({
          currency: rate.currency,
          rate: rate.rate,
          period: rate.period,
          updated_at: new Date().toISOString()
        })),
        { 
          onConflict: 'currency,period',
          ignoreDuplicates: false 
        }
      )
      .select()
    
    if (error) {
      console.error('Error upserting rates:', error)
      throw error
    }
    
    return data
  },

  // 获取最新的期间
  async getLatestPeriod() {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('period')
      .order('updated_at', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error('Error fetching latest period:', error)
      throw error
    }
    
    return data?.[0]?.period || 'P5'
  },

  // 获取所有期间
  async getAllPeriods() {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('period')
      .order('period', { ascending: false })
    
    if (error) {
      console.error('Error fetching periods:', error)
      throw error
    }
    
    // 去重
    const uniquePeriods = [...new Set(data?.map(item => item.period) || [])]
    return uniquePeriods
  }
} 