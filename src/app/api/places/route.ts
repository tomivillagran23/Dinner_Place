import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const query = request.nextUrl.searchParams.get('q')
  if (!query?.trim()) return NextResponse.json({ results: [] })

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=ar&format=json&limit=6&addressdetails=1`

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'DinnerPlace/1.0 (dinnerplace.app)',
      'Accept-Language': 'es',
    },
  })

  if (!res.ok) return NextResponse.json({ results: [] })

  const data = await res.json()
  return NextResponse.json({ results: data })
}
