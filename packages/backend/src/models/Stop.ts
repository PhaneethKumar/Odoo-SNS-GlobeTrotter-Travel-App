import { db } from '../database/connection';
import { randomUUID } from 'crypto';

export interface Stop {
  id: string;
  itinerary_id: string;
  destination_name: string;
  destination_code?: string;
  latitude?: number;
  longitude?: number;
  arrival_date: Date;
  departure_date: Date;
  order_index: number;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStopData {
  itinerary_id: string;
  destination_name: string;
  destination_code?: string;
  latitude?: number;
  longitude?: number;
  arrival_date: Date;
  departure_date: Date;
  order_index: number;
  metadata?: any;
}

export interface UpdateStopData {
  destination_name?: string;
  destination_code?: string;
  latitude?: number;
  longitude?: number;
  arrival_date?: Date;
  departure_date?: Date;
  order_index?: number;
  metadata?: any;
}

export class StopModel {
  private static readonly TABLE_NAME = 'stops';

  /**
   * Validate date constraints for stop
   */
  private static validateDates(arrival_date: Date, departure_date: Date): void {
    if (arrival_date > departure_date) {
      throw new Error('Arrival date must be before or equal to departure date');
    }
  }

  /**
   * Validate that stop dates fall within itinerary timeframe
   */
  private static async validateItineraryDateConstraints(
    itineraryId: string,
    arrivalDate: Date,
    departureDate: Date
  ): Promise<void> {
    const itinerary = await db('itineraries')
      .where('id', itineraryId)
      .first();

    if (!itinerary) {
      throw new Error('Itinerary not found');
    }

    const itineraryStart = new Date(itinerary.start_date);
    const itineraryEnd = new Date(itinerary.end_date);

    if (arrivalDate < itineraryStart || arrivalDate > itineraryEnd) {
      throw new Error('Stop arrival date must fall within itinerary timeframe');
    }

    if (departureDate < itineraryStart || departureDate > itineraryEnd) {
      throw new Error('Stop departure date must fall within itinerary timeframe');
    }
  }

  /**
   * Get the next order index for a new stop in an itinerary
   */
  private static async getNextOrderIndex(itineraryId: string): Promise<number> {
    const result = await db(this.TABLE_NAME)
      .where('itinerary_id', itineraryId)
      .max('order_index as max_order')
      .first();

    return (result?.max_order || 0) + 1;
  }

  /**
   * Create a new stop
   */
  static async create(stopData: CreateStopData): Promise<Stop> {
    // Validate date constraints
    this.validateDates(stopData.arrival_date, stopData.departure_date);

    // Validate itinerary date constraints
    await this.validateItineraryDateConstraints(
      stopData.itinerary_id,
      stopData.arrival_date,
      stopData.departure_date
    );

    const stopId = randomUUID();

    // If no order_index provided, get the next available index
    const orderIndex = stopData.order_index || await this.getNextOrderIndex(stopData.itinerary_id);

    const [stop] = await db(this.TABLE_NAME)
      .insert({
        id: stopId,
        itinerary_id: stopData.itinerary_id,
        destination_name: stopData.destination_name.trim(),
        destination_code: stopData.destination_code?.trim(),
        latitude: stopData.latitude,
        longitude: stopData.longitude,
        arrival_date: stopData.arrival_date,
        departure_date: stopData.departure_date,
        order_index: orderIndex,
        metadata: stopData.metadata,
      })
      .returning('*');

    return stop;
  }

  /**
   * Find stop by ID
   */
  static async findById(id: string): Promise<Stop | null> {
    const stop = await db(this.TABLE_NAME)
      .where('id', id)
      .first();

    return stop || null;
  }

  /**
   * Find all stops for an itinerary, ordered by order_index
   */
  static async findByItineraryId(itineraryId: string): Promise<Stop[]> {
    return db(this.TABLE_NAME)
      .where('itinerary_id', itineraryId)
      .orderBy('order_index', 'asc');
  }

  /**
   * Update stop
   */
  static async update(id: string, updateData: UpdateStopData): Promise<Stop | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    // If updating dates, validate constraints
    if (updateData.arrival_date || updateData.departure_date) {
      const arrivalDate = updateData.arrival_date || existing.arrival_date;
      const departureDate = updateData.departure_date || existing.departure_date;
      
      this.validateDates(arrivalDate, departureDate);
      
      // Validate itinerary date constraints
      await this.validateItineraryDateConstraints(
        existing.itinerary_id,
        arrivalDate,
        departureDate
      );
    }

    const updatedRows = await db(this.TABLE_NAME)
      .where('id', id)
      .update({
        ...updateData,
        destination_name: updateData.destination_name?.trim(),
        destination_code: updateData.destination_code?.trim(),
        updated_at: new Date(),
      })
      .returning('*');

    return updatedRows[0] || null;
  }

  /**
   * Delete stop by ID
   */
  static async delete(id: string): Promise<boolean> {
    const deletedRows = await db(this.TABLE_NAME)
      .where('id', id)
      .del();

    return deletedRows > 0;
  }

  /**
   * Reorder stops in an itinerary
   */
  static async reorder(itineraryId: string, stopIds: string[]): Promise<void> {
    const transaction = await db.transaction();

    try {
      // Update order_index for each stop
      for (let i = 0; i < stopIds.length; i++) {
        await transaction(this.TABLE_NAME)
          .where('id', stopIds[i])
          .where('itinerary_id', itineraryId)
          .update({ order_index: i + 1 });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get stops within a date range for an itinerary
   */
  static async findByDateRange(
    itineraryId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Stop[]> {
    return db(this.TABLE_NAME)
      .where('itinerary_id', itineraryId)
      .where('arrival_date', '>=', startDate)
      .where('departure_date', '<=', endDate)
      .orderBy('order_index', 'asc');
  }

  /**
   * Check if a stop belongs to a specific itinerary
   */
  static async belongsToItinerary(stopId: string, itineraryId: string): Promise<boolean> {
    const stop = await db(this.TABLE_NAME)
      .where('id', stopId)
      .where('itinerary_id', itineraryId)
      .first();

    return !!stop;
  }

  /**
   * Get chronologically ordered stops for an itinerary
   */
  static async findChronological(itineraryId: string): Promise<Stop[]> {
    return db(this.TABLE_NAME)
      .where('itinerary_id', itineraryId)
      .orderBy('arrival_date', 'asc')
      .orderBy('order_index', 'asc');
  }
}