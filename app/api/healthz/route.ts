import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'

export async function GET() {
  try {
    const redis = getRedis()
    // Check Redis connection by doing a simple ping
    await redis.ping()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Database connection failed' }, { status: 503 })
  }
}
