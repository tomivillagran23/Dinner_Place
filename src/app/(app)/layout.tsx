import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, couple_id, email')
    .eq('id', user.id)
    .single()

  let couple = null
  if (profile?.couple_id) {
    const { data } = await supabase
      .from('couples')
      .select('invite_code')
      .eq('id', profile.couple_id)
      .single()
    couple = data
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <Navbar profile={profile} couple={couple} />
      <main className="flex-1 pb-20 pt-16">
        {children}
      </main>
    </div>
  )
}
