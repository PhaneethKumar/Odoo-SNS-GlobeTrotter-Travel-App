import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { 
  SearchInterface, 
  SearchResults, 
  AutocompleteSearch 
} from '../components/search';
import { searchApi } from '../lib/searchApi';
import { 
  SearchFilters, 
  ActivitySearchResult, 
  AutocompleteResult
} from '../types/search';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItinerary, setSelectedItinerary] = useState<string | null>(null);

  // Search activities query
  const { 
    data: searchResults, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['search-activities', query, filters, currentPage],
    queryFn: async () => {
      if (!query.trim()) return null;
      return await searchApi.searchActivities(query, filters, currentPage, 20);
    },
    enabled: !!query.trim(),
  });

  const handleSearch = useCallback((searchQuery: string, searchFilters: SearchFilters) => {
    setQuery(searchQuery);
    setFilters(searchFilters);
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    setSearchParams(params);
  }, [setSearchParams]);

  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleAutocompleteSelect = useCallback((result: AutocompleteResult) => {
    setQuery(result.name);
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    params.set('q', result.name);
    setSearchParams(params);
    
    // Trigger search
    refetch();
  }, [setSearchParams, refetch]);

  const handleLoadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const handleAddToItinerary = useCallback(async (activity: ActivitySearchResult) => {
    if (!selectedItinerary) {
      // If no itinerary selected, show selection modal or redirect to itinerary selection
      alert('Please select an itinerary first');
      return;
    }

    try {
      // This would typically open a modal to select which stop to add the activity to
      console.log('Adding activity to itinerary:', activity, selectedItinerary);
      alert('Activity added to itinerary! (This would be implemented with proper API calls)');
    } catch (error) {
      console.error('Error adding activity to itinerary:', error);
      alert('Failed to add activity to itinerary');
    }
  }, [selectedItinerary]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Discover Activities
              </h1>
              <p className="text-gray-600 mt-1">
                Find amazing experiences for your trip
              </p>
            </div>
          </div>

          {/* Search Interface */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Main Search */}
                  <AutocompleteSearch
                    placeholder="Search for activities, destinations, or categories..."
                    onSelect={handleAutocompleteSelect}
                    onSearch={(searchQuery) => handleSearch(searchQuery, filters)}
                  />
                  
                  {/* Advanced Filters */}
                  <SearchInterface
                    onSearch={handleSearch}
                    onFiltersChange={handleFiltersChange}
                    isLoading={isLoading}
                    placeholder="Search activities..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Itinerary Selection */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add to Itinerary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <select
                    value={selectedItinerary || ''}
                    onChange={(e) => setSelectedItinerary(e.target.value || null)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select an itinerary to add activities to...</option>
                    {/* This would be populated with user's itineraries */}
                    <option value="sample-1">Sample Trip to Paris</option>
                    <option value="sample-2">Weekend in Tokyo</option>
                  </select>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/itineraries')}
                  >
                    Manage Itineraries
                  </Button>
                </div>
                {!selectedItinerary && (
                  <p className="text-sm text-gray-600 mt-2">
                    Select an itinerary to start adding activities to your trip.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <SearchResults
            results={searchResults || null}
            isLoading={isLoading}
            onLoadMore={searchResults?.hasMore ? handleLoadMore : undefined}
            onAddToItinerary={handleAddToItinerary}
            showAddButton={!!selectedItinerary}
          />

          {/* Empty State */}
          {!query && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Start exploring
              </h3>
              <p className="text-gray-600 mb-6">
                Search for activities, destinations, or browse by category to discover amazing experiences for your trip.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Museums', 'Food & Dining', 'Outdoor Activities', 'Cultural', 'Entertainment'].map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(category, { category })}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;