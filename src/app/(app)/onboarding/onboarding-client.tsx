'use client'

import { useState } from 'react'
import { createCouple, joinCouple } from '@/lib/actions/couples'
import { Heart, Plus, Users, Loader2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  displayName: string | null | undefined
}

export default function OnboardingClient({ displayName }: Props) {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCreate() {
    setLoading(true)
    setError(null)
    const result = await createCouple()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleJoin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await joinCouple(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  function copyCode() {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode)
      setCopied(true)
      toast.success('Código copiado')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0A0A0A]">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(255,77,77,0.15)] flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-[#FF4D4D] fill-[#FF4D4D]" />
          </div>
          <h1 className="text-2xl font-bold">
            Hola, {displayName || 'ahí'} 👋
          </h1>
          <p className="text-[#737373] text-sm mt-2 text-center">
            Crea un espacio para tu pareja o únete al de ella
          </p>
        </div>

        {mode === 'choose' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full glass rounded-2xl p-5 text-left hover:border-[#FF4D4D] transition-all group border border-[rgba(255,255,255,0.08)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(255,77,77,0.15)] flex items-center justify-center group-hover:bg-[rgba(255,77,77,0.25)] transition-colors">
                  <Plus className="w-5 h-5 text-[#FF4D4D]" />
                </div>
                <div>
                  <p className="font-semibold">Crear espacio</p>
                  <p className="text-sm text-[#737373]">Genera un código de invitación</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full glass rounded-2xl p-5 text-left hover:border-[#FF4D4D] transition-all group border border-[rgba(255,255,255,0.08)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(255,77,77,0.15)] flex items-center justify-center group-hover:bg-[rgba(255,77,77,0.25)] transition-colors">
                  <Users className="w-5 h-5 text-[#FF4D4D]" />
                </div>
                <div>
                  <p className="font-semibold">Unirse con código</p>
                  <p className="text-sm text-[#737373]">Tu pareja ya creó un espacio</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <button onClick={() => setMode('choose')} className="text-sm text-[#737373] hover:text-white transition-colors">
              ← Volver
            </button>
            <h2 className="font-semibold text-lg">Crear espacio de pareja</h2>
            <p className="text-sm text-[#737373]">
              Se generará un código único que puedes compartir con tu pareja.
            </p>
            {error && (
              <p className="text-[#FF4D4D] text-sm bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#FF4D4D] hover:bg-[#FF3333] text-white font-semibold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear mi espacio
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <button onClick={() => setMode('choose')} className="text-sm text-[#737373] hover:text-white transition-colors">
              ← Volver
            </button>
            <h2 className="font-semibold text-lg">Unirse con código</h2>
            <form onSubmit={handleJoin} className="space-y-4">
              <input
                name="invite_code"
                type="text"
                required
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] focus:ring-1 focus:ring-[#FF4D4D] transition-all text-sm uppercase tracking-widest text-center font-mono text-lg"
              />
              {error && (
                <p className="text-[#FF4D4D] text-sm bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] rounded-xl px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#FF4D4D] hover:bg-[#FF3333] text-white font-semibold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Unirme
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
