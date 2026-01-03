import React, { useState } from 'react';
import { Grid, List, ChevronRight } from 'lucide-react';
import { Button } from '../ui';
import { ActivitySearchResult, SearchResponse } from '../../types/search';
import ActivityCard from './ActivityCard';
import ActivityDetailModal from './ActivityDetailModal';
import { cn } from '../../lib/utils';

interface SearchResultsProps {
  results: SearchResponse<ActivitySearchResult> | null;
  isLoading: boolean;
  onLoadMore?: () => void;
  onAddToItinerary?: (activity: ActivitySearchResult) => void;
  showAddButton?: boolean;
  className?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  onLoadMore,
  onAddToItinerary,
  showAddButton = true,
  className
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedActivity, setSelectedActivity] = useState<ActivitySearchResult | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (activity: ActivitySearchResult) => {
    setSelectedActivity(activity);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedActivity(null);
  };

  if (isLoading && !results) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-300 rounded w-20 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 rounded-lg h-48 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!results || results.results.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-600">
          Try adjusting your search terms or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Results Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {results.total} {results.total === 1 ? 'result' : 'results'} found
          </h2>
          {results.page > 1 && (
            <span className="text-sm text-gray-600">
              Page {results.page} of {Math.ceil(results.total / results.limit)}
            </span>
          )}
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="p-2"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="p-2"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Grid/List */}
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      )}>
        {results.results.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onAddToItinerary={onAddToItinerary}
            onViewDetails={handleViewDetails}
            showAddButton={showAddButton}
            className={viewMode === 'list' ? "flex-row" : ""}
          />
        ))}
      </div>

      {/* Loading More */}
      {isLoading && results && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Load More Button */}
      {results.hasMore && !isLoading && onLoadMore && (
        <div className="flex justify-center">
          <Button
            onClick={onLoadMore}
            variant="outline"
            className="flex items-center gap-2"
          >
            Load More Results
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      {results.total > results.limit && (
        <div className="text-center text-sm text-gray-600">
          Showing {((results.page - 1) * results.limit) + 1} to{' '}
          {Math.min(results.page * results.limit, results.total)} of {results.total} results
        </div>
      )}

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onAddToItinerary={onAddToItinerary}
        showAddButton={showAddButton}
      />
    </div>
  );
};

export default SearchResults;