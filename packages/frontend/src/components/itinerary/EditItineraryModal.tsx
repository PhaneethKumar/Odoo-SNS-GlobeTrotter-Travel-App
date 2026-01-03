import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button, Input } from '../ui';
import { api } from '../../lib/api';
import { UpdateItinerary } from '../../types/forms';
import { validateUpdateItinerary } from '../../utils/validation';
import { Itinerary } from '@globe-trotter/shared';

interface EditItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: Itinerary;
}

const EditItineraryModal: React.FC<EditItineraryModalProps> = ({
  isOpen,
  onClose,
  itinerary,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateItinerary>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && itinerary) {
      setFormData({
        title: itinerary.title,
        description: itinerary.description || '',
        startDate: new Date(itinerary.startDate).toISOString(),
        endDate: new Date(itinerary.endDate).toISOString(),
      });
    }
  }, [isOpen, itinerary]);

  const updateItineraryMutation = useMutation({
    mutationFn: async (data: UpdateItinerary) => {
      const response = await api.put(`/itineraries/${itinerary.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', itinerary.id] });
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const resetForm = () => {
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateUpdateItinerary(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    updateItineraryMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof UpdateItinerary, value: string) => {
    setFormData((prev: UpdateItinerary) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Itinerary
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                id="title"
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter itinerary title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your trip (optional)"
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : ''
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value + 'T00:00:00.000Z')}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value + 'T23:59:59.999Z')}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateItineraryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateItineraryMutation.isPending}
              >
                {updateItineraryMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItineraryModal;