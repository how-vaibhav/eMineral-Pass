'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { format, subDays } from 'date-fns'

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(userId: string) {
  try {
    // Total records
    const { count: totalRecords } = await supabaseAdmin
      .from('records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Total scans
    const { data: recordIds } = await supabaseAdmin
      .from('records')
      .select('id')
      .eq('user_id', userId)

    const recordIdList = (recordIds as any[] | null)?.map((r) => r.id) || []

    let totalScans = 0
    if (recordIdList.length > 0) {
      const { count } = await supabaseAdmin
        .from('scan_logs')
        .select('*', { count: 'exact', head: true })
        .in('record_id', recordIdList)

      totalScans = count || 0
    }

    // Records today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: recordsToday } = await supabaseAdmin
      .from('records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())

    // Records this week
    const weekAgo = subDays(today, 7)

    const { count: recordsThisWeek } = await supabaseAdmin
      .from('records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekAgo.toISOString())

    // Active records
    const { count: activeRecords } = await supabaseAdmin
      .from('records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active')

    // Expired records
    const { count: expiredRecords } = await supabaseAdmin
      .from('records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'expired')

    // Average scans
    const avgScansPerRecord = totalRecords && totalRecords > 0 ? Math.round(totalScans / totalRecords) : 0

    return {
      success: true,
      stats: {
        totalRecords: totalRecords || 0,
        totalScans,
        recordsToday: recordsToday || 0,
        recordsThisWeek: recordsThisWeek || 0,
        avgScansPerRecord,
        activeRecords: activeRecords || 0,
        expiredRecords: expiredRecords || 0,
      },
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    }
  }
}

/**
 * Get records created per day (last 30 days)
 */
export async function getRecordsPerDay(userId: string, days = 30) {
  try {
    const since = subDays(new Date(), days)

    const { data, error } = await supabaseAdmin
      .from('record_analytics')
      .select('created_date, records_created')
      .eq('user_id', userId)
      .gte('created_date', format(since, 'yyyy-MM-dd'))
      .order('created_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`)
    }

    // Fill in missing dates with 0 records
    const result: Array<{ date: string; count: number }> = []
    const dataMap = new Map(((data || []) as any[]).map((d) => [d.created_date, d.records_created || 0]))

    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      result.push({
        date: dateStr,
        count: dataMap.get(dateStr) || 0,
      })
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Records per day error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch records per day',
    }
  }
}

/**
 * Get scans per day (last 30 days)
 */
export async function getScansPerDay(userId: string, days = 30) {
  try {
    const since = subDays(new Date(), days)

    // Get all record IDs for this user
    const { data: records } = await supabaseAdmin.from('records').select('id').eq('user_id', userId)

    const recordIds = (records as any[] | null)?.map((r) => r.id) || []

    if (recordIds.length === 0) {
      // No records, return empty data
      const result: Array<{ date: string; count: number }> = []
      for (let i = days; i >= 0; i--) {
        const date = subDays(new Date(), i)
        result.push({
          date: format(date, 'yyyy-MM-dd'),
          count: 0,
        })
      }
      return { success: true, data: result }
    }

    const { data, error } = await supabaseAdmin
      .from('scan_logs')
      .select('scanned_at')
      .in('record_id', recordIds)
      .gte('scanned_at', since.toISOString())

    if (error) {
      throw new Error(`Failed to fetch scans: ${error.message}`)
    }

    // Group by date
    const dataMap = new Map<string, number>()
    ;((data || []) as any[]).forEach((log) => {
      const date = format(new Date(log.scanned_at), 'yyyy-MM-dd')
      dataMap.set(date, (dataMap.get(date) || 0) + 1)
    })

    // Fill in missing dates with 0 scans
    const result: Array<{ date: string; count: number }> = []
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      result.push({
        date: dateStr,
        count: dataMap.get(dateStr) || 0,
      })
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Scans per day error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch scans per day',
    }
  }
}
