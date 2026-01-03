import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { Stop } from '@globe-trotter/shared';
import StopCard from './StopCard';
import EditStopModal from './EditStopModal';

interface StopsListProps {
  itineraryId: string;
  stops: Stop[];
}

const StopsList: React.FC<StopsListProps> = ({ itineraryId, stops }) => {
  const queryClient = useQueryClient();
  const [editingStop, setEditingStop] = useState<Stop | null>(null);

  const reorderStopsMutation = useMutation({
    mutationFn: async (reorderedStops: Stop[]) => {
      // Update order indexes for all stops
      const updates = reorderedStops.map((stop, index) => ({
        id: stop.id,
        orderIndex: index,
      }));
      
      await Promise.all(
        updates.map(update =>
          api.put(`/itineraries/${itineraryId}/stops/${update.id}`, {
            orderIndex: update.orderIndex,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary-stops', itineraryId] });
    },
  });

  const deleteStopMutation = useMutation({
    mutationFn: async (stopId: string) => {
      await api.delete(`/itineraries/${itineraryId}/stops/${stopId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary-stops', itineraryId] });
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(stops);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order indexes
    const reorderedStops = items.map((stop, index) => ({
      ...stop,
      orderIndex: index,
    }));

    reorderStopsMutation.mutate(reorderedStops);
  };

  const handleDeleteStop = (stopId: string) => {
    if (window.confirm('Are you sure you want to delete this stop? All associated activities will also be deleted.')) {
      deleteStopMutation.mutate(stopId);
    }
  };

  const sortedStops = [...stops].sort((a, b) => a.orderIndex - b.orderIndex);

  if (stops.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
          <MapPin className="h-full w-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No stops yet
        </h3>
        <p className="text-gray-600">
          Add your first destination to start planning your itinerary.
        </p>
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stops">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-4 ${
                snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
              }`}
            >
              {sortedStops.map((stop, index) => (
                <Draggable key={stop.id} draggableId={stop.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white border rounded-lg shadow-sm ${
                        snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="flex-shrink-0 mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>

                          {/* Stop Number */}
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                          </div>

                          {/* Stop Content */}
                          <div className="flex-1 min-w-0">
                            <StopCard
                              stop={stop}
                              onEdit={() => setEditingStop(stop)}
                              onDelete={() => handleDeleteStop(stop.id)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Edit Stop Modal */}
      {editingStop && (
        <EditStopModal
          isOpen={!!editingStop}
          onClose={() => setEditingStop(null)}
          stop={editingStop}
          itineraryId={itineraryId}
        />
      )}
    </>
  );
};

export default StopsList;