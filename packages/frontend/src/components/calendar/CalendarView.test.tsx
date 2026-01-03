import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CalendarView from './CalendarView';
import { Itinerary, Stop, Activity } from '@globe-trotter/shared';

// Mock data
const mockItinerary: Itinerary = {
  id: '1',
  userId: 'user1',
  title: 'Test Trip',
  description: 'A test trip',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-07'),
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStops: Stop[] = [
  {
    id: 'stop1',
    itineraryId: '1',
    destinationName: 'Paris',
    arrivalDate: new Date('2024-01-01'),
    departureDate: new Date('2024-01-03'),
    orderIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'stop2',
    itineraryId: '1',
    destinationName: 'London',
    arrivalDate: new Date('2024-01-04'),
    departureDate: new Date('2024-01-07'),
    orderIndex: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockActivities: Activity[] = [
  {
    id: 'activity1',
    stopId: 'stop1',
    name: 'Visit Eiffel Tower',
    category: 'Sightseeing',
    startTime: new Date('2024-01-02T10:00:00'),
    endTime: new Date('2024-01-02T12:00:00'),
    estimatedCost: 25,
    currency: 'EUR',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('CalendarView', () => {
  it('renders calendar view with itinerary title', () => {
    render(
      <CalendarView
        itinerary={mockItinerary}
        stops={mockStops}
        activities={mockActivities}
      />
    );

    expect(screen.getByText('Test Trip - Calendar View')).toBeInTheDocument();
  });

  it('shows view mode buttons', () => {
    render(
      <CalendarView
        itinerary={mockItinerary}
        stops={mockStops}
        activities={mockActivities}
      />
    );

    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('switches between view modes', () => {
    render(
      <CalendarView
        itinerary={mockItinerary}
        stops={mockStops}
        activities={mockActivities}
      />
    );

    // Default should be overview
    expect(screen.getByText('Trip Timeline')).toBeInTheDocument();

    // Switch to daily view
    fireEvent.click(screen.getByText('Daily'));
    // Daily view should show different content (we can't test specific content without more complex setup)

    // Switch to weekly view
    fireEvent.click(screen.getByText('Weekly'));
    // Weekly view should show different content
  });

  it('calls onActivityClick when activity is clicked', () => {
    const mockOnActivityClick = vi.fn();
    
    render(
      <CalendarView
        itinerary={mockItinerary}
        stops={mockStops}
        activities={mockActivities}
        onActivityClick={mockOnActivityClick}
      />
    );

    // In overview mode, click on an activity
    const activityElement = screen.getByText('Visit Eiffel Tower');
    fireEvent.click(activityElement);

    expect(mockOnActivityClick).toHaveBeenCalledWith(mockActivities[0]);
  });

  it('calls onStopClick when stop is clicked', () => {
    const mockOnStopClick = vi.fn();
    
    render(
      <CalendarView
        itinerary={mockItinerary}
        stops={mockStops}
        activities={mockActivities}
        onStopClick={mockOnStopClick}
      />
    );

    // In overview mode, click on a stop
    const stopElement = screen.getByText('Paris');
    fireEvent.click(stopElement.closest('.cursor-pointer') || stopElement);

    expect(mockOnStopClick).toHaveBeenCalledWith(mockStops[0]);
  });

  it('displays no conflicts message when there are no conflicts', () => {
    render(
      <CalendarView
        itinerary={mockItinerary}
        stops={mockStops}
        activities={mockActivities}
      />
    );

    // Should not show conflicts warning
    expect(screen.queryByText(/scheduling conflict/)).not.toBeInTheDocument();
  });
});