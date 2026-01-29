import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface Paste {
  id: string
  content: string
  created_at: number
  expires_at: number | null
  max_views: number | null
  view_count: number
}

export function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function getCurrentTime(request: Request): number {
  const testMode = process.env.TEST_MODE === '1'
  if (testMode) {
    const testNowMs = request.headers.get('x-test-now-ms')
    if (testNowMs) {
      const parsed = parseInt(testNowMs, 10)
      if (!isNaN(parsed)) {
        return parsed
      }
    }
  }
  return Date.now()
}

export function isPasteAvailable(paste: Paste, currentTime: number): boolean {
  // Check TTL expiry
  if (paste.expires_at !== null && currentTime >= paste.expires_at) {
    return false
  }
  
  // Check view limit
  if (paste.max_views !== null && paste.view_count >= paste.max_views) {
    return false
  }
  
  return true
}
