import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import RestauranteDetailClient from './detail-client'

export default async function RestaurantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id, id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) redirect('/onboarding')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select(`
      *,
      tags:restaurant_tags(tag:tags(*)),
      profiles!added_by(display_name, avatar_url)
    `)
    .eq('id', id)
    .eq('couple_id', profile.couple_id)
    .single()

  if (!restaurant) notFound()

  const normalized = {
    ...restaurant,
    tags: restaurant.tags?.map((rt: { tag: unknown }) => rt.tag).filter(Boolean) ?? [],
  }

  return <RestauranteDetailClient restaurant={normalized} currentUserId={profile.id} />
}
