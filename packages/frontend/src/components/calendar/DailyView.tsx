import React from 'react';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Stop, Activity } from '@globe-trotter/shared';

interface DailyViewProps {
  date: Date;
  stops: Stop[];
  activitiesByStop: Record<string, Activity[]>;
  conflicts: Array<{ activity1: Activity; activity2: Activity }>;
  onActivityClick?: (activity: Activity) => void;
  onStopClick?: (stop: Stop) => void;
}

const DailyView: React.FC<DailyViewProps> = ({
  date,
  stops,
  activitiesByStop,
  conflicts,
  onActivityClick,
  onStopClick,
}) => {
  // Find stops that are active on this date
  const activeStops = stops.filter(stop => {
    const arrivalDate = new Date(stop.arrivalDate);
    const departureDate = new Date(stop.departureDate);
    const currentDate = new Date(date);
    
    // Reset time to compare dates only
    arrivalDate.setHours(0, 0, 0, 0);
    departureDate.setHours(23, 59, 59, 999);
    currentDate.setHours(12, 0, 0, 0);
    
    return currentDate >= arrivalDate && currentDate <= departureDate;
  });

  // Get activities for this date
  const dailyActivities: Array<{ activity: Activity; stop: Stop }> = [];
  activeStops.forEach(stop => {
    const stopActivities = activitiesByStop[stop.id] || [];
    stopActivities.forEach(activity => {
      if (activity.startTime) {
        const activityDate = new Date(activity.startTime);
        if (activityDate.toDateString() === date.toDateString()) {
          dailyActivities.push({ activity, stop });
        }
      }
    });
  });

  // Sort activities by time
  dailyActivities.sort((a, b) => {
    if (!a.activity.startTime || !b.activity.startTime) return 0;
    return new Date(a.activity.startTime).getTime() - new Date(b.activity.startTime).getTime();
  });

  // Check if an activity has conflicts
  const hasConflict = (activity: Activity) => {
    return conflicts.some(conflict => 
      conflict.activity1.id === activity.id || conflict.activity2.id === activity.id
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (activeStops.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
          <MapPin className="h-full w-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No stops on this date
        </h3>
        <p className="text-gray-600">
          You're not visiting any destinations on this day.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Stops */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Active Destinations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeStops.map(stop => (
            <div
              key={stop.id}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => onStopClick?.(stop)}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">{stop.destinationName}</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                {new Date(stop.arrivalDate).toLocaleDateString()} - {new Date(stop.departureDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Schedule */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Schedule ({dailyActivities.length} activities)
        </h3>
        
        {dailyActivities.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No activities scheduled for this day</p>
            <p className="text-sm text-gray-500 mt-1">
              Add activities to your stops to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dailyActivities.map(({ activity, stop }) => (
              <div
                key={activity.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  hasConflict(activity)
                    ? 'border-red-300 bg-red-50 hover:bg-red-100'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => onActivityClick?.(activity)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {hasConflict(activity) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <h4 className={`font-medium ${
                        hasConflict(activity) ? 'text-red-900' : 'text-gray-900'
                      }`}>
                        {activity.name}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {activity.startTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatTime(new Date(activity.startTime))}
                            {activity.endTime && ` - ${formatTime(new Date(activity.endTime))}`}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{stop.destinationName}</span>
                      </div>
                    </div>
                    
                    {activity.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {activity.category}
                    </span>
                    {activity.estimatedCost && (
                      <span className="text-sm font-medium text-green-600">
                        {activity.currency || '$'}{activity.estimatedCost}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyView;