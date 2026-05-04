'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { Restaurant, Tag } from '@/lib/types'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

interface Props {
  restaurants: (Restaurant & { tags?: Tag[] })[]
  tags: Tag[]
}

export default function MapaClient({ restaurants, tags }: Props) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const filtered = selectedTag
    ? restaurants.filter(r => r.tags?.some(t => t.id === selectedTag))
    : restaurants

  return (
    <div className="relative h-[calc(100vh-7rem)]">
      {/* Tag chips */}
      <div className="absolute top-3 left-0 right-0 z-10 px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedTag(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border glass ${
              !selectedTag
                ? 'bg-[rgba(255,77,77,0.2)] text-[#FF4D4D] border-[rgba(255,77,77,0.3)]'
                : 'text-[#737373] border-[rgba(255,255,255,0.08)]'
            }`}
          >
            Todos
          </button>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
              style={{
                borderColor: selectedTag === tag.id ? tag.color : undefined,
                color: selectedTag === tag.id ? tag.color : undefined,
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border glass ${
                selectedTag === tag.id
                  ? ''
                  : 'text-[#737373] border-[rgba(255,255,255,0.08)]'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <MapView restaurants={filtered} />
    </div>
  )
}
