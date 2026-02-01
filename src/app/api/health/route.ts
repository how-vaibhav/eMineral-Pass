import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    const { error } = await supabaseAdmin.from('users').select('count', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database connection failed',
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
