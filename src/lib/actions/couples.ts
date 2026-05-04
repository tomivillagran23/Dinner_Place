'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function createCouple() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const admin = createAdminClient()
  const invite_code = generateInviteCode()

  const { data: couple, error } = await admin
    .from('couples')
    .insert({ invite_code })
    .select()
    .single()

  if (error) return { error: error.message }

  await admin
    .from('profiles')
    .update({ couple_id: couple.id })
    .eq('id', user.id)

  redirect('/')
}

export async function joinCouple(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const admin = createAdminClient()
  const invite_code = (formData.get('invite_code') as string).trim().toUpperCase()

  const { data: couple, error } = await admin
    .from('couples')
    .select()
    .eq('invite_code', invite_code)
    .single()

  if (error || !couple) return { error: 'Código de invitación inválido' }

  await admin
    .from('profiles')
    .update({ couple_id: couple.id })
    .eq('id', user.id)

  redirect('/')
}
