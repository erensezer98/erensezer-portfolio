'use client'

import { useState } from 'react'
import { loginAdmin } from '../actions'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const passcode = formData.get('passcode') as string
    
    const result = await loginAdmin(passcode)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm bg-white p-8 border border-border shadow-sm">
        <h1 className="font-serif text-3xl mb-2 text-center">Admin Access</h1>
        <p className="text-muted text-sm text-center mb-8">Enter the passcode to manage the portfolio.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              name="passcode"
              required 
              placeholder="Passcode"
              className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal placeholder-muted/50 focus:outline-none focus:border-charcoal transition-colors"
            />
          </div>
          
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full text-sm tracking-widest uppercase border border-charcoal bg-charcoal text-white px-8 py-3 hover:bg-white hover:text-charcoal transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
