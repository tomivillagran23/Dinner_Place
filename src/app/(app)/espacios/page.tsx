import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import EspaciosClient from './espacios-client'

export default async function EspaciosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: memberships } = await admin
    .from('space_members')
    .select('space_id, joined_at, couples(id, name, invite_code)')
    .eq('user_id', user.id)

  type SpaceRow = { id: string; name: string; invite_code: string }
  const spaces = (memberships?.map(m => m.couples).filter(Boolean) ?? []) as unknown as SpaceRow[]

  const { data: profile } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return (
    <EspaciosClient
      spaces={spaces}
      displayName={profile?.display_name ?? user.email?.split('@')[0] ?? 'Usuario'}
    />
  )
}
