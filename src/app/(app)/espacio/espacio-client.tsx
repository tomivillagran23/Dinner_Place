'use client'

import { useState } from 'react'
import { Copy, Check, Crown, UserX, LogOut, Users, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { removeMember, leaveSpace, renameSpace } from '@/lib/actions/spaces'
import Link from 'next/link'

interface Member {
  user_id: string
  joined_at: string
  display_name: string | null
  email: string | null
}

interface Space {
  id: string
  name: string
  invite_code: string
  created_by: string | null
}

interface Props {
  space: Space
  members: Member[]
  currentUserId: string
  isAdmin: boolean
}

export default function EspacioClient({ space, members, currentUserId, isAdmin }: Props) {
  const [copied, setCopied] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [showLeave, setShowLeave] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(space.name)
  const [savingName, setSavingName] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(space.invite_code)
    setCopied(true)
    toast.success('Código copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRemove(userId: string, name: string) {
    setRemoving(userId)
    await removeMember(space.id, userId)
    toast.success(`${name} eliminado del espacio`)
    setRemoving(null)
  }

  async function handleLeave() {
    await leaveSpace(space.id)
  }

  async function handleSaveName() {
    if (!nameValue.trim() || nameValue === space.name) { setEditingName(false); return }
    setSavingName(true)
    const result = await renameSpace(space.id, nameValue)
    if (result?.error) {
      toast.error('Error al renombrar')
    } else {
      toast.success('Nombre actualizado')
      setEditingName(false)
    }
    setSavingName(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in space-y-6">
      {/* Space info */}
      <div>
        <h1 className="text-xl font-bold mb-4">Tu espacio</h1>
        <div className="glass rounded-2xl p-5 border border-[rgba(255,255,255,0.06)] space-y-4">
          <div>
            <p className="text-xs text-[#737373] mb-1">Nombre</p>
            {isAdmin && editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                  autoFocus
                  className="flex-1 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,77,77,0.4)] rounded-xl px-3 py-1.5 text-base font-semibold focus:outline-none"
                />
                <button onClick={handleSaveName} disabled={savingName} className="px-3 py-1.5 rounded-xl bg-[#FF4D4D] text-white text-xs font-semibold disabled:opacity-50">
                  {savingName ? '...' : 'Guardar'}
                </button>
                <button onClick={() => { setEditingName(false); setNameValue(space.name) }} className="text-[#737373] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-semibold text-lg">{nameValue}</p>
                {isAdmin && (
                  <button onClick={() => setEditingName(true)} className="text-[#4A4A4A] hover:text-[#FF4D4D] transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-[#737373] mb-1">Código de invitación</p>
            <div className="flex items-center gap-3">
              <p className="font-mono text-2xl font-bold tracking-widest text-[#FF4D4D]">{space.invite_code}</p>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-xs text-[#737373] hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#4DFF91]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs text-[#4A4A4A] mt-1">Compartí este código para que otros se unan</p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-[#737373]" />
          <h2 className="font-semibold text-sm text-[#737373] uppercase tracking-wider">
            Miembros · {members.length}
          </h2>
        </div>

        <div className="space-y-2">
          {members.map(member => {
            const name = member.display_name ?? member.email?.split('@')[0] ?? 'Usuario'
            const isCreator = space.created_by === member.user_id
            const isMe = member.user_id === currentUserId

            return (
              <div
                key={member.user_id}
                className="glass rounded-xl px-4 py-3 border border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[rgba(255,77,77,0.15)] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#FF4D4D]">{name[0].toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{name}{isMe && ' (vos)'}</p>
                      {isCreator && <Crown className="w-3.5 h-3.5 text-[#FFD700] flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-[#4A4A4A]">
                      Unido {new Date(member.joined_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {isAdmin && !isMe && !isCreator && (
                  <button
                    onClick={() => handleRemove(member.user_id, name)}
                    disabled={removing === member.user_id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#737373] hover:text-[#FF4D4D] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,77,77,0.3)] transition-all disabled:opacity-40"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Link
          href="/espacios"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[rgba(255,255,255,0.08)] text-sm text-[#737373] hover:text-white transition-colors"
        >
          Cambiar de espacio
        </Link>

        {!isAdmin && (
          <button
            onClick={() => setShowLeave(true)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[rgba(255,77,77,0.2)] text-sm text-[#FF4D4D] hover:bg-[rgba(255,77,77,0.1)] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Abandonar espacio
          </button>
        )}
      </div>

      {/* Leave modal */}
      {showLeave && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLeave(false)} />
          <div className="relative w-full max-w-sm glass-strong rounded-2xl p-6 space-y-4 animate-slide-up">
            <h3 className="font-semibold text-lg">¿Abandonar el espacio?</h3>
            <p className="text-sm text-[#737373]">Ya no podrás ver los restaurantes de <span className="text-white font-medium">{space.name}</span>.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeave(false)} className="flex-1 py-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] text-sm font-medium">Cancelar</button>
              <button onClick={handleLeave} className="flex-1 py-2.5 rounded-xl bg-[#FF4D4D] hover:bg-[#FF3333] text-white text-sm font-semibold transition-all">Abandonar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
