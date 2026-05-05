'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, X, Shuffle, Star, MapPin, ChevronRight } from 'lucide-react'
import RestaurantCard from '@/components/RestaurantCard'
import type { Restaurant, Tag } from '@/lib/types'
import EmptyState from '@/components/EmptyState'

const PRICE_LABELS: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$' }

interface Props {
  restaurants: (Restaurant & { tags?: Tag[] })[]
  tags: Tag[]
}

const PRICE_OPTIONS = [
  { value: '1', label: '$' },
  { value: '2', label: '$$' },
  { value: '3', label: '$$$' },
]

export default function HomeClient({ restaurants, tags }: Props) {
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null)
  const [visitedFilter, setVisitedFilter] = useState<'all' | 'visited' | 'pending'>('all')
  const [surprise, setSurprise] = useState<(Restaurant & { tags?: Tag[] }) | null>(null)

  const pending = useMemo(() => restaurants.filter(r => !r.visited), [restaurants])

  function pickSurprise() {
    if (pending.length === 0) return
    const pick = pending[Math.floor(Math.random() * pending.length)]
    setSurprise(pick)
  }

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
      if (selectedTag && !r.tags?.some(t => t.id === selectedTag)) return false
      if (selectedPrice && String(r.price_level) !== selectedPrice) return false
      if (visitedFilter === 'visited' && !r.visited) return false
      if (visitedFilter === 'pending' && r.visited) return false
      return true
    })
  }, [restaurants, search, selectedTag, selectedPrice, visitedFilter])

  const hasFilters = search || selectedTag || selectedPrice || visitedFilter !== 'all'

  function clearFilters() {
    setSearch('')
    setSelectedTag(null)
    setSelectedPrice(null)
    setVisitedFilter('all')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Lista de restaurantes</h1>
          <p className="text-xs text-[#737373] mt-0.5">
            {restaurants.length} guardados · {restaurants.filter(r => r.visited).length} visitados
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <button
              onClick={pickSurprise}
              className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#222] border border-[rgba(255,255,255,0.08)] text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              title="Elegir al azar"
            >
              <Shuffle className="w-4 h-4 text-[#FF4D4D]" />
            </button>
          )}
          <Link
            href="/agregar"
            className="flex items-center gap-2 bg-[#FF4D4D] hover:bg-[#FF3333] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 coral-glow"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A4A]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar restaurante..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-all text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-4">
        {/* Visited filter */}
        {(['all', 'pending', 'visited'] as const).map(v => (
          <button
            key={v}
            onClick={() => setVisitedFilter(v)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              visitedFilter === v
                ? 'bg-[rgba(255,77,77,0.2)] text-[#FF4D4D] border-[rgba(255,77,77,0.3)]'
                : 'bg-transparent text-[#737373] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]'
            }`}
          >
            {v === 'all' ? 'Todos' : v === 'visited' ? 'Visitados' : 'Pendientes'}
          </button>
        ))}

        <div className="w-px bg-[rgba(255,255,255,0.08)] flex-shrink-0 my-1" />

        {/* Price filter */}
        {PRICE_OPTIONS.map(p => (
          <button
            key={p.value}
            onClick={() => setSelectedPrice(selectedPrice === p.value ? null : p.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              selectedPrice === p.value
                ? 'bg-[rgba(255,77,77,0.2)] text-[#FF4D4D] border-[rgba(255,77,77,0.3)]'
                : 'bg-transparent text-[#737373] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]'
            }`}
          >
            {p.label}
          </button>
        ))}

        {/* Tag filters */}
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
            style={{ borderColor: selectedTag === tag.id ? tag.color : undefined, color: selectedTag === tag.id ? tag.color : undefined }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              selectedTag === tag.id
                ? ''
                : 'bg-transparent text-[#737373] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]'
            }`}
          >
            {tag.name}
          </button>
        ))}

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-[rgba(255,255,255,0.08)] text-[#737373] hover:text-white"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Modal sorpresa */}
      {surprise && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSurprise(null)}
        >
          <div
            className="w-full max-w-sm bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {surprise.photo_urls?.[0] ? (
              <img src={surprise.photo_urls[0]} alt={surprise.name} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-24 bg-[rgba(255,77,77,0.1)] flex items-center justify-center">
                <Shuffle className="w-8 h-8 text-[#FF4D4D] opacity-40" />
              </div>
            )}

            <div className="p-5">
              <p className="text-xs text-[#FF4D4D] font-semibold uppercase tracking-wider mb-1">Tu próximo lugar</p>
              <h2 className="text-xl font-bold text-white mb-1">{surprise.name}</h2>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                {surprise.cuisine_type && <span className="text-sm text-[#737373]">{surprise.cuisine_type}</span>}
                {surprise.neighborhood && (
                  <span className="text-sm text-[#737373] flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{surprise.neighborhood}
                  </span>
                )}
                {surprise.price_level && (
                  <span className="text-sm text-[#737373] font-medium">{PRICE_LABELS[surprise.price_level]}</span>
                )}
                {surprise.rating && (
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                    <span className="text-white font-medium">{surprise.rating}</span>
                  </span>
                )}
              </div>

              {surprise.notes && (
                <p className="text-sm text-[#737373] mb-4 line-clamp-2">{surprise.notes}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={pickSurprise}
                  className="flex-1 py-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] text-sm font-semibold text-[#737373] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  Otra vez
                </button>
                <Link
                  href={`/restaurante/${surprise.id}`}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF4D4D] hover:bg-[#FF3333] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  Ver más
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'Sin resultados' : 'Sin restaurantes aún'}
          description={
            hasFilters
              ? 'Prueba con otros filtros'
              : '¡Agrega el primer restaurante a tu wishlist!'
          }
          showAdd={!hasFilters}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  )
}
