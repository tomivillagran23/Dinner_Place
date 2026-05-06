'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getActiveSpaceId } from '@/lib/space'

function parseLatLng(mapsUrl: string): { lat: number | null; lng: number | null } {
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
  ]
  for (const pattern of patterns) {
    const match = mapsUrl.match(pattern)
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
    }
  }
  return { lat: null, lng: null }
}

export async function createRestaurant(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const spaceId = await getActiveSpaceId()
  if (!spaceId) return { error: 'No hay espacio activo' }

  const profile = { couple_id: spaceId }

  const mapsUrl = formData.get('google_maps_url') as string
  const directLat = formData.get('latitude') as string
  const directLng = formData.get('longitude') as string
  const { lat: parsedLat, lng: parsedLng } = mapsUrl ? parseLatLng(mapsUrl) : { lat: null, lng: null }
  const lat = directLat ? parseFloat(directLat) : parsedLat
  const lng = directLng ? parseFloat(directLng) : parsedLng

  const photoUrlsRaw = formData.get('photo_urls') as string
  const photoUrls = photoUrlsRaw ? photoUrlsRaw.split(',').filter(Boolean) : []

  const tagsRaw = formData.get('tags') as string
  const tagIds = tagsRaw ? tagsRaw.split(',').filter(Boolean) : []

  const priceLevelRaw = formData.get('price_level')
  const priceLevel = priceLevelRaw ? parseInt(priceLevelRaw as string) : null

  const ratingRaw = formData.get('rating')
  const rating = ratingRaw ? parseInt(ratingRaw as string) : null

  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .insert({
      couple_id: profile.couple_id,
      added_by: user.id,
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      google_maps_url: mapsUrl || null,
      latitude: lat,
      longitude: lng,
      photo_urls: photoUrls,
      price_level: priceLevel,
      opening_hours: formData.get('opening_hours') as string || null,
      rating,
      notes: formData.get('notes') as string || null,
      visited: formData.get('visited') === 'true',
      neighborhood: formData.get('neighborhood') as string || null,
      cuisine_type: formData.get('cuisine_type') as string || null,
      pin_color: formData.get('pin_color') as string || '#FF4D4D',
    })
    .select()
    .single()

  if (error) return { error: error.message }

  if (tagIds.length > 0) {
    await supabase.from('restaurant_tags').insert(
      tagIds.map(tag_id => ({ restaurant_id: restaurant.id, tag_id }))
    )
  }

  // Enviar push a los otros miembros del espacio
  const admin = createAdminClient()
  const { data: members } = await admin
    .from('space_members')
    .select('user_id')
    .eq('space_id', spaceId)
    .neq('user_id', user.id)

  if (members && members.length > 0) {
    const memberIds = members.map(m => m.user_id)
    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('subscription')
      .in('user_id', memberIds)

    if (subs && subs.length > 0) {
      const { sendPushNotification } = await import('@/lib/push')
      const restaurantName = formData.get('name') as string
      await Promise.all(
        subs.map(s =>
          sendPushNotification(s.subscription, {
            title: 'Nuevo restaurante 🍽️',
            body: `Se agregó "${restaurantName}" a tu lista`,
            url: `/restaurante/${restaurant.id}`,
          })
        )
      )
    }
  }

  revalidatePath('/')
  redirect('/')
}

export async function updateRestaurant(restaurantId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const mapsUrl = formData.get('google_maps_url') as string
  const directLat = formData.get('latitude') as string
  const directLng = formData.get('longitude') as string
  const { lat: parsedLat, lng: parsedLng } = mapsUrl ? parseLatLng(mapsUrl) : { lat: null, lng: null }
  const lat = directLat ? parseFloat(directLat) : parsedLat
  const lng = directLng ? parseFloat(directLng) : parsedLng

  const photoUrlsRaw = formData.get('photo_urls') as string
  const photoUrls = photoUrlsRaw ? photoUrlsRaw.split(',').filter(Boolean) : []

  const tagsRaw = formData.get('tags') as string
  const tagIds = tagsRaw ? tagsRaw.split(',').filter(Boolean) : []

  const priceLevelRaw = formData.get('price_level')
  const priceLevel = priceLevelRaw ? parseInt(priceLevelRaw as string) : null

  const ratingRaw = formData.get('rating')
  const rating = ratingRaw ? parseInt(ratingRaw as string) : null

  const { error } = await supabase
    .from('restaurants')
    .update({
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      google_maps_url: mapsUrl || null,
      latitude: lat,
      longitude: lng,
      photo_urls: photoUrls,
      price_level: priceLevel,
      opening_hours: formData.get('opening_hours') as string || null,
      rating,
      notes: formData.get('notes') as string || null,
      visited: formData.get('visited') === 'true',
      neighborhood: formData.get('neighborhood') as string || null,
      cuisine_type: formData.get('cuisine_type') as string || null,
      pin_color: formData.get('pin_color') as string || '#FF4D4D',
    })
    .eq('id', restaurantId)

  if (error) return { error: error.message }

  await supabase.from('restaurant_tags').delete().eq('restaurant_id', restaurantId)

  if (tagIds.length > 0) {
    await supabase.from('restaurant_tags').insert(
      tagIds.map(tag_id => ({ restaurant_id: restaurantId, tag_id }))
    )
  }

  revalidatePath('/')
  revalidatePath(`/restaurante/${restaurantId}`)
  redirect(`/restaurante/${restaurantId}`)
}

export async function deleteRestaurant(restaurantId: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  await supabase.from('restaurant_tags').delete().eq('restaurant_id', restaurantId)
  await supabase.from('restaurants').delete().eq('id', restaurantId)

  revalidatePath('/')
  redirect('/')
}

export async function toggleVisited(restaurantId: string, visited: boolean) {
  'use server'
  const supabase = await createClient()
  await supabase.from('restaurants').update({ visited }).eq('id', restaurantId)
  revalidatePath('/')
  revalidatePath(`/restaurante/${restaurantId}`)
}

export async function rateRestaurant(restaurantId: string, spaceId: string, rating: number) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('ratings')
    .upsert(
      { restaurant_id: restaurantId, user_id: user.id, space_id: spaceId, rating },
      { onConflict: 'restaurant_id,user_id' }
    )

  if (error) return { error: error.message }
  revalidatePath(`/restaurante/${restaurantId}`)
  revalidatePath('/ranking')
  return { error: null }
}

export async function addComment(restaurantId: string, content: string, rating: number | null) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', data: null }

  const { data, error } = await supabase
    .from('comments')
    .insert({ restaurant_id: restaurantId, user_id: user.id, content, rating })
    .select('*, profiles(display_name)')
    .single()

  if (error) return { error: error.message, data: null }

  revalidatePath(`/restaurante/${restaurantId}`)
  return { error: null, data }
}

export async function deleteComment(commentId: string, restaurantId: string) {
  'use server'
  const supabase = await createClient()
  await supabase.from('comments').delete().eq('id', commentId)
  revalidatePath(`/restaurante/${restaurantId}`)
}

export async function createTag(name: string, color: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', data: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) return { error: 'Sin pareja activa', data: null }

  const { data, error } = await supabase
    .from('tags')
    .insert({ name, couple_id: profile.couple_id, color })
    .select()
    .single()

  if (error) return { error: error.message, data: null }
  return { error: null, data }
}
