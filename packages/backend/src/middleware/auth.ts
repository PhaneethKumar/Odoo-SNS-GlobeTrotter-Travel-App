import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/AuthService';
import { UserModel } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        profile_image_url?: string;
        created_at: Date;
        updated_at: Date;
      };
      tokenPayload?: TokenPayload;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        error: 'Access token required',
        code: 'MISSING_TOKEN',
      });
      return;
    }

    const payload = await AuthService.verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({
        error: 'Invalid or expired access token',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    // Get user profile and attach to request
    const user = await UserModel.getProfile(payload.userId);
    if (!user) {
      res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const payload = await AuthService.verifyAccessToken(token);
      if (payload) {
        const user = await UserModel.getProfile(payload.userId);
        if (user) {
          req.user = user;
          req.tokenPayload = payload;
        }
      }
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

/**
 * Middleware to extract and validate refresh token
 */
export const validateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Refresh token required',
        code: 'MISSING_REFRESH_TOKEN',
      });
      return;
    }

    const payload = await AuthService.verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(401).json({
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
      return;
    }

    req.tokenPayload = payload;
    next();
  } catch (error) {
    console.error('Refresh token validation error:', error);
    res.status(500).json({
      error: 'Token validation failed',
      code: 'TOKEN_VALIDATION_ERROR',
    });
  }
};