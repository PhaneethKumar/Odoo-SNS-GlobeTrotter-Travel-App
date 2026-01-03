import { z } from 'zod';

// User schemas
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Itinerary schemas
export const createItinerarySchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().optional(),
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date'),
  })
  .refine(data => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const updateItinerarySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title too long')
    .optional(),
  description: z.string().optional(),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
});

// Stop schemas
export const createStopSchema = z
  .object({
    destinationName: z.string().min(1, 'Destination name is required'),
    destinationCode: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    arrivalDate: z.string().datetime('Invalid arrival date'),
    departureDate: z.string().datetime('Invalid departure date'),
    orderIndex: z.number().int().min(0),
  })
  .refine(data => new Date(data.arrivalDate) <= new Date(data.departureDate), {
    message: 'Departure date must be after arrival date',
    path: ['departureDate'],
  });

export const updateStopSchema = z.object({
  destinationName: z.string().min(1, 'Destination name is required').optional(),
  destinationCode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  arrivalDate: z.string().datetime('Invalid arrival date').optional(),
  departureDate: z.string().datetime('Invalid departure date').optional(),
  orderIndex: z.number().int().min(0).optional(),
});

// Activity schemas
export const createActivitySchema = z
  .object({
    name: z.string().min(1, 'Activity name is required'),
    description: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    estimatedCost: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    bookingUrl: z.string().url().optional(),
  })
  .refine(
    data => {
      if (data.startTime && data.endTime) {
        return new Date(data.startTime) <= new Date(data.endTime);
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export const updateActivitySchema = z.object({
  name: z.string().min(1, 'Activity name is required').optional(),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required').optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  estimatedCost: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  bookingUrl: z.string().url().optional(),
});

// Budget schemas
export const createBudgetSchema = z.object({
  totalBudget: z.number().min(0, 'Budget must be positive'),
  currency: z.string().length(3, 'Invalid currency code'),
  categoryBudgets: z.record(z.number().min(0)).optional(),
});

export const updateBudgetSchema = z.object({
  totalBudget: z.number().min(0, 'Budget must be positive').optional(),
  currency: z.string().length(3, 'Invalid currency code').optional(),
  categoryBudgets: z.record(z.number().min(0)).optional(),
});

// Search schemas
export const searchActivitiesSchema = z.object({
  location: z.string().optional(),
  category: z.string().optional(),
  minCost: z.number().min(0).optional(),
  maxCost: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type CreateItinerary = z.infer<typeof createItinerarySchema>;
export type UpdateItinerary = z.infer<typeof updateItinerarySchema>;
export type CreateStop = z.infer<typeof createStopSchema>;
export type UpdateStop = z.infer<typeof updateStopSchema>;
export type CreateActivity = z.infer<typeof createActivitySchema>;
export type UpdateActivity = z.infer<typeof updateActivitySchema>;
export type CreateBudget = z.infer<typeof createBudgetSchema>;
export type UpdateBudget = z.infer<typeof updateBudgetSchema>;
export type SearchActivities = z.infer<typeof searchActivitiesSchema>;
