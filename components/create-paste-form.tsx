'use client'

import React from "react"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Check, Loader2 } from 'lucide-react'

export default function CreatePasteForm() {
  const [content, setContent] = useState('')
  const [ttlSeconds, setTtlSeconds] = useState('')
  const [maxViews, setMaxViews] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ id: string; url: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const body: Record<string, unknown> = { content }
      
      if (ttlSeconds) {
        const ttl = parseInt(ttlSeconds, 10)
        if (isNaN(ttl) || ttl < 1) {
          throw new Error('TTL must be a positive integer')
        }
        body.ttl_seconds = ttl
      }
      
      if (maxViews) {
        const views = parseInt(maxViews, 10)
        if (isNaN(views) || views < 1) {
          throw new Error('Max views must be a positive integer')
        }
        body.max_views = views
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create paste')
      }

      // Build the URL client-side to get the correct origin
      const clientUrl = `${window.location.origin}/p/${data.id}`
      setResult({ id: data.id, url: clientUrl })
      setContent('')
      setTtlSeconds('')
      setMaxViews('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Paste</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Enter your text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              className="font-mono"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ttl">Expiration (seconds)</Label>
              <Input
                id="ttl"
                type="number"
                min="1"
                placeholder="Optional"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for no expiration
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxViews">Max Views</Label>
              <Input
                id="maxViews"
                type="number"
                min="1"
                placeholder="Optional"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited views
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-md bg-primary/10 p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                Paste created successfully!
              </p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={result.url}
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <a
                href={`/p/${result.id}`}
                className="mt-2 inline-block text-sm text-primary hover:underline"
              >
                View paste
              </a>
            </div>
          )}

          <Button type="submit" disabled={isLoading || !content.trim()} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Paste'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
