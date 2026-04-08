import { NextResponse } from 'next/server'
import { getPiazzaTallies, batchIncrementPiazzaTallies } from '@/lib/supabase'

export async function GET() {
  const tallies = await getPiazzaTallies()
  return NextResponse.json(tallies)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { increments } = body
    
    if (!Array.isArray(increments)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }
    
    await batchIncrementPiazzaTallies(increments)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
