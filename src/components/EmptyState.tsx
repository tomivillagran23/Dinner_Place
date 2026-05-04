import Link from 'next/link'

interface Props {
  title: string
  description: string
  showAdd?: boolean
}

export default function EmptyState({ title, description, showAdd }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-60">
        <circle cx="60" cy="60" r="50" fill="rgba(255,77,77,0.08)" stroke="rgba(255,77,77,0.15)" strokeWidth="1.5"/>
        <path d="M38 45C38 43.343 39.343 42 41 42H79C80.657 42 82 43.343 82 45V72C82 73.657 80.657 75 79 75H41C39.343 75 38 73.657 38 72V45Z" fill="rgba(255,77,77,0.1)" stroke="rgba(255,77,77,0.3)" strokeWidth="1.5"/>
        <path d="M50 55L56 61L70 47" stroke="#FF4D4D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <path d="M48 65H72" stroke="rgba(255,77,77,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M48 70H65" stroke="rgba(255,77,77,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="85" cy="35" r="8" fill="rgba(255,77,77,0.15)" stroke="rgba(255,77,77,0.3)" strokeWidth="1.5"/>
        <path d="M85 31V35L88 37" stroke="#FF4D4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        <path d="M35 85C35 85 40 80 50 82C60 84 65 78 75 80C82 81.5 85 85 85 85" stroke="rgba(255,77,77,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#737373] mb-6">{description}</p>
      {showAdd && (
        <Link
          href="/agregar"
          className="px-6 py-2.5 bg-[#FF4D4D] hover:bg-[#FF3333] text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
        >
          Agregar restaurante
        </Link>
      )}
    </div>
  )
}
