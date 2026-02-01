import { NextRequest, NextResponse } from 'next/server'
import { logScanEvent } from '@/lib/scan-logs.server'
import { getPublicRecord } from '@/lib/records.server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicToken: string }> }
) {
  try {
    const { publicToken } = await params

    if (!publicToken) {
      return NextResponse.json({ success: false, error: 'Missing public token' }, { status: 400 })
    }

    const result = await getPublicRecord(publicToken)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 })
    }

    const record = (result as any).record
    if (!record) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 })
    }

    logScanEvent(record.id, request).catch(console.error)

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
