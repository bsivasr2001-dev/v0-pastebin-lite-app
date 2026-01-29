import { redis, isPasteAvailable, type Paste } from '@/lib/redis'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import PasteView from '@/components/paste-view'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PastePage({ params }: PageProps) {
  const { id } = await params
  const headersList = await headers()
  
  // Get current time (with TEST_MODE support)
  let currentTime = Date.now()
  if (process.env.TEST_MODE === '1') {
    const testNowMs = headersList.get('x-test-now-ms')
    if (testNowMs) {
      const parsed = parseInt(testNowMs, 10)
      if (!isNaN(parsed)) {
        currentTime = parsed
      }
    }
  }
  
  const data = await redis.get(`paste:${id}`)
  
  if (!data) {
    notFound()
  }
  
  const paste: Paste = typeof data === 'string' ? JSON.parse(data) : data
  
  // Check if paste is available
  if (!isPasteAvailable(paste, currentTime)) {
    notFound()
  }
  
  // Increment view count
  paste.view_count += 1
  
  // Calculate remaining views
  const remainingViews = paste.max_views !== null 
    ? Math.max(0, paste.max_views - paste.view_count)
    : null
  
  // Save updated paste
  if (paste.expires_at) {
    const ttlRemaining = Math.ceil((paste.expires_at - Date.now()) / 1000) + 3600
    await redis.set(`paste:${id}`, JSON.stringify(paste), { ex: Math.max(ttlRemaining, 60) })
  } else {
    await redis.set(`paste:${id}`, JSON.stringify(paste))
  }
  
  return (
    <PasteView 
      content={paste.content}
      remainingViews={remainingViews}
      expiresAt={paste.expires_at ? new Date(paste.expires_at).toISOString() : null}
    />
  )
}
