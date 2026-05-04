'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import { Star, ExternalLink } from 'lucide-react'
import type { Restaurant, Tag } from '@/lib/types'
import 'leaflet/dist/leaflet.css'

function createPin(visited: boolean, pinColor?: string | null) {
  const color = visited ? '#4DFF91' : (pinColor ?? '#FF4D4D')
  const svg = `
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="37" rx="6" ry="3" fill="rgba(0,0,0,0.3)"/>
      <path d="M16 0C9.373 0 4 5.373 4 12C4 21 16 36 16 36C16 36 28 21 28 12C28 5.373 22.627 0 16 0Z" fill="${color}"/>
      <circle cx="16" cy="12" r="5" fill="white" fill-opacity="0.9"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}

function FitBounds({ restaurants }: { restaurants: Restaurant[] }) {
  const map = useMap()

  useEffect(() => {
    if (restaurants.length === 0) return
    const valid = restaurants.filter(r => r.latitude && r.longitude)
    if (valid.length === 0) return

    if (valid.length === 1) {
      map.setView([valid[0].latitude!, valid[0].longitude!], 14)
      return
    }

    const bounds = L.latLngBounds(valid.map(r => [r.latitude!, r.longitude!]))
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [restaurants, map])

  return null
}

interface Props {
  restaurants: (Restaurant & { tags?: Tag[] })[]
}

export default function MapView({ restaurants }: Props) {
  const defaultCenter: [number, number] = [19.432608, -99.133209]
  const withCoords = restaurants.filter(r => r.latitude && r.longitude)
  const withoutCoords = restaurants.filter(r => !r.latitude || !r.longitude)

  return (
    <>
    {withoutCoords.length > 0 && (
      <div className="absolute bottom-4 left-4 right-4 z-10 glass rounded-xl px-4 py-3 border border-[rgba(255,255,255,0.08)] text-sm text-[#737373]">
        {withoutCoords.length} restaurante{withoutCoords.length > 1 ? 's' : ''} sin ubicación —
        agrégales una URL de Google Maps para que aparezcan aquí
      </div>
    )}
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ height: '100%', width: '100%', background: '#0A0A0A' }}
      className="leaflet-dark"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds restaurants={withCoords} />
      {withCoords.map(restaurant => {
        if (!restaurant.latitude || !restaurant.longitude) return null
        return (
          <Marker
            key={restaurant.id}
            position={[restaurant.latitude, restaurant.longitude]}
            icon={createPin(restaurant.visited, restaurant.pin_color)}
          >
            <Popup
              closeButton={false}
              className="fork-popup"
            >
              <div className="bg-[#141414] rounded-xl overflow-hidden min-w-[200px] border border-[rgba(255,255,255,0.08)]">
                {restaurant.photo_urls?.[0] && (
                  <img
                    src={restaurant.photo_urls[0]}
                    alt={restaurant.name}
                    className="w-full h-24 object-cover"
                  />
                )}
                <div className="p-3">
                  <p className="font-semibold text-white text-sm">{restaurant.name}</p>
                  {restaurant.cuisine_type && (
                    <p className="text-xs text-[#737373] mt-0.5">{restaurant.cuisine_type}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {restaurant.rating !== null && restaurant.rating !== undefined && (
                      <span className="flex items-center gap-0.5 text-xs">
                        <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                        <span className="text-white">{restaurant.rating}</span>
                      </span>
                    )}
                    {restaurant.visited && (
                      <span className="text-xs bg-[rgba(77,255,145,0.15)] text-[#4DFF91] px-2 py-0.5 rounded-full">
                        Visitado
                      </span>
                    )}
                  </div>
                  {restaurant.tags && restaurant.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {restaurant.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag.id}
                          style={{ color: tag.color, borderColor: `${tag.color}40`, backgroundColor: `${tag.color}20` }}
                          className="text-xs border px-2 py-0.5 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/restaurante/${restaurant.id}`}
                    className="mt-3 flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-[#FF4D4D] text-white text-xs font-semibold hover:bg-[#FF3333] transition-colors"
                  >
                    Ver detalle
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
    </>
  )
}
