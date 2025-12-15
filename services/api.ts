import { supabase } from './supabaseClient';
import { Category, ContentItem } from '../types';

export const api = {
  /**
   * Fetch all categories ordered by the 'order' field from Supabase.
   */
  getCategories: async (): Promise<Category[]> => {
    try {
      // We explicitly select the columns to ensure mapping is correct
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        console.error('Supabase error fetching categories:', JSON.stringify(error, null, 2));
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
      return [];
    }
  },

  /**
   * Fetch a single category by its slug from Supabase.
   */
  getCategoryBySlug: async (slug: string): Promise<Category | undefined> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error(`Supabase error fetching category ${slug}:`, JSON.stringify(error, null, 2));
        return undefined;
      }
      return data;
    } catch (err) {
      console.error('Unexpected error fetching category:', err);
      return undefined;
    }
  },

  /**
   * Fetch all items belonging to a specific category from Supabase.
   */
  getItemsByCategory: async (categorySlug: string): Promise<ContentItem[]> => {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('category_slug', categorySlug);

      if (error) {
        console.error(`Supabase error fetching items for ${categorySlug}:`, JSON.stringify(error, null, 2));
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching items:', err);
      return [];
    }
  },

  /**
   * Fetch a single item detail by its ID from Supabase.
   */
  getItemDetail: async (id: string): Promise<ContentItem | undefined> => {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Supabase error fetching item ${id}:`, JSON.stringify(error, null, 2));
        return undefined;
      }
      if (data) {
        // --- MOCK DATA INJECTION FOR DEMO (Since DB likely doesn't have these cols yet) ---
        // We inject this only if the item is in the 'temples' category or similar, but for now we do it for all to show the UI
        if (!data.location_coordinates) {
          data.location_coordinates = { lat: 13.4125, lng: 103.8670 }; // Angkor Wat Coordinates
        }
        if (!data.map_image_url) {
          data.map_image_url = 'https://media.gettyimages.com/id/165516082/vector/angkor-wat-plan.jpg?s=612x612&w=gi&k=20&c=vW82-U5yC_XDBKyOEE1rR2OtCNz3q7_8yH0lF_6n-1U=';
        }
        if (!data.photo_spots) {
          data.photo_spots = [
            {
              title: "Reflection Pond at Sunrise",
              description: "Capture the iconic silhouette of the five towers reflected in the northern lily pond. Best visited between 5:30 AM and 6:00 AM.",
              image_url: "https://submit.shutterstock.com/700/1039860268.jpg"
            },
            {
              title: "The Eastern Gallery",
              description: "Deep bas-reliefs look spectacular when the morning sun strikes them at a low angle.",
              image_url: "https://media.istockphoto.com/id/507005072/photo/bas-reliefs-in-angkor-wat-cambodia.jpg?s=612x612&w=0&k=20&c=hDrX4eZtG0v9-C1DqF-j0pD_l2r4pE8_l8B9e8_l8B8="
            },
            {
              title: "Upper Level View",
              description: "A commanding view of the causeway and the surrounding jungle from the Akanistha level.",
              image_url: "https://thumbs.dreamstime.com/b/view-angkor-wat-temple-top-level-siem-reap-cambodia-view-angkor-wat-temple-top-level-119154743.jpg"
            }
          ];
        }
        // ---------------------------------------------------------------------------------
      }
      return data;
    } catch (err) {
      console.error('Unexpected error fetching item detail:', err);
      return undefined;
    }
  },

  /**
   * Fetch global site settings (hero image, music, etc)
   */
  getSiteSettings: async (): Promise<Record<string, string>> => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error || !data) return {};
      // Convert array to object for easier access { "hero_image": "url", ... }
      return data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    } catch (e) {
      console.error("Error fetching site settings", e);
      return {};
    }
  }
};