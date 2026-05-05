'use client'

import { useState, useRef, useEffect } from 'react'
import { Star, Plus, X, Loader2, Upload, Search, MapPin } from 'lucide-react'
import type { Restaurant, Tag } from '@/lib/types'
import { createTag } from '@/lib/actions/restaurants'
import { toast } from 'sonner'

interface NominatimPlace {
  place_id: string
  display_name: string
  lat: string
  lon: string
  address?: {
    amenity?: string
    restaurant?: string
    road?: string
    suburb?: string
    neighbourhood?: string
    city?: string
    town?: string
    village?: string
  }
}

interface Props {
  restaurant?: Restaurant & { tags?: Tag[] }
  allTags: Tag[]
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>
}

const CUISINE_OPTIONS = [
  'Italiana', 'Japonesa', 'Mexicana', 'China', 'Francesa', 'Mediterránea',
  'Americana', 'Española', 'Peruana', 'Thai', 'India', 'Griega', 'Árabe',
  'Fusión', 'Mariscos', 'Carnes', 'Vegetariana', 'Otro',
]

const TAG_COLOR_OPTIONS = [
  '#FF4D4D', '#4D9FFF', '#4DFF91', '#FFD700', '#C77DFF', '#FF914D',
]

const PIN_COLOR_OPTIONS = [
  { color: '#FF4D4D', label: 'Coral' },
  { color: '#4D9FFF', label: 'Azul' },
  { color: '#4DFF91', label: 'Verde' },
  { color: '#FFD700', label: 'Amarillo' },
  { color: '#C77DFF', label: 'Violeta' },
  { color: '#FF914D', label: 'Naranja' },
  { color: '#FF69B4', label: 'Rosa' },
  { color: '#FFFFFF', label: 'Blanco' },
]

export default function RestaurantForm({ restaurant, allTags, onSubmit }: Props) {
  const [rating, setRating] = useState(restaurant?.rating ?? 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [priceLevel, setPriceLevel] = useState<number | null>(restaurant?.price_level ?? null)
  const [visited, setVisited] = useState(restaurant?.visited ?? false)
  const [selectedTags, setSelectedTags] = useState<string[]>(restaurant?.tags?.map(t => t.id) ?? [])
  const [tags, setTags] = useState<Tag[]>(allTags)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLOR_OPTIONS[0])
  const [showNewTag, setShowNewTag] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoUrls, setPhotoUrls] = useState<string[]>(restaurant?.photo_urls ?? [])
  const [uploading, setUploading] = useState(false)
  const [pinColor, setPinColor] = useState<string>(restaurant?.pin_color ?? '#FF4D4D')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Campos controlados para autocompletado
  const [nameValue, setNameValue] = useState(restaurant?.name ?? '')
  const [addressValue, setAddressValue] = useState(restaurant?.address ?? '')
  const [neighborhoodValue, setNeighborhoodValue] = useState(restaurant?.neighborhood ?? '')
  const [placeLat, setPlaceLat] = useState<number | null>(restaurant?.latitude ?? null)
  const [placeLng, setPlaceLng] = useState<number | null>(restaurant?.longitude ?? null)

  // Búsqueda Foursquare
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NominatimPlace[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearchQuery(q)

    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (!q.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        const places: NominatimPlace[] = data.results ?? []
        setSearchResults(places)
        setShowDropdown(places.length > 0)
      } catch {
        // silencioso
      } finally {
        setSearchLoading(false)
      }
    }, 350)
  }

  function selectPlace(place: NominatimPlace) {
    const name = place.address?.amenity ?? place.address?.restaurant ?? place.display_name.split(',')[0]
    const neighborhood = place.address?.suburb ?? place.address?.neighbourhood ?? place.address?.city ?? place.address?.town ?? ''
    setNameValue(name)
    setAddressValue(place.display_name)
    setNeighborhoodValue(neighborhood)
    setPlaceLat(parseFloat(place.lat))
    setPlaceLng(parseFloat(place.lon))
    setSearchQuery('')
    setSearchResults([])
    setShowDropdown(false)
    toast.success(`"${name}" cargado`)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) {
        setPhotoUrls(prev => [...prev, json.url])
      } else {
        toast.error('Error al subir imagen: ' + (json.error ?? 'desconocido'))
      }
    }
    setUploading(false)
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return
    const result = await createTag(newTagName.trim(), newTagColor)
    if (result.error) {
      toast.error('Error al crear la etiqueta')
      return
    }
    if (result.data) {
      setTags(prev => [...prev, result.data!])
      setSelectedTags(prev => [...prev, result.data!.id])
      setNewTagName('')
      setShowNewTag(false)
      toast.success('Etiqueta creada')
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('rating', String(rating))
    formData.set('price_level', priceLevel ? String(priceLevel) : '')
    formData.set('visited', String(visited))
    formData.set('tags', selectedTags.join(','))
    formData.set('photo_urls', photoUrls.join(','))
    formData.set('pin_color', pinColor)
    if (placeLat !== null) formData.set('latitude', String(placeLat))
    if (placeLng !== null) formData.set('longitude', String(placeLng))

    const result = await onSubmit(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Place Search */}
      {!restaurant && (
        <div ref={dropdownRef} className="relative">
          <label className="block text-sm text-[#737373] mb-1.5">Buscar lugar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A4A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar McDonald's, Nobu, cualquier lugar..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] transition-all text-sm"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] animate-spin" />
            )}
          </div>

          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 rounded-xl bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-xl">
              {searchResults.map(place => {
                const name = place.address?.amenity ?? place.address?.restaurant ?? place.display_name.split(',')[0]
                const subtitle = place.display_name.split(',').slice(1, 3).join(',').trim()
                return (
                  <button
                    key={place.place_id}
                    type="button"
                    onClick={() => selectPlace(place)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.06)] transition-colors text-left"
                  >
                    <MapPin className="w-4 h-4 text-[#FF4D4D] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{name}</p>
                      <p className="text-xs text-[#737373] truncate">{subtitle}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {nameValue && (
            <p className="text-xs text-[#4DFF91] mt-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Datos cargados desde Foursquare — podés editarlos abajo
            </p>
          )}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm text-[#737373] mb-1.5">Nombre *</label>
        <input
          name="name"
          required
          value={nameValue}
          onChange={e => setNameValue(e.target.value)}
          placeholder="El restaurante de mis sueños"
          className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] transition-all text-sm"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm text-[#737373] mb-1.5">Dirección</label>
        <input
          name="address"
          value={addressValue}
          onChange={e => setAddressValue(e.target.value)}
          placeholder="Calle y número, ciudad"
          className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] transition-all text-sm"
        />
      </div>

      {/* Maps URL */}
      <div>
        <label className="block text-sm text-[#737373] mb-1.5">URL de Google Maps</label>
        <input
          name="google_maps_url"
          type="url"
          defaultValue={restaurant?.google_maps_url ?? ''}
          placeholder="https://maps.google.com/..."
          className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] transition-all text-sm"
        />
        <p className="text-xs text-[#4A4A4A] mt-1">
          {placeLat ? 'Coordenadas cargadas desde la búsqueda' : 'Las coordenadas se extraen automáticamente'}
        </p>
      </div>

      {/* Two columns: Cuisine + Neighborhood */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-[#737373] mb-1.5">Tipo de cocina</label>
          <select
            name="cuisine_type"
            defaultValue={restaurant?.cuisine_type ?? ''}
            className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white focus:outline-none focus:border-[#FF4D4D] transition-all text-sm appearance-none"
          >
            <option value="">Seleccionar</option>
            {CUISINE_OPTIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-[#737373] mb-1.5">Barrio</label>
          <input
            name="neighborhood"
            value={neighborhoodValue}
            onChange={e => setNeighborhoodValue(e.target.value)}
            placeholder="Ej: Polanco"
            className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] transition-all text-sm"
          />
        </div>
      </div>

      {/* Price level */}
      <div>
        <label className="block text-sm text-[#737373] mb-1.5">Precio</label>
        <div className="flex gap-2">
          {[1, 2, 3].map(level => (
            <button
              key={level}
              type="button"
              onClick={() => setPriceLevel(priceLevel === level ? null : level)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border ${
                priceLevel === level
                  ? 'bg-[rgba(255,77,77,0.2)] text-[#FF4D4D] border-[rgba(255,77,77,0.4)]'
                  : 'bg-[rgba(255,255,255,0.04)] text-[#737373] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]'
              }`}
            >
              {'$'.repeat(level)}
            </button>
          ))}
        </div>
      </div>

      {/* Star rating */}
      <div>
        <label className="block text-sm text-[#737373] mb-1.5">Calificación</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(rating === star ? 0 : star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'text-[#FFD700] fill-[#FFD700]'
                    : 'text-[#2A2A2A] fill-[#2A2A2A]'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Opening hours */}
      <div>
        <label className="block text-sm text-[#737373] mb-1.5">Horario</label>
        <input
          name="opening_hours"
          defaultValue={restaurant?.opening_hours ?? ''}
          placeholder="Lun-Dom 12:00-22:00"
          className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] transition-all text-sm"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm text-[#737373] mb-1.5">Notas</label>
        <textarea
          name="notes"
          defaultValue={restaurant?.notes ?? ''}
          placeholder="Pide la pasta trufada, llegar temprano..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] transition-all text-sm resize-none"
        />
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm text-[#737373] mb-1.5">Fotos</label>
        <div className="flex gap-2 flex-wrap">
          {photoUrls.map((url, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotoUrls(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-16 h-16 rounded-xl border border-dashed border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[#4A4A4A] hover:border-[#FF4D4D] hover:text-[#FF4D4D] transition-all"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm text-[#737373] mb-1.5">Etiquetas</label>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              style={{
                borderColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                color: selectedTags.includes(tag.id) ? tag.color : undefined,
                backgroundColor: selectedTags.includes(tag.id) ? `${tag.color}20` : undefined,
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                selectedTags.includes(tag.id)
                  ? ''
                  : 'border-[rgba(255,255,255,0.08)] text-[#737373] hover:border-[rgba(255,255,255,0.2)]'
              }`}
            >
              {tag.name}
            </button>
          ))}

          {showNewTag ? (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="Nombre"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTag() }}}
                className="px-3 py-1.5 rounded-full text-xs bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#FF4D4D] w-24"
              />
              <div className="flex gap-1">
                {TAG_COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewTagColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full transition-transform ${newTagColor === c ? 'scale-125 ring-2 ring-white/30' : ''}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleCreateTag}
                className="text-xs text-[#FF4D4D] hover:text-[#FF3333] font-medium"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => setShowNewTag(false)}
                className="text-xs text-[#737373] hover:text-white"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewTag(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border border-dashed border-[rgba(255,255,255,0.15)] text-[#737373] hover:text-[#FF4D4D] hover:border-[#FF4D4D] transition-all"
            >
              <Plus className="w-3 h-3" />
              Nueva
            </button>
          )}
        </div>
      </div>

      {/* Pin color */}
      <div>
        <label className="block text-sm text-[#737373] mb-1.5">Color del pin en el mapa</label>
        <div className="flex gap-2 flex-wrap">
          {PIN_COLOR_OPTIONS.map(({ color, label }) => (
            <button
              key={color}
              type="button"
              title={label}
              onClick={() => setPinColor(color)}
              style={{ backgroundColor: color }}
              className={`w-8 h-8 rounded-full transition-all ${
                pinColor === color
                  ? 'scale-125 ring-2 ring-white/40 ring-offset-2 ring-offset-[#0A0A0A]'
                  : 'opacity-60 hover:opacity-100 hover:scale-110'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Visited toggle */}
      <div className="flex items-center justify-between p-4 glass rounded-xl border border-[rgba(255,255,255,0.06)]">
        <div>
          <p className="text-sm font-medium">Marcado como visitado</p>
          <p className="text-xs text-[#737373]">¿Ya fueron a este lugar?</p>
        </div>
        <button
          type="button"
          onClick={() => setVisited(v => !v)}
          className={`w-12 h-6 rounded-full transition-all relative ${visited ? 'bg-[#FF4D4D]' : 'bg-[#2A2A2A]'}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${visited ? 'left-7' : 'left-1'}`}
          />
        </button>
      </div>

      {error && (
        <p className="text-[#FF4D4D] text-sm bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[#FF4D4D] hover:bg-[#FF3333] text-white font-semibold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {restaurant ? 'Guardar cambios' : 'Agregar restaurante'}
      </button>
    </form>
  )
}
