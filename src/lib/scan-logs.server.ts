'use server'

import { supabaseAdmin } from '@/lib/supabase'

/**
 * Log a QR scan event
 * Called when a public record page is viewed
 * No authentication required - anyone can scan
 */
export async function logScanEvent(recordId: string, request: Request) {
  try {
    // Extract metadata from request
    const userAgent = request.headers.get('user-agent') || undefined
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    const referrer = request.headers.get('referrer') || undefined

    // Generate or get session ID from query param (for tracking repeat scans)
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('session_id') || undefined

    // Create scan log
    const { error } = await (supabaseAdmin as any).from('scan_logs').insert({
      record_id: recordId,
      user_agent: userAgent,
      ip_address: ip,
      referrer: referrer,
      session_id: sessionId,
    })

    if (error) {
      console.error('Failed to log scan:', error)
      // Don't throw - we don't want to break user experience if logging fails
    }

    // Update record's total_scans count and last_scan_at
    const { data: record, error: recordError } = await (supabaseAdmin as any)
      .from('records')
      .select('total_scans')
      .eq('id', recordId)
      .single()

    if (!recordError && record) {
      await (supabaseAdmin as any)
        .from('records')
        .update({
          total_scans: ((record as any).total_scans || 0) + 1,
          last_scan_at: new Date().toISOString(),
        })
        .eq('id', recordId)
    }

    return { success: true }
  } catch (error) {
    console.error('Scan logging error:', error)
    return { success: true } // Silently fail - don't impact user experience
  }
}

/**
 * Get scan history for a record (only owner can view)
 */
export async function getRecordScanHistory(userId: string, recordId: string, limit = 100) {
  try {
    // Verify ownership
    const { data: record, error: recordError } = await (supabaseAdmin as any)
      .from('records')
      .select('user_id')
      .eq('id', recordId)
      .single()

    if (recordError || !record) {
      throw new Error('Record not found')
    }

    if ((record as any).user_id !== userId) {
      throw new Error('Unauthorized')
    }

    // Get scan logs
    const { data, error } = await (supabaseAdmin as any)
      .from('scan_logs')
      .select('id, record_id, scanned_at, user_agent, ip_address, referrer, session_id')
      .eq('record_id', recordId)
      .order('scanned_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch scan history: ${error.message}`)
    }

    return { success: true, scans: (data as any[]) || [] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch scan history',
    }
  }
}
