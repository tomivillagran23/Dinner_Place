import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { getActiveSpaceId } from '@/lib/space'
import Navbar from '@/components/Navbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('id, display_name, avatar_url, email')
    .eq('id', user.id)
    .single()

  const spaceId = await getActiveSpaceId()
  let space = null
  let userSpaces: { id: string; name: string; invite_code: string }[] = []

  if (spaceId) {
    const [spaceResult, spacesResult] = await Promise.all([
      admin.from('couples').select('id, name, invite_code').eq('id', spaceId).single(),
      admin
        .from('space_members')
        .select('couples(id, name, invite_code)')
        .eq('user_id', user.id),
    ])
    space = spaceResult.data
    userSpaces = (spacesResult.data
      ?.map(m => m.couples)
      .filter(Boolean) ?? []) as unknown as typeof userSpaces
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <Navbar profile={profile} space={space} userSpaces={userSpaces} />
      <main className="flex-1 pb-20 pt-16">
        {children}
      </main>
    </div>
  )
}
