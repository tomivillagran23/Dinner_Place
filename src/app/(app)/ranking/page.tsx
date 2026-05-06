import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveSpaceId } from '@/lib/space'
import { Star, MapPin, Trophy } from 'lucide-react'
import Link from 'next/link'

const MEDALS = ['🥇', '🥈', '🥉']

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const spaceId = await getActiveSpaceId()
  if (!spaceId) redirect('/espacios')

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name, photo_urls, cuisine_type, neighborhood, visited')
    .eq('couple_id', spaceId)

  const { data: ratings } = await supabase
    .from('ratings')
    .select('restaurant_id, rating')
    .eq('space_id', spaceId)

  const ratingMap = new Map<string, number[]>()
  for (const r of ratings ?? []) {
    if (!ratingMap.has(r.restaurant_id)) ratingMap.set(r.restaurant_id, [])
    ratingMap.get(r.restaurant_id)!.push(r.rating)
  }

  const ranked = (restaurants ?? [])
    .map(r => {
      const votes = ratingMap.get(r.id) ?? []
      const avg = votes.length > 0
        ? Math.round((votes.reduce((s, v) => s + v, 0) / votes.length) * 10) / 10
        : null
      return { ...r, avg, votes: votes.length }
    })
    .filter(r => r.avg !== null)
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))

  const unrated = (restaurants ?? []).filter(r => !ratingMap.has(r.id))

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-5 h-5 text-[#FFD700]" />
        <h1 className="text-xl font-bold">Ranking del espacio</h1>
      </div>

      {ranked.length === 0 ? (
        <div className="text-center py-16 text-[#737373]">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Sin ratings aún</p>
          <p className="text-sm mt-1">Puntuá restaurantes para verlos acá</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {ranked.map((r, i) => (
            <Link
              key={r.id}
              href={`/restaurante/${r.id}`}
              className="flex items-center gap-4 glass rounded-2xl p-4 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] transition-all"
            >
              <div className="w-10 text-center flex-shrink-0">
                {i < 3 ? (
                  <span className="text-2xl">{MEDALS[i]}</span>
                ) : (
                  <span className="text-lg font-bold text-[#737373]">#{i + 1}</span>
                )}
              </div>

              {r.photo_urls?.[0] ? (
                <img src={r.photo_urls[0]} alt={r.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#1E1E1E] flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{r.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {r.cuisine_type && <span className="text-xs text-[#737373]">{r.cuisine_type}</span>}
                  {r.neighborhood && (
                    <span className="text-xs text-[#737373] flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />{r.neighborhood}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className={`w-3.5 h-3.5 ${idx < Math.round(r.avg!) ? 'text-[#FFD700] fill-[#FFD700]' : 'text-[#2A2A2A] fill-[#2A2A2A]'}`} />
                  ))}
                  <span className="text-xs text-[#737373] ml-1">{r.avg} · {r.votes} voto{r.votes !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {unrated.length > 0 && (
        <div>
          <p className="text-xs text-[#4A4A4A] uppercase tracking-wider font-semibold mb-3">Sin puntuar aún</p>
          <div className="space-y-2">
            {unrated.map(r => (
              <Link
                key={r.id}
                href={`/restaurante/${r.id}`}
                className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all"
              >
                <span className="text-sm text-white truncate flex-1">{r.name}</span>
                <span className="text-xs text-[#4A4A4A]">Puntuar →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
