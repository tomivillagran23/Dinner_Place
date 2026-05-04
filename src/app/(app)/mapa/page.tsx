import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveSpaceId } from '@/lib/space'
import MapaClient from './mapa-client'

export default async function MapaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const spaceId = await getActiveSpaceId()
  if (!spaceId) redirect('/espacios')

  const [restaurantsResult, tagsResult] = await Promise.all([
    supabase
      .from('restaurants')
      .select(`*, tags:restaurant_tags(tag:tags(*))`)
      .eq('couple_id', spaceId),
    supabase
      .from('tags')
      .select('*')
      .eq('couple_id', spaceId),
  ])

  const restaurants = (restaurantsResult.data ?? []).map(r => ({
    ...r,
    tags: r.tags?.map((rt: { tag: unknown }) => rt.tag).filter(Boolean) ?? [],
  }))

  return <MapaClient restaurants={restaurants} tags={tagsResult.data ?? []} />
}
