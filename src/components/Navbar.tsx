'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Home, Map, LogOut, Copy, Check, Settings } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  profile: { display_name: string | null; avatar_url: string | null; couple_id: string | null; email?: string | null } | null
  couple: { invite_code: string } | null
}

export default function Navbar({ profile, couple }: Props) {
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  function copyCode() {
    if (couple?.invite_code) {
      navigator.clipboard.writeText(couple.invite_code)
      setCopied(true)
      toast.success('Código copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const navLinks = [
    { href: '/', icon: Home, label: 'Lista' },
    { href: '/mapa', icon: Map, label: 'Mapa' },
  ]

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#FF4D4D] fill-[#FF4D4D]" />
            <span className="font-bold text-lg tracking-tight">ForkDate</span>
          </Link>

          <div className="flex items-center gap-3">
            {couple && (
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 text-xs bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] text-[#FF4D4D] px-3 py-1.5 rounded-full hover:bg-[rgba(255,77,77,0.2)] transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span className="font-mono font-semibold">{couple.invite_code}</span>
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowMenu(v => !v)}
                className="w-8 h-8 rounded-full bg-[rgba(255,77,77,0.15)] flex items-center justify-center text-sm font-semibold text-[#FF4D4D] hover:bg-[rgba(255,77,77,0.25)] transition-colors"
              >
                {(profile?.display_name ?? profile?.email)?.[0]?.toUpperCase() ?? '?'}
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-10 z-20 glass rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden min-w-[160px] animate-fade-in">
                    <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                      <p className="text-sm font-semibold">{profile?.display_name ?? profile?.email?.split('@')[0] ?? 'Usuario'}</p>
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
                <Icon className={`w-5 h-5 ${active ? 'fill-[rgba(255,77,77,0.15)]' : ''}`} strokeWidth={active ? 2.5 : 1.5} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
