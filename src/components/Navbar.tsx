'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UtensilsCrossed, Home, Map, LogOut, Copy, Check, ChevronDown, Users } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { switchSpace } from '@/lib/actions/spaces'
import { useState } from 'react'
import { toast } from 'sonner'

interface Space { id: string; name: string; invite_code: string }

interface Props {
  profile: { display_name: string | null; avatar_url: string | null; email?: string | null } | null
  space: Space | null
  userSpaces: Space[]
}

export default function Navbar({ profile, space, userSpaces }: Props) {
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSpaceMenu, setShowSpaceMenu] = useState(false)

  const displayName = profile?.display_name ?? profile?.email?.split('@')[0] ?? 'Usuario'
  const initial = displayName[0]?.toUpperCase() ?? '?'

  function copyCode() {
    if (space?.invite_code) {
      navigator.clipboard.writeText(space.invite_code)
      setCopied(true)
      toast.success('Código copiado')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const navLinks = [
    { href: '/', icon: Home, label: 'Lista' },
    { href: '/mapa', icon: Map, label: 'Mapa' },
    { href: '/espacio', icon: Users, label: 'Espacio' },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-[#FF4D4D]" />
            <span className="font-bold text-lg tracking-tight">DinnerPlace</span>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            {/* Space switcher */}
            {space && (
              <div className="relative">
                <button
                  onClick={() => { setShowSpaceMenu(v => !v); setShowUserMenu(false) }}
                  className="flex items-center gap-1.5 text-xs bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] px-3 py-1.5 rounded-full hover:border-[rgba(255,255,255,0.2)] transition-colors max-w-[140px]"
                >
                  <span className="truncate font-medium">{space.name}</span>
                  <ChevronDown className="w-3 h-3 text-[#737373] flex-shrink-0" />
                </button>

                {showSpaceMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSpaceMenu(false)} />
                    <div className="absolute right-0 top-10 z-20 glass rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden min-w-[200px] animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)]">
                        <p className="text-xs text-[#737373]">Espacio activo</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-semibold flex-1 truncate">{space.name}</p>
                          <button onClick={copyCode} className="text-[#737373] hover:text-[#FF4D4D] transition-colors">
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-xs font-mono text-[#4A4A4A] mt-0.5">{space.invite_code}</p>
                      </div>

                      {userSpaces.filter(s => s.id !== space.id).length > 0 && (
                        <div className="border-b border-[rgba(255,255,255,0.06)]">
                          <p className="text-xs text-[#4A4A4A] px-4 pt-2 pb-1">Cambiar a</p>
                          {userSpaces
                            .filter(s => s.id !== space.id)
                            .map(s => (
                              <form key={s.id} action={switchSpace.bind(null, s.id)}>
                                <button
                                  type="submit"
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors truncate"
                                >
                                  {s.name}
                                </button>
                              </form>
                            ))
                          }
                        </div>
                      )}

                      <Link
                        href="/espacios"
                        onClick={() => setShowSpaceMenu(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-[#737373] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      >
                        Gestionar espacios
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* User avatar */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(v => !v); setShowSpaceMenu(false) }}
                className="w-8 h-8 rounded-full bg-[rgba(255,77,77,0.15)] flex items-center justify-center text-sm font-semibold text-[#FF4D4D] hover:bg-[rgba(255,77,77,0.25)] transition-colors flex-shrink-0"
              >
                {initial}
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-10 z-20 glass rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden min-w-[160px] animate-fade-in">
                    <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                      <p className="text-sm font-semibold">{displayName}</p>
                    </div>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#737373] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-2xl mx-auto flex">
          {navLinks.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs transition-colors ${
                  active ? 'text-[#FF4D4D]' : 'text-[#737373] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
