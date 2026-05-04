'use client'

import { useActionState } from 'react'
import { signIn } from '@/lib/actions/auth'
import Link from 'next/link'
import { Heart, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0A0A0A]">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-7 h-7 text-[#FF4D4D] fill-[#FF4D4D]" />
            <span className="text-2xl font-bold tracking-tight">ForkDate</span>
          </div>
          <p className="text-[#737373] text-sm">Tu wishlist de restaurantes en pareja</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-6">Iniciar sesión</h1>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm text-[#737373] mb-1.5" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="tu@email.com"
                className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] focus:ring-1 focus:ring-[#FF4D4D] transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-[#737373] mb-1.5" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] focus:ring-1 focus:ring-[#FF4D4D] transition-all text-sm"
              />
            </div>

            {state?.error && (
              <p className="text-[#FF4D4D] text-sm bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] rounded-xl px-3 py-2">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 rounded-xl bg-[#FF4D4D] hover:bg-[#FF3333] text-white font-semibold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Entrar
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#737373] mt-4">
          ¿Sin cuenta?{' '}
          <Link href="/register" className="text-[#FF4D4D] hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
