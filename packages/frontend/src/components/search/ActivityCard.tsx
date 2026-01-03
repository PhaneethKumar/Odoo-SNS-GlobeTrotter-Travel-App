import React from 'react';
import { MapPin, Clock, DollarSign, Star, ExternalLink, Plus } from 'lucide-react';
import { Button, Card, CardContent } from '../ui';
import { ActivitySearchResult } from '../../types/search';
import { cn } from '../../lib/utils';

interface ActivityCardProps {
  activity: ActivitySearchResult;
  onAddToItinerary?: (activity: ActivitySearchResult) => void;
  onViewDetails?: (activity: ActivitySearchResult) => void;
  showAddButton?: boolean;
  className?: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onAddToItinerary,
  onViewDetails,
  showAddButton = true,
  className
}) => {
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", className)}>
      <CardContent className="p-0">
        {/* Image */}
        {activity.imageUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <img
              src={activity.imageUrl}
              alt={activity.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="absolute top-2 right-2">
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-white/90 text-gray-800 rounded-full">
                {activity.category}
              </span>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <h3 
              className="text-lg font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
              onClick={() => onViewDetails?.(activity)}
            >
              {activity.name}
            </h3>
            {activity.rating && (
              <div className="flex items-center gap-1 ml-2">
                <div className="flex">
                  {renderRating(activity.rating)}
                </div>
                <span className="text-sm text-gray-600 ml-1">
                  {activity.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{activity.location}</span>
          </div>

          {/* Description */}
          {activity.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {activity.description}
            </p>
          )}

          {/* Details */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
            {activity.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(activity.duration)}</span>
              </div>
            )}
            {activity.estimatedCost && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>{formatCurrency(activity.estimatedCost, activity.currency)}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {activity.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {activity.tags.length > 3 && (
                <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                  +{activity.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {showAddButton && onAddToItinerary && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToItinerary(activity);
                }}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add to Trip
              </Button>
            )}
            {activity.bookingUrl && (
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(activity.bookingUrl, '_blank');
                }}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Book
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;