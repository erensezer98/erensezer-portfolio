'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6">
      <h2 className="font-serif text-3xl">Something went wrong</h2>
      <pre className="bg-white border border-red-200 text-red-700 text-xs p-4 rounded max-w-2xl w-full overflow-auto whitespace-pre-wrap">
        {error?.message || 'Unknown error'}
        {'\n\nDigest: ' + (error?.digest || 'none')}
        {'\n\nStack:\n' + (error?.stack || '')}
      </pre>
      <button
        onClick={reset}
        className="text-xs tracking-widest uppercase border border-charcoal px-8 py-3 hover:bg-charcoal hover:text-white transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
