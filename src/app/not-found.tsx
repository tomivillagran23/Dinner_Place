import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0A0A0A]">
      <Heart className="w-12 h-12 text-[#FF4D4D] fill-[#FF4D4D] mb-4 opacity-40" />
      <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
      <p className="text-[#737373] text-sm mb-6">Esta página no existe</p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-[#FF4D4D] hover:bg-[#FF3333] text-white text-sm font-semibold rounded-xl transition-all"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
