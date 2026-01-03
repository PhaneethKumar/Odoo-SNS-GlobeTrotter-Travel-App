import React from 'react';
import { X, MapPin, Clock, DollarSign, Star, ExternalLink, Plus, Calendar } from 'lucide-react';
import { Button } from '../ui';
import { ActivitySearchResult } from '../../types/search';

interface ActivityDetailModalProps {
  activity: ActivitySearchResult | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToItinerary?: (activity: ActivitySearchResult) => void;
  showAddButton?: boolean;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  isOpen,
  onClose,
  onAddToItinerary,
  showAddButton = true
}) => {
  if (!isOpen || !activity) return null;

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-5 w-5 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Activity Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Image */}
            {activity.imageUrl && (
              <div className="relative h-64 w-full overflow-hidden rounded-lg mb-6">
                <img
                  src={activity.imageUrl}
                  alt={activity.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="inline-flex px-3 py-1 text-sm font-medium bg-white/90 text-gray-800 rounded-full">
                    {activity.category}
                  </span>
                </div>
              </div>
            )}

            {/* Title and Rating */}
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{activity.name}</h1>
              {activity.rating && (
                <div className="flex items-center gap-2 ml-4">
                  <div className="flex">
                    {renderRating(activity.rating)}
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    {activity.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-600 mb-6">
              <MapPin className="h-5 w-5" />
              <span className="text-lg">{activity.location}</span>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {activity.duration && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{formatDuration(activity.duration)}</p>
                  </div>
                </div>
              )}
              
              {activity.estimatedCost && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Cost</p>
                    <p className="font-semibold">
                      {formatCurrency(activity.estimatedCost, activity.currency)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">{activity.category}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {activity.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{activity.description}</p>
              </div>
            )}

            {/* Tags */}
            {activity.tags && activity.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {showAddButton && onAddToItinerary && (
                <Button
                  onClick={() => {
                    onAddToItinerary(activity);
                    onClose();
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
                  onClick={() => window.open(activity.bookingUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Book Now
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailModal;