import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import RestaurantForm from '@/components/RestaurantForm'
import { updateRestaurant } from '@/lib/actions/restaurants'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) redirect('/onboarding')

  const [restaurantResult, tagsResult] = await Promise.all([
    supabase
      .from('restaurants')
      .select(`*, tags:restaurant_tags(tag:tags(*))`)
      .eq('id', id)
      .eq('couple_id', profile.couple_id)
      .single(),
    supabase
      .from('tags')
      .select('*')
      .eq('couple_id', profile.couple_id),
  ])

  if (!restaurantResult.data) notFound()

  const restaurant = {
    ...restaurantResult.data,
    tags: restaurantResult.data.tags?.map((rt: { tag: unknown }) => rt.tag).filter(Boolean) ?? [],
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    return updateRestaurant(id, formData)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/restaurante/${id}`} className="w-9 h-9 rounded-xl bg-[#141414] flex items-center justify-center hover:bg-[#1E1E1E] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Editar restaurante</h1>
      </div>

      <RestaurantForm restaurant={restaurant} allTags={tagsResult.data ?? []} onSubmit={handleUpdate} />
    </div>
  )
}
