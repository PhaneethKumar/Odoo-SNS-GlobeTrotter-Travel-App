import React from 'react';
import { Calendar, MapPin, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui';
import { Stop } from '@globe-trotter/shared';

interface StopCardProps {
  stop: Stop;
  onEdit: () => void;
  onDelete: () => void;
}

const StopCard: React.FC<StopCardProps> = ({ stop, onEdit, onDelete }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDuration = () => {
    const arrival = new Date(stop.arrivalDate);
    const departure = new Date(stop.departureDate);
    const diffTime = Math.abs(departure.getTime() - arrival.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-3">
      {/* Stop Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            {stop.destinationName}
          </h3>
          {stop.destinationCode && (
            <p className="text-sm text-gray-500 mt-1">
              Code: {stop.destinationCode}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-1"
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stop Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <div>
            <p className="font-medium">Arrival</p>
            <p>{formatDate(stop.arrivalDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <div>
            <p className="font-medium">Departure</p>
            <p>{formatDate(stop.departureDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-blue-800">
              {getDuration()}
            </span>
          </div>
          <div>
            <p className="font-medium">Duration</p>
            <p>{getDuration()} {getDuration() === 1 ? 'day' : 'days'}</p>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Activities</h4>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-xs"
          >
            <Plus className="h-3 w-3" />
            Add Activity
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          No activities added yet. Click "Add Activity" to start planning.
        </div>
      </div>

      {/* Coordinates (if available) */}
      {stop.latitude && stop.longitude && (
        <div className="text-xs text-gray-400 border-t pt-2">
          Coordinates: {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default StopCard;