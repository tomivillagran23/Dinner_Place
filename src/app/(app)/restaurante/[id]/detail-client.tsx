'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, MapPin, Clock, ExternalLink, Edit2, Trash2, Check, ChevronLeft, ChevronRight, MessageCircle, Send, X } from 'lucide-react'
import { deleteRestaurant, toggleVisited, addComment, deleteComment } from '@/lib/actions/restaurants'
import { toast } from 'sonner'
import type { Restaurant, Tag } from '@/lib/types'

interface Comment {
  id: string
  user_id: string
  content: string
  rating: number | null
  created_at: string
  profiles: { display_name: string | null } | null
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

interface Props {
  restaurant: Restaurant & { tags?: Tag[]; profiles?: { display_name: string | null } | null }
  currentUserId: string
  initialComments: Comment[]
}

export default function RestauranteDetailClient({ restaurant, currentUserId, initialComments }: Props) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const [visited, setVisited] = useState(restaurant.visited)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const photos = restaurant.photo_urls ?? []

  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentText, setCommentText] = useState('')
  const [commentRating, setCommentRating] = useState(0)
  const [commentHover, setCommentHover] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  async function handleToggleVisited() {
    const newValue = !visited
    setVisited(newValue)
    await toggleVisited(restaurant.id, newValue)
    toast.success(newValue ? 'Marcado como visitado 🎉' : 'Marcado como pendiente')
  }

  async function handleDelete() {
    setDeleting(true)
    toast.loading('Eliminando...')
    await deleteRestaurant(restaurant.id)
  }

  async function handleAddComment() {
    if (!commentText.trim()) return
    setSubmitting(true)
    const result = await addComment(restaurant.id, commentText.trim(), commentRating || null)
    if (result.error) {
      toast.error('Error al agregar comentario')
    } else if (result.data) {
      setComments(prev => [result.data!, ...prev])
      setCommentText('')
      setCommentRating(0)
      toast.success('Comentario agregado')
    }
    setSubmitting(false)
  }

  async function handleDeleteComment(commentId: string) {
    setComments(prev => prev.filter(c => c.id !== commentId))
    await deleteComment(commentId, restaurant.id)
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Photo gallery */}
      <div className="relative bg-[#141414] h-64">
        {photos.length > 0 ? (
          <>
            <img
              src={photos[photoIndex]}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIndex(i => (i - 1 + photos.length) % photos.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 glass rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPhotoIndex(i => (i + 1) % photos.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 glass rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
              <path d="M8 6C8 5.448 8.448 5 9 5C9.552 5 10 5.448 10 6V14C10 15.105 10.895 16 12 16C13.105 16 14 15.105 14 14V6C14 5.448 14.448 5 15 5C15.552 5 16 5.448 16 6V14C16 16.209 14.209 18 12 18V27C12 27.552 11.552 28 11 28C10.448 28 10 27.552 10 27V18C7.791 18 6 16.209 6 14V6C6 5.448 6.448 5 7 5C7.552 5 8 5.448 8 6Z" fill="#4A4A4A"/>
              <path d="M20 5C19.448 5 19 5.448 19 6V13.764C19 15.547 20.099 17.149 21.764 17.836L22 17.93V27C22 27.552 22.448 28 23 28C23.552 28 24 27.552 24 27V6C24 5.448 23.552 5 23 5C22.448 5 22 5.448 22 6V15.756C21.4 15.24 21 14.552 21 13.764V6C21 5.448 20.552 5 20 5Z" fill="#4A4A4A"/>
            </svg>
          </div>
        )}

        {/* Top actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link href="/" className="w-9 h-9 glass rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/editar/${restaurant.id}`}
              className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-[rgba(255,255,255,0.15)] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-[rgba(255,77,77,0.2)] transition-colors"
            >
              <Trash2 className="w-4 h-4 text-[#FF4D4D]" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            {restaurant.profiles?.display_name && (
              <p className="text-xs text-[#737373] mt-1">
                Agregado por <span className="text-white">{restaurant.profiles.display_name}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleToggleVisited}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
              visited
                ? 'bg-[rgba(77,255,145,0.15)] text-[#4DFF91] border border-[rgba(77,255,145,0.2)]'
                : 'bg-[rgba(255,255,255,0.06)] text-[#737373] border border-[rgba(255,255,255,0.08)] hover:border-[#FF4D4D] hover:text-[#FF4D4D]'
            }`}
          >
            {visited && <Check className="w-4 h-4" />}
            {visited ? 'Visitado' : 'Pendiente'}
          </button>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3">
          {restaurant.cuisine_type && (
            <div className="glass rounded-xl p-3 border border-[rgba(255,255,255,0.06)]">
              <p className="text-xs text-[#737373] mb-1">Cocina</p>
              <p className="text-sm font-medium">{restaurant.cuisine_type}</p>
            </div>
          )}
          {restaurant.price_level && (
            <div className="glass rounded-xl p-3 border border-[rgba(255,255,255,0.06)]">
              <p className="text-xs text-[#737373] mb-1">Precio</p>
              <p className="text-sm font-medium text-[#FFD700]">{PRICE_LABELS[restaurant.price_level]}</p>
            </div>
          )}
          {restaurant.neighborhood && (
            <div className="glass rounded-xl p-3 border border-[rgba(255,255,255,0.06)]">
              <p className="text-xs text-[#737373] mb-1">Barrio</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF4D4D]" />
                {restaurant.neighborhood}
              </p>
            </div>
          )}
          {restaurant.rating !== null && restaurant.rating !== undefined && (
            <div className="glass rounded-xl p-3 border border-[rgba(255,255,255,0.06)]">
              <p className="text-xs text-[#737373] mb-1">Calificación</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < (restaurant.rating ?? 0) ? 'text-[#FFD700] fill-[#FFD700]' : 'text-[#2A2A2A] fill-[#2A2A2A]'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Address & Hours */}
        {restaurant.address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#737373] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#D4D4D4]">{restaurant.address}</p>
          </div>
        )}
        {restaurant.opening_hours && (
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-[#737373] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#D4D4D4]">{restaurant.opening_hours}</p>
          </div>
        )}

        {/* Notes */}
        {restaurant.notes && (
          <div className="glass rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
            <p className="text-xs text-[#737373] mb-2">Notas</p>
            <p className="text-sm text-[#D4D4D4] leading-relaxed">{restaurant.notes}</p>
          </div>
        )}

        {/* Tags */}
        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {restaurant.tags.map(tag => (
              <span
                key={tag.id}
                className={`text-xs border px-3 py-1 rounded-full font-medium ${getTagStyle(tag.color)}`}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Maps button */}
        {restaurant.google_maps_url && (
          <a
            href={restaurant.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] text-[#FF4D4D] font-semibold text-sm hover:bg-[rgba(255,77,77,0.2)] transition-all active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir en Maps
          </a>
        )}

        {/* Comments */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-[#737373]" />
            <h2 className="font-semibold text-sm text-[#737373] uppercase tracking-wider">
              Reseñas {comments.length > 0 && `· ${comments.length}`}
            </h2>
          </div>

          {/* Add comment form */}
          <div className="glass rounded-xl p-4 border border-[rgba(255,255,255,0.06)] mb-4 space-y-3">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCommentRating(commentRating === star ? 0 : star)}
                  onMouseEnter={() => setCommentHover(star)}
                  onMouseLeave={() => setCommentHover(0)}
                >
                  <Star className={`w-5 h-5 transition-colors ${star <= (commentHover || commentRating) ? 'text-[#FFD700] fill-[#FFD700]' : 'text-[#2A2A2A] fill-[#2A2A2A]'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Dejá tu reseña..."
              rows={2}
              className="w-full bg-transparent text-sm text-white placeholder-[#4A4A4A] focus:outline-none resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddComment}
                disabled={submitting || !commentText.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF4D4D] hover:bg-[#FF3333] text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
              >
                <Send className="w-3 h-3" />
                Publicar
              </button>
            </div>
          </div>

          {/* Comment list */}
          {comments.length === 0 ? (
            <p className="text-sm text-[#4A4A4A] text-center py-4">Sin reseñas aún. ¡Sé el primero!</p>
          ) : (
            <div className="space-y-3">
              {comments.map(comment => (
                <div key={comment.id} className="glass rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-white">
                          {comment.profiles?.display_name ?? 'Usuario'}
                        </span>
                        {comment.rating && (
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < comment.rating! ? 'text-[#FFD700] fill-[#FFD700]' : 'text-[#2A2A2A] fill-[#2A2A2A]'}`} />
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-[#4A4A4A]">
                          {new Date(comment.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm text-[#D4D4D4] leading-relaxed">{comment.content}</p>
                    </div>
                    {comment.user_id === currentUserId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-[#4A4A4A] hover:text-[#FF4D4D] transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm glass-strong rounded-2xl p-6 space-y-4 animate-slide-up">
            <h3 className="font-semibold text-lg">¿Eliminar restaurante?</h3>
            <p className="text-sm text-[#737373]">
              Esta acción no se puede deshacer. Se eliminará{' '}
              <span className="text-white font-medium">{restaurant.name}</span> de tu wishlist.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] text-sm font-medium hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-[#FF4D4D] hover:bg-[#FF3333] text-white text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
