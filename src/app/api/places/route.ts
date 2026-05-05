import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const query = request.nextUrl.searchParams.get('q')
  if (!query?.trim()) return NextResponse.json({ results: [] })

  const res = await fetch(
    `https://api.foursquare.com/v3/autocomplete?query=${encodeURIComponent(query)}&types=place&limit=6`,
    {
      headers: {
        Authorization: process.env.FOURSQUARE_API_KEY!,
        Accept: 'application/json',
      },
    }
  )

  if (!res.ok) return NextResponse.json({ results: [] })

  const data = await res.json()
  return NextResponse.json(data)
}
