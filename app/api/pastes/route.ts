import { NextRequest, NextResponse } from 'next/server'
import { getRedis, generateId, getCurrentTime, type Paste } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const redis = getRedis()
    
    // Validate content
    if (typeof body.content !== 'string' || body.content.trim() === '') {
      return NextResponse.json(
        { error: 'content is required and must be a non-empty string' },
        { status: 400 }
      )
    }
    
    // Validate ttl_seconds
    if (body.ttl_seconds !== undefined) {
      if (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1) {
        return NextResponse.json(
          { error: 'ttl_seconds must be an integer >= 1' },
          { status: 400 }
        )
      }
    }
    
    // Validate max_views
    if (body.max_views !== undefined) {
      if (!Number.isInteger(body.max_views) || body.max_views < 1) {
        return NextResponse.json(
          { error: 'max_views must be an integer >= 1' },
          { status: 400 }
        )
      }
    }
    
    const currentTime = getCurrentTime(request)
    const id = generateId()
    
    const paste: Paste = {
      id,
      content: body.content,
      created_at: currentTime,
      expires_at: body.ttl_seconds ? currentTime + (body.ttl_seconds * 1000) : null,
      max_views: body.max_views ?? null,
      view_count: 0,
    }
    
    // Store in Redis
    // If TTL is set, use Redis TTL feature as well for auto-cleanup
    if (body.ttl_seconds) {
      await redis.set(`paste:${id}`, JSON.stringify(paste), { ex: body.ttl_seconds + 3600 }) // Add buffer for test mode
    } else {
      await redis.set(`paste:${id}`, JSON.stringify(paste))
    }
    
    // Build the URL
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || 'localhost:3000'
    const url = `${protocol}://${host}/p/${id}`
    
    return NextResponse.json({ id, url }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }
}
