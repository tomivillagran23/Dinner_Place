import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomeClient from './home-client'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) redirect('/onboarding')

  const [restaurantsResult, tagsResult] = await Promise.all([
    supabase
      .from('restaurants')
      .select(`
        *,
        tags:restaurant_tags(tag:tags(*)),
        profiles!added_by(display_name)
      `)
      .eq('couple_id', profile.couple_id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tags')
      .select('*')
      .eq('couple_id', profile.couple_id),
  ])

  const restaurants = (restaurantsResult.data ?? []).map(r => ({
    ...r,
    tags: r.tags?.map((rt: { tag: unknown }) => rt.tag).filter(Boolean) ?? [],
  }))

  const tags = tagsResult.data ?? []

  return <HomeClient restaurants={restaurants} tags={tags} />
}
