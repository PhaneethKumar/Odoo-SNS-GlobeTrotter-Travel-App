import React from 'react';
import { MapPin, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Itinerary, Stop, Activity } from '@globe-trotter/shared';

interface OverviewViewProps {
  itinerary: Itinerary;
  stops: Stop[];
  activitiesByStop: Record<string, Activity[]>;
  conflicts: Array<{ activity1: Activity; activity2: Activity }>;
  onActivityClick?: (activity: Activity) => void;
  onStopClick?: (stop: Stop) => void;
}

const OverviewView: React.FC<OverviewViewProps> = ({
  itinerary,
  stops,
  activitiesByStop,
  conflicts,
  onActivityClick,
  onStopClick,
}) => {
  // Check if an activity has conflicts
  const hasConflict = (activity: Activity) => {
    return conflicts.some(conflict => 
      conflict.activity1.id === activity.id || conflict.activity2.id === activity.id
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDuration = () => {
    const start = new Date(itinerary.startDate);
    const end = new Date(itinerary.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalActivities = () => {
    return Object.values(activitiesByStop).reduce((total, activities) => total + activities.length, 0);
  };

  if (stops.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
          <MapPin className="h-full w-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No stops planned yet
        </h3>
        <p className="text-gray-600">
          Add destinations to your itinerary to see the timeline overview.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trip Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Duration</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {getDuration()} {getDuration() === 1 ? 'day' : 'days'}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Destinations</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{stops.length}</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Activities</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{getTotalActivities()}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Trip Timeline</h3>
        
        {/* Timeline Line */}
        <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-300"></div>
        
        <div className="space-y-8">
          {stops.map((stop, index) => {
            const stopActivities = activitiesByStop[stop.id] || [];
            const conflictedActivities = stopActivities.filter(hasConflict);
            
            return (
              <div key={stop.id} className="relative flex items-start gap-6">
                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                  <div className="absolute -left-2 -top-2 w-8 h-8 bg-blue-100 rounded-full opacity-50"></div>
                </div>
                
                {/* Stop Content */}
                <div className="flex-1 min-w-0 pb-8">
                  <div
                    className="bg-white border rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onStopClick?.(stop)}
                  >
                    {/* Stop Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {stop.destinationName}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            {formatDate(new Date(stop.arrivalDate))} - {formatDate(new Date(stop.departureDate))}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                            Stop {index + 1}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {stopActivities.length} {stopActivities.length === 1 ? 'activity' : 'activities'}
                        </p>
                        {conflictedActivities.length > 0 && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{conflictedActivities.length} conflicts</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Activities */}
                    {stopActivities.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Planned Activities</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {stopActivities.slice(0, 4).map(activity => (
                            <div
                              key={activity.id}
                              className={`p-3 border rounded cursor-pointer transition-all hover:shadow-sm ${
                                hasConflict(activity)
                                  ? 'border-red-300 bg-red-50 hover:bg-red-100'
                                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onActivityClick?.(activity);
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-1">
                                    {hasConflict(activity) && (
                                      <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm font-medium truncate ${
                                      hasConflict(activity) ? 'text-red-900' : 'text-gray-900'
                                    }`}>
                                      {activity.name}
                                    </span>
                                  </div>
                                  
                                  {activity.startTime && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {formatTime(new Date(activity.startTime))}
                                        {activity.endTime && ` - ${formatTime(new Date(activity.endTime))}`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-xs px-2 py-1 bg-white border rounded-full">
                                    {activity.category}
                                  </span>
                                  {activity.estimatedCost && (
                                    <span className="text-xs font-medium text-green-600">
                                      {activity.currency || '$'}{activity.estimatedCost}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {stopActivities.length > 4 && (
                          <div className="text-center pt-2">
                            <span className="text-sm text-gray-500">
                              +{stopActivities.length - 4} more activities
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {stopActivities.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No activities planned yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OverviewView;