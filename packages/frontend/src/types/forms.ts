// Local form types to avoid import issues during development
export interface CreateItinerary {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateItinerary {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateStop {
  destinationName: string;
  destinationCode?: string;
  latitude?: number;
  longitude?: number;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
}

export interface UpdateStop {
  destinationName?: string;
  destinationCode?: string;
  latitude?: number;
  longitude?: number;
  arrivalDate?: string;
  departureDate?: string;
  orderIndex?: number;
}