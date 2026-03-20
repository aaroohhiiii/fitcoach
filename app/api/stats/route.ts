import { getSupabase } from '@/lib/supabase'
import { computeStats, type Workout } from '@/lib/stats'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.from('workouts').select('*')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const workouts = (data ?? []) as Workout[]
    return NextResponse.json(computeStats(workouts))
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
