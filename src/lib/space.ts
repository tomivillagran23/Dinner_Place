import { cookies } from 'next/headers'

export async function getActiveSpaceId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('dp_space')?.value ?? null
}
