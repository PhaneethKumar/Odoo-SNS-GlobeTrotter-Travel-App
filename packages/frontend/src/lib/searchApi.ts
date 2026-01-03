import { api } from './api';
import { 
  SearchFilters, 
  ActivitySearchResult, 
  DestinationSearchResult, 
  AutocompleteResult,
  SearchResponse 
} from '../types/search';

export const searchApi = {
  // Search destinations
  searchDestinations: async (
    query: string, 
    filters?: SearchFilters,
    page = 1,
    limit = 20
  ): Promise<SearchResponse<DestinationSearchResult>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters || {}).filter(([_, value]) => value !== undefined)
      )
    });

    const response = await api.get(`/search/destinations?${params}`);
    return response.data.data;
  },

  // Search activities
  searchActivities: async (
    query: string,
    filters?: SearchFilters,
    page = 1,
    limit = 20
  ): Promise<SearchResponse<ActivitySearchResult>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters || {}).filter(([_, value]) => value !== undefined)
      )
    });

    const response = await api.get(`/search/activities?${params}`);
    return response.data.data;
  },

  // Get autocomplete suggestions
  getAutocompleteSuggestions: async (
    query: string,
    type?: 'destination' | 'activity' | 'category'
  ): Promise<AutocompleteResult[]> => {
    const params = new URLSearchParams({
      q: query,
      ...(type && { type })
    });

    const response = await api.get(`/search/suggestions?${params}`);
    return response.data.data;
  },

  // Get activity details
  getActivityDetails: async (activityId: string): Promise<ActivitySearchResult> => {
    const response = await api.get(`/activities/${activityId}`);
    return response.data.data;
  },

  // Add activity to stop
  addActivityToStop: async (
    itineraryId: string,
    stopId: string,
    activityData: {
      name: string;
      description?: string;
      category: string;
      startTime?: string;
      endTime?: string;
      estimatedCost?: number;
      currency?: string;
      bookingUrl?: string;
    }
  ) => {
    const response = await api.post(
      `/itineraries/${itineraryId}/stops/${stopId}/activities`,
      activityData
    );
    return response.data.data;
  }
};