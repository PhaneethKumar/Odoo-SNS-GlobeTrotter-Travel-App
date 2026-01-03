// Core entity types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Itinerary {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stop {
  id: string;
  itineraryId: string;
  destinationName: string;
  destinationCode?: string;
  latitude?: number;
  longitude?: number;
  arrivalDate: Date;
  departureDate: Date;
  orderIndex: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  stopId: string;
  name: string;
  description?: string;
  category: string;
  startTime?: Date;
  endTime?: Date;
  estimatedCost?: number;
  currency?: string;
  bookingUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  itineraryId: string;
  totalBudget: number;
  currency: string;
  categoryBudgets?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  activityId?: string;
  category: string;
  amount: number;
  currency: string;
  description?: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
