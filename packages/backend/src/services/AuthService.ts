import jwt from 'jsonwebtoken';
import { redis } from '../database/connection';
import { UserModel, User } from '../models/User';
import { randomUUID } from 'crypto';

export interface TokenPayload {
  userId: string;
  email: string;
  tokenId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  private static readonly ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

  /**
   * Generate access and refresh tokens for a user
   */
  static async generateTokens(user: User): Promise<AuthTokens> {
    const tokenId = randomUUID();
    
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      tokenId,
    };

    // Generate access token
    const accessToken = (jwt as any).sign(
      payload,
      this.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );

    // Generate refresh token
    const refreshToken = (jwt as any).sign(
      payload,
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token in Redis with expiration
    const refreshTokenKey = `refresh_token:${user.id}:${tokenId}`;
    await redis.setEx(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken); // 7 days

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    };
  }

  /**
   * Verify access token and return payload
   */
  static async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      
      // Check if user still exists
      const user = await UserModel.findById(payload.userId);
      if (!user) {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token and return payload
   */
  static async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = jwt.verify(token, this.JWT_REFRESH_SECRET) as TokenPayload;
      
      // Check if refresh token exists in Redis
      const refreshTokenKey = `refresh_token:${payload.userId}:${payload.tokenId}`;
      const storedToken = await redis.get(refreshTokenKey);
      
      if (!storedToken || storedToken !== token) {
        return null;
      }

      // Check if user still exists
      const user = await UserModel.findById(payload.userId);
      if (!user) {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<AuthTokens | null> {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) {
      return null;
    }

    const user = await UserModel.findById(payload.userId);
    if (!user) {
      return null;
    }

    // Revoke old refresh token
    await this.revokeRefreshToken(payload.userId, payload.tokenId);

    // Generate new tokens
    return this.generateTokens(user);
  }

  /**
   * Login user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<{ user: Omit<User, 'password_hash'>; tokens: AuthTokens } | null> {
    const user = await UserModel.findByEmail(credentials.email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await UserModel.verifyPassword(credentials.password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    const tokens = await this.generateTokens(user);
    const userProfile = await UserModel.getProfile(user.id);

    if (!userProfile) {
      return null;
    }

    return {
      user: userProfile,
      tokens,
    };
  }

  /**
   * Logout user by revoking refresh token
   */
  static async logout(userId: string, tokenId: string): Promise<void> {
    await this.revokeRefreshToken(userId, tokenId);
  }

  /**
   * Logout user from all devices by revoking all refresh tokens
   */
  static async logoutAll(userId: string): Promise<void> {
    const pattern = `refresh_token:${userId}:*`;
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  /**
   * Revoke specific refresh token
   */
  private static async revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
    const refreshTokenKey = `refresh_token:${userId}:${tokenId}`;
    await redis.del(refreshTokenKey);
  }

  /**
   * Clean up expired refresh tokens (can be called periodically)
   */
  static async cleanupExpiredTokens(): Promise<void> {
    // Redis automatically handles expiration, but we can implement additional cleanup if needed
    const pattern = 'refresh_token:*';
    const keys = await redis.keys(pattern);
    
    // Check each key's TTL and remove if expired
    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        // Key exists but has no expiration, remove it
        await redis.del(key);
      }
    }
  }
}