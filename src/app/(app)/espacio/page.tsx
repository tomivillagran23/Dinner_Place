import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { getActiveSpaceId } from '@/lib/space'
import EspacioClient from './espacio-client'

export default async function EspacioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const spaceId = await getActiveSpaceId()
  if (!spaceId) redirect('/espacios')

  const admin = createAdminClient()

  const [spaceResult, membersResult] = await Promise.all([
    admin.from('couples').select('id, name, invite_code, created_by').eq('id', spaceId).single(),
    admin
      .from('space_members')
      .select('user_id, joined_at, profiles(display_name, email)')
      .eq('space_id', spaceId),
  ])

  const space = spaceResult.data
  if (!space) redirect('/espacios')

  const members = (membersResult.data ?? []).map(m => {
    const profile = m.profiles as unknown as { display_name: string | null; email: string | null } | null
    return {
      user_id: m.user_id,
      joined_at: m.joined_at,
      display_name: profile?.display_name ?? null,
      email: profile?.email ?? null,
    }
  })

  return (
    <EspacioClient
      space={space}
      members={members}
      currentUserId={user.id}
      isAdmin={space.created_by === user.id}
    />
  )
}
