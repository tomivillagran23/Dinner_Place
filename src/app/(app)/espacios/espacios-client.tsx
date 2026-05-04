'use client'

import { useState } from 'react'
import { createSpace, joinSpace, switchSpace } from '@/lib/actions/spaces'
import { UtensilsCrossed, Plus, Users, ArrowRight, Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useActionState } from 'react'

interface Space {
  id: string
  name: string
  invite_code: string
}

interface Props {
  spaces: Space[]
  displayName: string
}

export default function EspaciosClient({ spaces, displayName }: Props) {
  const [mode, setMode] = useState<'list' | 'create' | 'join'>('list')
  const [copied, setCopied] = useState<string | null>(null)
  const [switching, setSwitching] = useState<string | null>(null)

  const [createState, createAction, createPending] = useActionState(createSpace, null)
  const [joinState, joinAction, joinPending] = useActionState(joinSpace, null)

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    toast.success('Código copiado')
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleSwitch(spaceId: string) {
    setSwitching(spaceId)
    await switchSpace(spaceId)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(255,77,77,0.15)] flex items-center justify-center mb-3">
            <UtensilsCrossed className="w-7 h-7 text-[#FF4D4D]" />
          </div>
          <h1 className="text-xl font-bold">Hola, {displayName}</h1>
          <p className="text-sm text-[#737373] mt-1">¿A qué espacio quieres entrar?</p>
        </div>

        {mode === 'list' && (
          <div className="space-y-3 animate-fade-in">
            {spaces.length > 0 && (
              <div className="space-y-2">
                {spaces.map(space => (
                  <div
                    key={space.id}
                    className="glass rounded-2xl p-4 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{space.name}</p>
                        <button
                          onClick={() => copyCode(space.invite_code)}
                          className="flex items-center gap-1 text-xs text-[#737373] hover:text-[#FF4D4D] transition-colors mt-0.5"
                        >
                          {copied === space.invite_code
                            ? <Check className="w-3 h-3" />
                            : <Copy className="w-3 h-3" />
                          }
                          <span className="font-mono">{space.invite_code}</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handleSwitch(space.id)}
                        disabled={switching === space.id}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FF4D4D] hover:bg-[#FF3333] text-white text-sm font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-60 flex-shrink-0"
                      >
                        {switching === space.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <ArrowRight className="w-4 h-4" />
                        }
                        Entrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {spaces.length === 0 && (
              <div className="text-center py-6 text-[#737373] text-sm">
                Aún no tienes espacios. Crea uno o únete.
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => setMode('create')}
                className="flex flex-col items-center gap-2 p-4 glass rounded-2xl border border-[rgba(255,255,255,0.06)] hover:border-[#FF4D4D] transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-[rgba(255,77,77,0.1)] flex items-center justify-center group-hover:bg-[rgba(255,77,77,0.2)] transition-colors">
                  <Plus className="w-5 h-5 text-[#FF4D4D]" />
                </div>
                <span className="text-sm font-medium">Crear espacio</span>
              </button>

              <button
                onClick={() => setMode('join')}
                className="flex flex-col items-center gap-2 p-4 glass rounded-2xl border border-[rgba(255,255,255,0.06)] hover:border-[#FF4D4D] transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-[rgba(255,77,77,0.1)] flex items-center justify-center group-hover:bg-[rgba(255,77,77,0.2)] transition-colors">
                  <Users className="w-5 h-5 text-[#FF4D4D]" />
                </div>
                <span className="text-sm font-medium">Unirse</span>
              </button>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="glass rounded-2xl p-6 space-y-4 animate-slide-up">
            <button onClick={() => setMode('list')} className="text-sm text-[#737373] hover:text-white transition-colors">
              ← Volver
            </button>
            <h2 className="font-semibold text-lg">Crear espacio</h2>
            <form action={createAction} className="space-y-4">
              <div>
                <label className="block text-sm text-[#737373] mb-1.5">Nombre del espacio</label>
                <input
                  name="name"
                  required
                  placeholder="Ej: Con mi novia, Los amigos..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] transition-all text-sm"
                />
              </div>
              {createState?.error && (
                <p className="text-[#FF4D4D] text-sm bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] rounded-xl px-3 py-2">
                  {createState.error}
                </p>
              )}
              <button
                type="submit"
                disabled={createPending}
                className="w-full py-2.5 rounded-xl bg-[#FF4D4D] hover:bg-[#FF3333] text-white font-semibold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {createPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear
              </button>
            </form>
          </div>
        )}

        {mode === 'join' && (
          <div className="glass rounded-2xl p-6 space-y-4 animate-slide-up">
            <button onClick={() => setMode('list')} className="text-sm text-[#737373] hover:text-white transition-colors">
              ← Volver
            </button>
            <h2 className="font-semibold text-lg">Unirse con código</h2>
            <form action={joinAction} className="space-y-4">
              <input
                name="invite_code"
                required
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] transition-all text-sm uppercase tracking-widest text-center font-mono text-lg"
              />
              {joinState?.error && (
                <p className="text-[#FF4D4D] text-sm bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] rounded-xl px-3 py-2">
                  {joinState.error}
                </p>
              )}
              <button
                type="submit"
                disabled={joinPending}
                className="w-full py-2.5 rounded-xl bg-[#FF4D4D] hover:bg-[#FF3333] text-white font-semibold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {joinPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Unirme
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
