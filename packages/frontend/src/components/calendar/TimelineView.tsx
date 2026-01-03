import React, { useState, useMemo } from 'react';
import { MapPin, Clock, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { Itinerary, Stop, Activity } from '@globe-trotter/shared';

interface TimelineViewProps {
  itinerary: Itinerary;
  stops: Stop[];
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
  onStopClick?: (stop: Stop) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  itinerary,
  stops,
  activities,
  onActivityClick,
  onStopClick,
}) => {
  const [expandedStops, setExpandedStops] = useState<Set<string>>(new Set());

  // Sort stops chronologically
  const sortedStops = useMemo(() => {
    return [...stops].sort((a, b) => 
      new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime()
    );
  }, [stops]);

  // Group activities by stop and sort chronologically
  const activitiesByStop = useMemo(() => {
    const grouped: Record<string, Activity[]> = {};
    activities.forEach(activity => {
      if (!grouped[activity.stopId]) {
        grouped[activity.stopId] = [];
      }
      grouped[activity.stopId].push(activity);
    });

    // Sort activities within each stop
    Object.keys(grouped).forEach(stopId => {
      grouped[stopId].sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
    });

    return grouped;
  }, [activities]);

  // Detect scheduling conflicts
  const conflicts = useMemo(() => {
    const conflictPairs: Array<{ activity1: Activity; activity2: Activity }> = [];
    
    Object.values(activitiesByStop).forEach(stopActivities => {
      for (let i = 0; i < stopActivities.length; i++) {
        for (let j = i + 1; j < stopActivities.length; j++) {
          const activity1 = stopActivities[i];
          const activity2 = stopActivities[j];
          
          if (activity1.startTime && activity1.endTime && 
              activity2.startTime && activity2.endTime) {
            const start1 = new Date(activity1.startTime);
            const end1 = new Date(activity1.endTime);
            const start2 = new Date(activity2.startTime);
            const end2 = new Date(activity2.endTime);
            
            // Check for overlap
            if (start1 < end2 && start2 < end1) {
              conflictPairs.push({ activity1, activity2 });
            }
          }
        }
      }
    });
    
    return conflictPairs;
  }, [activitiesByStop]);

  // Check if an activity has conflicts
  const hasConflict = (activity: Activity) => {
    return conflicts.some(conflict => 
      conflict.activity1.id === activity.id || conflict.activity2.id === activity.id
    );
  };

  const toggleStopExpansion = (stopId: string) => {
    const newExpanded = new Set(expandedStops);
    if (newExpanded.has(stopId)) {
      newExpanded.delete(stopId);
    } else {
      newExpanded.add(stopId);
    }
    setExpandedStops(newExpanded);
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

  const getDaysBetween = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (sortedStops.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
          <MapPin className="h-full w-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No stops planned yet
        </h3>
        <p className="text-gray-600">
          Add destinations to your itinerary to see the timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-purple-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {itinerary.title} - Timeline
            </h2>
            <p className="text-sm text-gray-600">
              {formatDate(new Date(itinerary.startDate))} - {formatDate(new Date(itinerary.endDate))}
            </p>
          </div>
        </div>

        {/* Conflicts Warning */}
        {conflicts.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-800 font-medium">
                {conflicts.length} scheduling conflict{conflicts.length > 1 ? 's' : ''} detected
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Content */}
      <div className="p-4">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          <div className="space-y-6">
            {sortedStops.map((stop, index) => {
              const stopActivities = activitiesByStop[stop.id] || [];
              const isExpanded = expandedStops.has(stop.id);
              const conflictedActivities = stopActivities.filter(hasConflict);
              const duration = getDaysBetween(new Date(stop.arrivalDate), new Date(stop.departureDate));

              return (
                <div key={stop.id} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute left-4 top-2 z-10">
                    <div className="w-4 h-4 bg-purple-600 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  
                  {/* Stop Card */}
                  <div className="ml-12">
                    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                      {/* Stop Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => onStopClick?.(stop)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {stop.destinationName}
                              </h3>
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                Stop {index + 1}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {formatDate(new Date(stop.arrivalDate))} - {formatDate(new Date(stop.departureDate))}
                                </span>
                              </div>
                              <span>
                                {duration} {duration === 1 ? 'day' : 'days'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {stopActivities.length} {stopActivities.length === 1 ? 'activity' : 'activities'}
                              </p>
                              {conflictedActivities.length > 0 && (
                                <div className="flex items-center gap-1 text-red-600 text-xs">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>{conflictedActivities.length} conflicts</span>
                                </div>
                              )}
                            </div>
                            
                            {stopActivities.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStopExpansion(stop.id);
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Activities */}
                      {isExpanded && stopActivities.length > 0 && (
                        <div className="border-t bg-gray-50">
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              Planned Activities
                            </h4>
                            <div className="space-y-3">
                              {stopActivities.map(activity => (
                                <div
                                  key={activity.id}
                                  className={`p-3 border rounded cursor-pointer transition-all hover:shadow-sm ${
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
                                        <h5 className={`font-medium ${
                                          hasConflict(activity) ? 'text-red-900' : 'text-gray-900'
                                        }`}>
                                          {activity.name}
                                        </h5>
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
                          </div>
                        </div>
                      )}
                      
                      {/* Empty Activities State */}
                      {stopActivities.length === 0 && (
                        <div className="border-t bg-gray-50 p-4 text-center">
                          <Clock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">No activities planned yet</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Add activities to this stop to see them here
                          </p>
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
    </div>
  );
};

export default TimelineView;