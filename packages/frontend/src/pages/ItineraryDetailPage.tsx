import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, Plus, Calendar, MapPin, Search, Clock, List } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { api } from '../lib/api';
import { Itinerary, Stop, Activity } from '@globe-trotter/shared';
import StopsList from '../components/itinerary/StopsList';
import EditItineraryModal from '../components/itinerary/EditItineraryModal';
import AddStopModal from '../components/itinerary/AddStopModal';
import { AutocompleteSearch, SearchResults } from '../components/search';
import { BudgetDashboard } from '../components/budget';
import { CalendarView, TimelineView } from '../components/calendar';
import { searchApi } from '../lib/searchApi';
import { ActivitySearchResult, AutocompleteResult } from '../types/search';

type ViewType = 'list' | 'calendar' | 'timeline';

const ItineraryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
  const [showActivitySearch, setShowActivitySearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('list');

  const { data: itinerary, isLoading, error } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: async () => {
      const response = await api.get(`/itineraries/${id}`);
      return response.data.data as Itinerary;
    },
    enabled: !!id,
  });

  const { data: stops } = useQuery({
    queryKey: ['itinerary-stops', id],
    queryFn: async () => {
      const response = await api.get(`/itineraries/${id}/stops`);
      return response.data.data as Stop[];
    },
    enabled: !!id,
  });

  // Fetch activities for all stops
  const { data: activities } = useQuery({
    queryKey: ['itinerary-activities', id],
    queryFn: async () => {
      if (!stops || stops.length === 0) return [];
      
      const allActivities: Activity[] = [];
      for (const stop of stops) {
        try {
          const response = await api.get(`/itineraries/${id}/stops/${stop.id}/activities`);
          if (response.data.data) {
            allActivities.push(...response.data.data);
          }
        } catch (error) {
          console.warn(`Failed to fetch activities for stop ${stop.id}:`, error);
        }
      }
      return allActivities;
    },
    enabled: !!id && !!stops && stops.length > 0,
  });

  // Search activities query
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['search-activities', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;
      return await searchApi.searchActivities(searchQuery, {}, 1, 12);
    },
    enabled: !!searchQuery.trim() && showActivitySearch,
  });

  const deleteItineraryMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/itineraries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      navigate('/itineraries');
    },
  });

  const handleDeleteItinerary = () => {
    if (window.confirm('Are you sure you want to delete this itinerary? This action cannot be undone.')) {
      deleteItineraryMutation.mutate();
    }
  };

  const handleAutocompleteSelect = (result: AutocompleteResult) => {
    setSearchQuery(result.name);
  };

  const handleAddActivityToItinerary = async (activity: ActivitySearchResult) => {
    // For now, we'll just show an alert. In a real implementation, this would
    // open a modal to select which stop to add the activity to
    alert(`Adding "${activity.name}" to itinerary. This would open a stop selection modal.`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="h-96 bg-gray-300 rounded-lg"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-gray-300 rounded-lg"></div>
                  <div className="h-32 bg-gray-300 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Itinerary Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The itinerary you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => navigate('/itineraries')}>
                Back to Itineraries
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDuration = () => {
    const start = new Date(itinerary.startDate);
    const end = new Date(itinerary.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <Button
                variant="outline"
                onClick={() => navigate('/itineraries')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {itinerary.title}
                </h1>
                {itinerary.description && (
                  <p className="text-gray-600 mt-1">{itinerary.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteItinerary}
                disabled={deleteItineraryMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="mb-6">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm w-fit">
              <Button
                variant={currentView === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('list')}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                List View
              </Button>
              <Button
                variant={currentView === 'calendar' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('calendar')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
              <Button
                variant={currentView === 'timeline' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('timeline')}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Timeline
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {currentView === 'list' && (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Stops & Activities
                        </CardTitle>
                        <Button
                          onClick={() => setIsAddStopModalOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Stop
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <StopsList
                        itineraryId={itinerary.id}
                        stops={stops || []}
                      />
                    </CardContent>
                  </Card>
                </>
              )}

              {currentView === 'calendar' && (
                <CalendarView
                  itinerary={itinerary}
                  stops={stops || []}
                  activities={activities || []}
                  onActivityClick={(activity) => {
                    // Handle activity click - could open a modal or navigate
                    console.log('Activity clicked:', activity);
                  }}
                  onStopClick={(stop) => {
                    // Handle stop click - could open edit modal
                    console.log('Stop clicked:', stop);
                  }}
                />
              )}

              {currentView === 'timeline' && (
                <TimelineView
                  itinerary={itinerary}
                  stops={stops || []}
                  activities={activities || []}
                  onActivityClick={(activity) => {
                    // Handle activity click - could open a modal or navigate
                    console.log('Activity clicked:', activity);
                  }}
                  onStopClick={(stop) => {
                    // Handle stop click - could open edit modal
                    console.log('Stop clicked:', stop);
                  }}
                />
              )}

              {/* Activity Discovery Section - Show in all views */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Discover Activities
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setShowActivitySearch(!showActivitySearch)}
                    >
                      {showActivitySearch ? 'Hide Search' : 'Find Activities'}
                    </Button>
                  </div>
                </CardHeader>
                {showActivitySearch && (
                  <CardContent className="space-y-6">
                    <AutocompleteSearch
                      placeholder="Search for activities to add to your trip..."
                      onSelect={handleAutocompleteSelect}
                      onSearch={setSearchQuery}
                    />
                    
                    {searchResults && (
                      <SearchResults
                        results={searchResults}
                        isLoading={isSearchLoading}
                        onAddToItinerary={handleAddActivityToItinerary}
                        showAddButton={true}
                      />
                    )}
                    
                    {!searchQuery && (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                          Search for activities to add to your itinerary
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {['Museums', 'Restaurants', 'Tours', 'Shopping', 'Entertainment'].map((category) => (
                            <Button
                              key={category}
                              variant="outline"
                              size="sm"
                              onClick={() => setSearchQuery(category)}
                            >
                              {category}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trip Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Trip Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-lg font-semibold">
                      {getDuration()} {getDuration() === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Start Date</p>
                    <p className="text-lg font-semibold">
                      {formatDate(itinerary.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">End Date</p>
                    <p className="text-lg font-semibold">
                      {formatDate(itinerary.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      itinerary.status === 'active' ? 'bg-green-100 text-green-800' :
                      itinerary.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      itinerary.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Budget Dashboard */}
              <BudgetDashboard itineraryId={itinerary.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditItineraryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        itinerary={itinerary}
      />
      <AddStopModal
        isOpen={isAddStopModalOpen}
        onClose={() => setIsAddStopModalOpen(false)}
        itineraryId={itinerary.id}
      />
    </div>
  );
};

export default ItineraryDetailPage;