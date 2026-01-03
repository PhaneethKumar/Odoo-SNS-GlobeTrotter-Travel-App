import React from 'react';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Stop, Activity } from '@globe-trotter/shared';

interface WeeklyViewProps {
  startDate: Date;
  stops: Stop[];
  activitiesByStop: Record<string, Activity[]>;
  conflicts: Array<{ activity1: Activity; activity2: Activity }>;
  onActivityClick?: (activity: Activity) => void;
  onStopClick?: (stop: Stop) => void;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({
  startDate,
  stops,
  activitiesByStop,
  conflicts,
  onActivityClick,
  onStopClick,
}) => {
  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Check if an activity has conflicts
  const hasConflict = (activity: Activity) => {
    return conflicts.some(conflict => 
      conflict.activity1.id === activity.id || conflict.activity2.id === activity.id
    );
  };

  // Get activities for a specific date
  const getActivitiesForDate = (date: Date) => {
    const dailyActivities: Array<{ activity: Activity; stop: Stop }> = [];
    
    stops.forEach(stop => {
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

    // Sort by time
    return dailyActivities.sort((a, b) => {
      if (!a.activity.startTime || !b.activity.startTime) return 0;
      return new Date(a.activity.startTime).getTime() - new Date(b.activity.startTime).getTime();
    });
  };

  // Get active stops for a specific date
  const getActiveStopsForDate = (date: Date) => {
    return stops.filter(stop => {
      const arrivalDate = new Date(stop.arrivalDate);
      const departureDate = new Date(stop.departureDate);
      const currentDate = new Date(date);
      
      // Reset time to compare dates only
      arrivalDate.setHours(0, 0, 0, 0);
      departureDate.setHours(23, 59, 59, 999);
      currentDate.setHours(12, 0, 0, 0);
      
      return currentDate >= arrivalDate && currentDate <= departureDate;
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDayHeader = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
      {weekDays.map((date, dayIndex) => {
        const activities = getActivitiesForDate(date);
        const activeStops = getActiveStopsForDate(date);
        const isToday = date.toDateString() === new Date().toDateString();

        return (
          <div
            key={dayIndex}
            className={`border rounded-lg overflow-hidden ${
              isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            {/* Day Header */}
            <div className={`p-3 border-b ${
              isToday ? 'bg-blue-100 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`font-medium text-sm ${
                isToday ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {formatDayHeader(date)}
              </h3>
              {isToday && (
                <span className="text-xs text-blue-600 font-medium">Today</span>
              )}
            </div>

            {/* Day Content */}
            <div className="p-3 space-y-3 min-h-[200px]">
              {/* Active Stops */}
              {activeStops.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-2">Destinations</h4>
                  <div className="space-y-1">
                    {activeStops.map(stop => (
                      <div
                        key={stop.id}
                        className="p-2 bg-blue-50 border border-blue-200 rounded text-xs cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => onStopClick?.(stop)}
                      >
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-blue-600" />
                          <span className="font-medium text-blue-900 truncate">
                            {stop.destinationName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities */}
              {activities.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-2">
                    Activities ({activities.length})
                  </h4>
                  <div className="space-y-2">
                    {activities.slice(0, 3).map(({ activity }) => (
                      <div
                        key={activity.id}
                        className={`p-2 border rounded text-xs cursor-pointer transition-all hover:shadow-sm ${
                          hasConflict(activity)
                            ? 'border-red-300 bg-red-50 hover:bg-red-100'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => onActivityClick?.(activity)}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              {hasConflict(activity) && (
                                <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                              )}
                              <span className={`font-medium truncate ${
                                hasConflict(activity) ? 'text-red-900' : 'text-gray-900'
                              }`}>
                                {activity.name}
                              </span>
                            </div>
                            
                            {activity.startTime && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="h-2.5 w-2.5" />
                                <span className="text-xs">
                                  {formatTime(new Date(activity.startTime))}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {activity.estimatedCost && (
                            <span className="text-xs font-medium text-green-600 flex-shrink-0">
                              {activity.currency || '$'}{activity.estimatedCost}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {activities.length > 3 && (
                      <div className="text-center">
                        <span className="text-xs text-gray-500">
                          +{activities.length - 3} more activities
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {activeStops.length === 0 && activities.length === 0 && (
                <div className="text-center py-6">
                  <div className="text-gray-400 mb-2">
                    <MapPin className="h-6 w-6 mx-auto" />
                  </div>
                  <p className="text-xs text-gray-500">No activities</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyView;