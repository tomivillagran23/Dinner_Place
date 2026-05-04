import Link from 'next/link'
import { MapPin, Star, Clock, ChevronRight } from 'lucide-react'
import type { Restaurant, Tag } from '@/lib/types'

interface Props {
  restaurant: Restaurant & { tags?: Tag[] }
}

const PRICE_LABELS: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$' }

const TAG_COLORS: Record<string, string> = {
  '#FF4D4D': 'bg-[rgba(255,77,77,0.15)] text-[#FF4D4D] border-[rgba(255,77,77,0.2)]',
  '#4D9FFF': 'bg-[rgba(77,159,255,0.15)] text-[#4D9FFF] border-[rgba(77,159,255,0.2)]',
  '#4DFF91': 'bg-[rgba(77,255,145,0.15)] text-[#4DFF91] border-[rgba(77,255,145,0.2)]',
  '#FFD700': 'bg-[rgba(255,215,0,0.15)] text-[#FFD700] border-[rgba(255,215,0,0.2)]',
  '#C77DFF': 'bg-[rgba(199,125,255,0.15)] text-[#C77DFF] border-[rgba(199,125,255,0.2)]',
  '#FF914D': 'bg-[rgba(255,145,77,0.15)] text-[#FF914D] border-[rgba(255,145,77,0.2)]',
}

function getTagStyle(color: string) {
  return TAG_COLORS[color] ?? 'bg-[rgba(255,255,255,0.08)] text-[#737373] border-[rgba(255,255,255,0.1)]'
}

export default function RestaurantCard({ restaurant }: Props) {
  const hasPhoto = restaurant.photo_urls && restaurant.photo_urls.length > 0
  const mainPhoto = hasPhoto ? restaurant.photo_urls[0] : null

  return (
    <Link
      href={`/restaurante/${restaurant.id}`}
      className="block glass rounded-2xl overflow-hidden card-hover border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] transition-all"
    >
      <div className="flex gap-4 p-4">
        {/* Photo */}
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#1E1E1E]">
          {mainPhoto ? (
            <img
              src={mainPhoto}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <RestaurantPlaceholder />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white truncate">{restaurant.name}</h3>
            <ChevronRight className="w-4 h-4 text-[#4A4A4A] flex-shrink-0 mt-0.5" />
          </div>

          {restaurant.profiles?.display_name && (
            <p className="text-[10px] text-[#4A4A4A] mt-0.5">
              por {restaurant.profiles.display_name}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {restaurant.cuisine_type && (
              <span className="text-xs text-[#737373]">{restaurant.cuisine_type}</span>
            )}
            {restaurant.cuisine_type && restaurant.neighborhood && (
              <span className="text-[#4A4A4A] text-xs">·</span>
            )}
            {restaurant.neighborhood && (
              <span className="text-xs text-[#737373] flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {restaurant.neighborhood}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {restaurant.rating !== null && (
              <span className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                <span className="text-white font-medium">{restaurant.rating}</span>
              </span>
            )}
            {restaurant.price_level && (
              <span className="text-xs text-[#737373] font-medium">
                {PRICE_LABELS[restaurant.price_level]}
              </span>
            )}
            {restaurant.visited && (
              <span className="text-xs bg-[rgba(77,255,145,0.15)] text-[#4DFF91] border border-[rgba(77,255,145,0.2)] px-2 py-0.5 rounded-full font-medium">
                Visitado
              </span>
            )}
          </div>

          {restaurant.tags && restaurant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {restaurant.tags.slice(0, 3).map(tag => (
                <span
                  key={tag.id}
                  className={`text-xs border px-2 py-0.5 rounded-full ${getTagStyle(tag.color)}`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function RestaurantPlaceholder() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6C8 5.448 8.448 5 9 5C9.552 5 10 5.448 10 6V14C10 15.105 10.895 16 12 16C13.105 16 14 15.105 14 14V6C14 5.448 14.448 5 15 5C15.552 5 16 5.448 16 6V14C16 16.209 14.209 18 12 18V27C12 27.552 11.552 28 11 28C10.448 28 10 27.552 10 27V18C7.791 18 6 16.209 6 14V6C6 5.448 6.448 5 7 5C7.552 5 8 5.448 8 6V14H10V6Z" fill="#4A4A4A"/>
      <path d="M20 5C19.448 5 19 5.448 19 6V13.764C19 15.547 20.099 17.149 21.764 17.836L22 17.93V27C22 27.552 22.448 28 23 28C23.552 28 24 27.552 24 27V6C24 5.448 23.552 5 23 5C22.448 5 22 5.448 22 6V15.756C21.4 15.24 21 14.552 21 13.764V6C21 5.448 20.552 5 20 5Z" fill="#4A4A4A"/>
    </svg>
  )
}
