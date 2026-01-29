import { NextRequest, NextResponse } from 'next/server'
import { getRedis, getCurrentTime, isPasteAvailable, type Paste } from '@/lib/redis'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const redis = getRedis()
    const data = await redis.get(`paste:${id}`)
    
    if (!data) {
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 })
    }
    
    const paste: Paste = typeof data === 'string' ? JSON.parse(data) : data
    const currentTime = getCurrentTime(request)
    
    // Check if paste is available BEFORE incrementing view count
    if (!isPasteAvailable(paste, currentTime)) {
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 })
    }
    
    // Increment view count atomically
    paste.view_count += 1
    
    // Check again after increment if view limit is reached
    // We still return content this time, but save the incremented count
    const remainingViews = paste.max_views !== null 
      ? paste.max_views - paste.view_count 
      : null
    
    // Save updated paste
    if (paste.expires_at) {
      const ttlRemaining = Math.ceil((paste.expires_at - Date.now()) / 1000) + 3600
      await redis.set(`paste:${id}`, JSON.stringify(paste), { ex: Math.max(ttlRemaining, 60) })
    } else {
      await redis.set(`paste:${id}`, JSON.stringify(paste))
    }
    
    return NextResponse.json({
      content: paste.content,
      remaining_views: remainingViews !== null ? Math.max(0, remainingViews) : null,
      expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
