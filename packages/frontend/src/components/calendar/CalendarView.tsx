import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Grid } from 'lucide-react';
import { Button } from '../ui';
import { Itinerary, Stop, Activity } from '@globe-trotter/shared';
import DailyView from './DailyView';
import WeeklyView from './WeeklyView';
import OverviewView from './OverviewView';

export type ViewMode = 'daily' | 'weekly' | 'overview';

interface CalendarViewProps {
  itinerary: Itinerary;
  stops: Stop[];
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
  onStopClick?: (stop: Stop) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  itinerary,
  stops,
  activities,
  onActivityClick,
  onStopClick,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [currentDate, setCurrentDate] = useState(new Date(itinerary.startDate));

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

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const canNavigatePrevious = () => {
    const tripStart = new Date(itinerary.startDate);
    if (viewMode === 'daily') {
      return currentDate > tripStart;
    } else if (viewMode === 'weekly') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - 7);
      return weekStart >= tripStart;
    }
    return false;
  };

  const canNavigateNext = () => {
    const tripEnd = new Date(itinerary.endDate);
    if (viewMode === 'daily') {
      return currentDate < tripEnd;
    } else if (viewMode === 'weekly') {
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return weekEnd <= tripEnd;
    }
    return false;
  };

  const formatCurrentPeriod = () => {
    if (viewMode === 'daily') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (viewMode === 'weekly') {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return `${new Date(itinerary.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(itinerary.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {itinerary.title} - Calendar View
              </h2>
              <p className="text-sm text-gray-600">
                {formatCurrentPeriod()}
              </p>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'daily' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('daily')}
                className="px-3 py-1 text-xs"
              >
                <List className="h-3 w-3 mr-1" />
                Daily
              </Button>
              <Button
                variant={viewMode === 'weekly' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('weekly')}
                className="px-3 py-1 text-xs"
              >
                <Grid className="h-3 w-3 mr-1" />
                Weekly
              </Button>
              <Button
                variant={viewMode === 'overview' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('overview')}
                className="px-3 py-1 text-xs"
              >
                <CalendarIcon className="h-3 w-3 mr-1" />
                Overview
              </Button>
            </div>

            {/* Navigation */}
            {viewMode !== 'overview' && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={!canNavigatePrevious()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!canNavigateNext()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Conflicts Warning */}
        {conflicts.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-800 font-medium">
                {conflicts.length} scheduling conflict{conflicts.length > 1 ? 's' : ''} detected
              </p>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Activities with overlapping times are highlighted in red
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'daily' && (
          <DailyView
            date={currentDate}
            stops={sortedStops}
            activitiesByStop={activitiesByStop}
            conflicts={conflicts}
            onActivityClick={onActivityClick}
            onStopClick={onStopClick}
          />
        )}
        {viewMode === 'weekly' && (
          <WeeklyView
            startDate={currentDate}
            stops={sortedStops}
            activitiesByStop={activitiesByStop}
            conflicts={conflicts}
            onActivityClick={onActivityClick}
            onStopClick={onStopClick}
          />
        )}
        {viewMode === 'overview' && (
          <OverviewView
            itinerary={itinerary}
            stops={sortedStops}
            activitiesByStop={activitiesByStop}
            conflicts={conflicts}
            onActivityClick={onActivityClick}
            onStopClick={onStopClick}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarView;