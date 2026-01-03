import { CreateItinerary, UpdateItinerary, CreateStop, UpdateStop } from '../types/forms';

export const validateCreateItinerary = (data: CreateItinerary): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  }
  if (data.title && data.title.length > 255) {
    errors.title = 'Title too long';
  }
  if (!data.startDate) {
    errors.startDate = 'Start date is required';
  }
  if (!data.endDate) {
    errors.endDate = 'End date is required';
  }
  if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
    errors.endDate = 'End date must be after start date';
  }

  return errors;
};

export const validateUpdateItinerary = (data: UpdateItinerary): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (data.title !== undefined && (!data.title || data.title.trim().length === 0)) {
    errors.title = 'Title is required';
  }
  if (data.title && data.title.length > 255) {
    errors.title = 'Title too long';
  }
  if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
    errors.endDate = 'End date must be after start date';
  }

  return errors;
};

export const validateCreateStop = (data: CreateStop): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.destinationName || data.destinationName.trim().length === 0) {
    errors.destinationName = 'Destination name is required';
  }
  if (!data.arrivalDate) {
    errors.arrivalDate = 'Arrival date is required';
  }
  if (!data.departureDate) {
    errors.departureDate = 'Departure date is required';
  }
  if (data.arrivalDate && data.departureDate && new Date(data.arrivalDate) > new Date(data.departureDate)) {
    errors.departureDate = 'Departure date must be after arrival date';
  }
  if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
    errors.latitude = 'Latitude must be between -90 and 90';
  }
  if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
    errors.longitude = 'Longitude must be between -180 and 180';
  }

  return errors;
};

export const validateUpdateStop = (data: UpdateStop): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (data.destinationName !== undefined && (!data.destinationName || data.destinationName.trim().length === 0)) {
    errors.destinationName = 'Destination name is required';
  }
  if (data.arrivalDate && data.departureDate && new Date(data.arrivalDate) > new Date(data.departureDate)) {
    errors.departureDate = 'Departure date must be after arrival date';
  }
  if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
    errors.latitude = 'Latitude must be between -90 and 90';
  }
  if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
    errors.longitude = 'Longitude must be between -180 and 180';
  }

  return errors;
};