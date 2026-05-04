import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveSpaceId } from '@/lib/space'
import RestaurantForm from '@/components/RestaurantForm'
import { createRestaurant } from '@/lib/actions/restaurants'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function AgregarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const spaceId = await getActiveSpaceId()
  if (!spaceId) redirect('/espacios')

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .eq('couple_id', spaceId)

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="w-9 h-9 rounded-xl bg-[#141414] flex items-center justify-center hover:bg-[#1E1E1E] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Agregar restaurante</h1>
      </div>
      <RestaurantForm allTags={tags ?? []} onSubmit={createRestaurant} />
    </div>
  )
}
