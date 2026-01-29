import CreatePasteForm from '@/components/create-paste-form'

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Pastebin-Lite</h1>
          <p className="mt-2 text-muted-foreground">
            Create and share text snippets with optional expiration
          </p>
        </div>

        <CreatePasteForm />
      </div>
    </main>
  )
}
