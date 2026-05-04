export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  couple_id: string | null
  created_at: string
}

export interface Couple {
  id: string
  created_at: string
  invite_code: string
}

export interface Tag {
  id: string
  name: string
  couple_id: string
  color: string
}

export interface Restaurant {
  id: string
  created_at: string
  couple_id: string
  added_by: string
  name: string
  address: string
  google_maps_url: string | null
  latitude: number | null
  longitude: number | null
  photo_urls: string[]
  price_level: 1 | 2 | 3 | null
  opening_hours: string | null
  rating: number | null
  notes: string | null
  visited: boolean
  neighborhood: string | null
  cuisine_type: string | null
  pin_color: string | null
  tags?: Tag[]
  profiles?: { display_name: string | null } | null
}

export interface RestaurantTag {
  restaurant_id: string
  tag_id: string
}
