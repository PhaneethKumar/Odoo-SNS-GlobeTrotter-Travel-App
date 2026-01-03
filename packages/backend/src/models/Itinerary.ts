import { db } from '../database/connection';
import { randomUUID } from 'crypto';

export interface Itinerary {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateItineraryData {
  user_id: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  metadata?: any;
}

export interface UpdateItineraryData {
  title?: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  metadata?: any;
}

export class ItineraryModel {
  private static readonly TABLE_NAME = 'itineraries';

  /**
   * Validate date constraints for itinerary
   */
  private static validateDates(start_date: Date, end_date: Date): void {
    if (start_date > end_date) {
      throw new Error('Start date must be before or equal to end date');
    }
  }

  /**
   * Create a new itinerary
   */
  static async create(itineraryData: CreateItineraryData): Promise<Itinerary> {
    // Validate date constraints
    this.validateDates(itineraryData.start_date, itineraryData.end_date);

    const itineraryId = randomUUID();

    const [itinerary] = await db(this.TABLE_NAME)
      .insert({
        id: itineraryId,
        user_id: itineraryData.user_id,
        title: itineraryData.title.trim(),
        description: itineraryData.description?.trim(),
        start_date: itineraryData.start_date,
        end_date: itineraryData.end_date,
        status: itineraryData.status || 'draft',
        metadata: itineraryData.metadata,
      })
      .returning('*');

    return itinerary;
  }

  /**
   * Find itinerary by ID
   */
  static async findById(id: string): Promise<Itinerary | null> {
    const itinerary = await db(this.TABLE_NAME)
      .where('id', id)
      .first();

    return itinerary || null;
  }

  /**
   * Find all itineraries for a user
   */
  static async findByUserId(userId: string): Promise<Itinerary[]> {
    return db(this.TABLE_NAME)
      .where('user_id', userId)
      .orderBy('created_at', 'desc');
  }

  /**
   * Update itinerary
   */
  static async update(id: string, updateData: UpdateItineraryData): Promise<Itinerary | null> {
    // If updating dates, validate constraints
    if (updateData.start_date || updateData.end_date) {
      const existing = await this.findById(id);
      if (!existing) {
        return null;
      }

      const startDate = updateData.start_date || existing.start_date;
      const endDate = updateData.end_date || existing.end_date;
      this.validateDates(startDate, endDate);
    }

    const updatedRows = await db(this.TABLE_NAME)
      .where('id', id)
      .update({
        ...updateData,
        title: updateData.title?.trim(),
        description: updateData.description?.trim(),
        updated_at: new Date(),
      })
      .returning('*');

    return updatedRows[0] || null;
  }

  /**
   * Delete itinerary by ID (cascades to stops and activities)
   */
  static async delete(id: string): Promise<boolean> {
    const deletedRows = await db(this.TABLE_NAME)
      .where('id', id)
      .del();

    return deletedRows > 0;
  }

  /**
   * Check if user owns the itinerary
   */
  static async isOwner(itineraryId: string, userId: string): Promise<boolean> {
    const itinerary = await db(this.TABLE_NAME)
      .where('id', itineraryId)
      .where('user_id', userId)
      .first();

    return !!itinerary;
  }

  /**
   * Get itineraries by status for a user
   */
  static async findByUserIdAndStatus(
    userId: string,
    status: 'draft' | 'active' | 'completed' | 'cancelled'
  ): Promise<Itinerary[]> {
    return db(this.TABLE_NAME)
      .where('user_id', userId)
      .where('status', status)
      .orderBy('created_at', 'desc');
  }

  /**
   * Get upcoming itineraries for a user
   */
  static async findUpcoming(userId: string): Promise<Itinerary[]> {
    const today = new Date();
    return db(this.TABLE_NAME)
      .where('user_id', userId)
      .where('start_date', '>=', today)
      .whereIn('status', ['draft', 'active'])
      .orderBy('start_date', 'asc');
  }

  /**
   * Get past itineraries for a user
   */
  static async findPast(userId: string): Promise<Itinerary[]> {
    const today = new Date();
    return db(this.TABLE_NAME)
      .where('user_id', userId)
      .where('end_date', '<', today)
      .orderBy('end_date', 'desc');
  }
}