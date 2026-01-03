import { db } from '../database/connection';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
}

export { ItineraryModel } from './Itinerary';
export { StopModel } from './Stop';

export class UserModel {
  private static readonly SALT_ROUNDS = 12;
  private static readonly TABLE_NAME = 'users';

  /**
   * Hash a plain text password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a plain text password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Create a new user with hashed password
   */
  static async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    const userId = randomUUID();

    const [user] = await db(this.TABLE_NAME)
      .insert({
        id: userId,
        email: userData.email.toLowerCase().trim(),
        password_hash: hashedPassword,
        first_name: userData.first_name.trim(),
        last_name: userData.last_name.trim(),
        profile_image_url: userData.profile_image_url,
      })
      .returning('*');

    return user;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const user = await db(this.TABLE_NAME)
      .where('email', email.toLowerCase().trim())
      .first();

    return user || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const user = await db(this.TABLE_NAME)
      .where('id', id)
      .first();

    return user || null;
  }

  /**
   * Update user information
   */
  static async update(id: string, updateData: UpdateUserData): Promise<User | null> {
    const updatedRows = await db(this.TABLE_NAME)
      .where('id', id)
      .update({
        ...updateData,
        updated_at: new Date(),
      })
      .returning('*');

    return updatedRows[0] || null;
  }

  /**
   * Delete user by ID
   */
  static async delete(id: string): Promise<boolean> {
    const deletedRows = await db(this.TABLE_NAME)
      .where('id', id)
      .del();

    return deletedRows > 0;
  }

  /**
   * Check if email already exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const user = await db(this.TABLE_NAME)
      .where('email', email.toLowerCase().trim())
      .first();

    return !!user;
  }

  /**
   * Get user profile (without password hash)
   */
  static async getProfile(id: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await db(this.TABLE_NAME)
      .select('id', 'email', 'first_name', 'last_name', 'profile_image_url', 'created_at', 'updated_at')
      .where('id', id)
      .first();

    return user || null;
  }
}