import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button, Input } from '../ui';
import { api } from '../../lib/api';
import { CreateStop } from '../../types/forms';
import { validateCreateStop } from '../../utils/validation';

interface AddStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
}

const AddStopModal: React.FC<AddStopModalProps> = ({
  isOpen,
  onClose,
  itineraryId,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateStop>({
    destinationName: '',
    destinationCode: '',
    latitude: undefined,
    longitude: undefined,
    arrivalDate: '',
    departureDate: '',
    orderIndex: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addStopMutation = useMutation({
    mutationFn: async (data: CreateStop) => {
      const response = await api.post(`/itineraries/${itineraryId}/stops`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary-stops', itineraryId] });
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
    setFormData({
      destinationName: '',
      destinationCode: '',
      latitude: undefined,
      longitude: undefined,
      arrivalDate: '',
      departureDate: '',
      orderIndex: 0,
    });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateCreateStop(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    addStopMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof CreateStop, value: string | number | undefined) => {
    setFormData((prev: CreateStop) => ({ ...prev, [field]: value }));
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Add New Stop
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
              <label htmlFor="destinationName" className="block text-sm font-medium text-gray-700 mb-1">
                Destination Name *
              </label>
              <Input
                id="destinationName"
                type="text"
                value={formData.destinationName}
                onChange={(e) => handleInputChange('destinationName', e.target.value)}
                placeholder="e.g., Paris, Tokyo, New York"
                className={errors.destinationName ? 'border-red-500' : ''}
              />
              {errors.destinationName && (
                <p className="text-red-500 text-sm mt-1">{errors.destinationName}</p>
              )}
            </div>

            <div>
              <label htmlFor="destinationCode" className="block text-sm font-medium text-gray-700 mb-1">
                Destination Code
              </label>
              <Input
                id="destinationCode"
                type="text"
                value={formData.destinationCode || ''}
                onChange={(e) => handleInputChange('destinationCode', e.target.value)}
                placeholder="e.g., PAR, TYO, NYC (optional)"
                className={errors.destinationCode ? 'border-red-500' : ''}
              />
              {errors.destinationCode && (
                <p className="text-red-500 text-sm mt-1">{errors.destinationCode}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="arrivalDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Date *
                </label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formData.arrivalDate.split('T')[0]}
                  onChange={(e) => handleInputChange('arrivalDate', e.target.value + 'T00:00:00.000Z')}
                  className={errors.arrivalDate ? 'border-red-500' : ''}
                />
                {errors.arrivalDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.arrivalDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Date *
                </label>
                <Input
                  id="departureDate"
                  type="date"
                  value={formData.departureDate.split('T')[0]}
                  onChange={(e) => handleInputChange('departureDate', e.target.value + 'T23:59:59.999Z')}
                  className={errors.departureDate ? 'border-red-500' : ''}
                />
                {errors.departureDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.departureDate}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g., 48.8566"
                  className={errors.latitude ? 'border-red-500' : ''}
                />
                {errors.latitude && (
                  <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>
                )}
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g., 2.3522"
                  className={errors.longitude ? 'border-red-500' : ''}
                />
                {errors.longitude && (
                  <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={addStopMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addStopMutation.isPending}
              >
                {addStopMutation.isPending ? 'Adding...' : 'Add Stop'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStopModal;