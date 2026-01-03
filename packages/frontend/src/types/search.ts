// Search and activity discovery types
export interface SearchFilters {
  location?: string;
  category?: string;
  minCost?: number;
  maxCost?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  rating?: number;
}

export interface ActivitySearchResult {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  estimatedCost?: number;
  currency?: string;
  duration?: number;
  rating?: number;
  imageUrl?: string;
  bookingUrl?: string;
  tags?: string[];
}

export interface DestinationSearchResult {
  id: string;
  name: string;
  code?: string;
  country: string;
  latitude: number;
  longitude: number;
  description?: string;
  imageUrl?: string;
  popularActivities?: string[];
}

export interface AutocompleteResult {
  id: string;
  name: string;
  type: 'destination' | 'activity' | 'category';
  description?: string;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}