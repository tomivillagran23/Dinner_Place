import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import { getActiveSpaceId } from '@/lib/space'
import RestauranteDetailClient from './detail-client'

export default async function RestaurantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const spaceId = await getActiveSpaceId()
  if (!spaceId) redirect('/espacios')

  const admin = createAdminClient()

  const [restaurantResult, spaceResult, commentsResult] = await Promise.all([
    supabase
      .from('restaurants')
      .select(`*, tags:restaurant_tags(tag:tags(*)), profiles!added_by(display_name, avatar_url)`)
      .eq('id', id)
      .eq('couple_id', spaceId)
      .single(),
    admin.from('couples').select('created_by').eq('id', spaceId).single(),
    supabase
      .from('comments')
      .select('*, profiles(display_name)')
      .eq('restaurant_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!restaurantResult.data) notFound()

  const isAdmin = spaceResult.data?.created_by === user.id

  const normalized = {
    ...restaurantResult.data,
    tags: restaurantResult.data.tags?.map((rt: { tag: unknown }) => rt.tag).filter(Boolean) ?? [],
  }

  return (
    <RestauranteDetailClient
      restaurant={normalized}
      currentUserId={user.id}
      isAdmin={isAdmin}
      initialComments={commentsResult.data ?? []}
    />
  )
}
