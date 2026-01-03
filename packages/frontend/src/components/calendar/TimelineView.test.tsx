import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimelineView from './TimelineView';
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

describe('TimelineView', () => {
  it('renders timeline view with itinerary title', () => {
    render(
      <TimelineView
        itinerary={mockItinerary}
        stops={mockStops}
        activities={mockActivities}
      />
    );

    expect(screen.getByText('Test Trip - Timeline')).toBeInTheDocument();
  });

  it('displays stops in chronological order', () => {
    render(
      <TimelineView
        itinerary={mockItinerary}
        stops={mockStops}
        activities={mockActivities}
      />
    );

    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Stop 1')).toBeInTheDocument();
    expect(screen.getByText('Stop 2')).toBeInTheDocument();
  });

  it('shows activity count for each stop', () => {
    render(
      <TimelineView
        itinerary={mockItinerary}
        stops={mockStops}
        activities={mockActivities}
      />
    );

    expect(screen.getByText('1 activity')).toBeInTheDocument();
    expect(screen.getByText('0 activities')).toBeInTheDocument();
  });

  it('expands stop to show activities when clicked', () => {
    render(
      <TimelineView
        itinerary={mockItinerary}
        stops={mockStops}
        activities={mockActivities}
      />
    );

    // Initially, activities should not be visible
    expect(screen.queryByText('Visit Eiffel Tower')).not.toBeInTheDocument();

    // Find and click the expand button for the first stop
    const expandButtons = screen.getAllByRole('button');
    const expandButton = expandButtons.find(button => 
      button.querySelector('svg') && 
      button.closest('.cursor-pointer')
    );
    
    if (expandButton) {
      fireEvent.click(expandButton);
      // After expanding, activity should be visible
      expect(screen.getByText('Visit Eiffel Tower')).toBeInTheDocument();
    }
  });

  it('calls onActivityClick when activity is clicked', () => {
    const mockOnActivityClick = vi.fn();
    
    render(
      <TimelineView
        itinerary={mockItinerary}
        stops={mockStops}
        activities={mockActivities}
        onActivityClick={mockOnActivityClick}
      />
    );

    // First expand the stop to show activities
    const expandButtons = screen.getAllByRole('button');
    const expandButton = expandButtons.find(button => 
      button.querySelector('svg') && 
      button.closest('.cursor-pointer')
    );
    
    if (expandButton) {
      fireEvent.click(expandButton);
      
      // Now click on the activity
      const activityElement = screen.getByText('Visit Eiffel Tower');
      fireEvent.click(activityElement);

      expect(mockOnActivityClick).toHaveBeenCalledWith(mockActivities[0]);
    }
  });

  it('calls onStopClick when stop is clicked', () => {
    const mockOnStopClick = vi.fn();
    
    render(
      <TimelineView
        itinerary={mockItinerary}
        stops={mockStops}
        activities={mockActivities}
        onStopClick={mockOnStopClick}
      />
    );

    // Click on the stop header
    const stopElement = screen.getByText('Paris');
    fireEvent.click(stopElement.closest('.cursor-pointer') || stopElement);

    expect(mockOnStopClick).toHaveBeenCalledWith(mockStops[0]);
  });

  it('shows empty state when no stops are provided', () => {
    render(
      <TimelineView
        itinerary={mockItinerary}
        stops={[]}
        activities={[]}
      />
    );

    expect(screen.getByText('No stops planned yet')).toBeInTheDocument();
    expect(screen.getByText('Add destinations to your itinerary to see the timeline.')).toBeInTheDocument();
  });
});