'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Clock, Eye } from 'lucide-react'
import { useState } from 'react'

interface PasteViewProps {
  content: string
  remainingViews: number | null
  expiresAt: string | null
}

export default function PasteView({ content, remainingViews, expiresAt }: PasteViewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatExpiry = (expiresAt: string) => {
    const date = new Date(expiresAt)
    return date.toLocaleString()
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Pastebin-Lite</h1>
          <a href="/" className="text-primary hover:underline">
            Create New Paste
          </a>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Paste Content</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2 bg-transparent"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap break-words rounded-md bg-muted p-4 font-mono text-sm text-foreground">
              {content}
            </pre>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {remainingViews !== null && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{remainingViews} view{remainingViews !== 1 ? 's' : ''} remaining</span>
                </div>
              )}
              {expiresAt && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Expires: {formatExpiry(expiresAt)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
