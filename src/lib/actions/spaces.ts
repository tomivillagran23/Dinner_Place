'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function createSpace(_prevState: { error: string } | null, formData: FormData): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const admin = createAdminClient()
  const name = (formData.get('name') as string)?.trim() || 'Mi espacio'
  const invite_code = generateInviteCode()

  const { data: space, error } = await admin
    .from('couples')
    .insert({ invite_code, name, created_by: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  await admin
    .from('space_members')
    .insert({ space_id: space.id, user_id: user.id })

  const cookieStore = await cookies()
  cookieStore.set('dp_space', space.id, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })

  redirect('/')
}

export async function joinSpace(_prevState: { error: string } | null, formData: FormData): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const admin = createAdminClient()
  const invite_code = (formData.get('invite_code') as string).trim().toUpperCase()

  const { data: space, error } = await admin
    .from('couples')
    .select()
    .eq('invite_code', invite_code)
    .single()

  if (error || !space) return { error: 'Código de invitación inválido' }

  const { data: existing } = await admin
    .from('space_members')
    .select()
    .eq('space_id', space.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) {
    await admin
      .from('space_members')
      .insert({ space_id: space.id, user_id: user.id })
  }

  const cookieStore = await cookies()
  cookieStore.set('dp_space', space.id, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })

  redirect('/')
}

export async function switchSpace(spaceId: string) {
  const cookieStore = await cookies()
  cookieStore.set('dp_space', spaceId, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })
  redirect('/')
}

export async function removeMember(spaceId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const admin = createAdminClient()
  const { data: space } = await admin
    .from('couples')
    .select('created_by')
    .eq('id', spaceId)
    .single()

  if (space?.created_by !== user.id) return

  await admin
    .from('space_members')
    .delete()
    .eq('space_id', spaceId)
    .eq('user_id', userId)

  revalidatePath('/espacio')
}

export async function leaveSpace(spaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const admin = createAdminClient()
  await admin
    .from('space_members')
    .delete()
    .eq('space_id', spaceId)
    .eq('user_id', user.id)

  const cookieStore = await cookies()
  cookieStore.delete('dp_space')
  redirect('/espacios')
}
