export interface Category {
  id: string;
  slug: string;
  title_en: string;
  title_km: string;
  description_en: string;
  description_km: string;
  cover_image: string;
  order: number;
  has_map_feature?: boolean;
}

export interface PhotoSpot {
  title: string;
  description: string;
  image_url: string;
}

export interface ContentItem {
  id: string;
  category_slug: string;
  title_en: string;
  title_km: string;
  summary_en: string;
  summary_km: string;
  content_en: string;
  content_km: string;
  images: string[];
  audio?: string;
  video?: string;
  created_at: string;
  // Location & Map Data (Optional)
  location_coordinates?: { lat: number; lng: number };
  map_image_url?: string;
  photo_spots?: PhotoSpot[];
}

export interface SiteSetting {
  key: string;
  value: string;
  label: string;
}

export type Language = 'en' | 'km';