'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import RestaurantCard from '@/components/RestaurantCard'
import type { Restaurant, Tag } from '@/lib/types'
import EmptyState from '@/components/EmptyState'

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
        <Link
          href="/agregar"
          className="flex items-center gap-2 bg-[#FF4D4D] hover:bg-[#FF3333] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 coral-glow"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </Link>
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
