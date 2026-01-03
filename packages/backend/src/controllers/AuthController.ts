import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/AuthService';
import { UserModel, CreateUserData } from '../models/User';

export class AuthController {
  /**
   * Validation rules for user registration
   */
  static registerValidation = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('first_name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name is required and must be less than 100 characters'),
    body('last_name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name is required and must be less than 100 characters'),
    body('profile_image_url')
      .optional()
      .isURL()
      .withMessage('Profile image URL must be a valid URL'),
  ];

  /**
   * Validation rules for user login
   */
  static loginValidation = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ];

  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { email, password, first_name, last_name, profile_image_url } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          error: 'User already exists with this email address',
          code: 'EMAIL_EXISTS',
        });
        return;
      }

      // Create user data
      const userData: CreateUserData = {
        email,
        password,
        first_name,
        last_name,
        profile_image_url,
      };

      // Create user
      const user = await UserModel.create(userData);

      // Generate tokens
      const tokens = await AuthService.generateTokens(user);

      // Get user profile (without password hash)
      const userProfile = await UserModel.getProfile(user.id);

      res.status(201).json({
        message: 'User registered successfully',
        user: userProfile,
        tokens,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Registration failed',
        code: 'REGISTRATION_ERROR',
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { email, password } = req.body;

      // Attempt login
      const result = await AuthService.login({ email, password });
      if (!result) {
        res.status(401).json({
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        });
        return;
      }

      res.json({
        message: 'Login successful',
        user: result.user,
        tokens: result.tokens,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        code: 'LOGIN_ERROR',
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Refresh token is required',
          code: 'MISSING_REFRESH_TOKEN',
        });
        return;
      }

      const tokens = await AuthService.refreshAccessToken(refreshToken);
      if (!tokens) {
        res.status(401).json({
          error: 'Invalid or expired refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        });
        return;
      }

      res.json({
        message: 'Token refreshed successfully',
        tokens,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        error: 'Token refresh failed',
        code: 'REFRESH_ERROR',
      });
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const tokenPayload = req.tokenPayload;
      if (!tokenPayload) {
        res.status(400).json({
          error: 'Invalid token payload',
          code: 'INVALID_TOKEN_PAYLOAD',
        });
        return;
      }

      await AuthService.logout(tokenPayload.userId, tokenPayload.tokenId);

      res.json({
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        code: 'LOGOUT_ERROR',
      });
    }
  }

  /**
   * Logout from all devices
   */
  static async logoutAll(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          error: 'User not authenticated',
          code: 'NOT_AUTHENTICATED',
        });
        return;
      }

      await AuthService.logoutAll(user.id);

      res.json({
        message: 'Logged out from all devices successfully',
      });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        error: 'Logout from all devices failed',
        code: 'LOGOUT_ALL_ERROR',
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          error: 'User not authenticated',
          code: 'NOT_AUTHENTICATED',
        });
        return;
      }

      res.json({
        user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to get user profile',
        code: 'PROFILE_ERROR',
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          error: 'User not authenticated',
          code: 'NOT_AUTHENTICATED',
        });
        return;
      }

      const { first_name, last_name, profile_image_url } = req.body;

      // Validate input
      const updateData: any = {};
      if (first_name !== undefined) {
        if (typeof first_name !== 'string' || first_name.trim().length === 0) {
          res.status(400).json({
            error: 'First name must be a non-empty string',
            code: 'INVALID_FIRST_NAME',
          });
          return;
        }
        updateData.first_name = first_name.trim();
      }

      if (last_name !== undefined) {
        if (typeof last_name !== 'string' || last_name.trim().length === 0) {
          res.status(400).json({
            error: 'Last name must be a non-empty string',
            code: 'INVALID_LAST_NAME',
          });
          return;
        }
        updateData.last_name = last_name.trim();
      }

      if (profile_image_url !== undefined) {
        updateData.profile_image_url = profile_image_url;
      }

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          error: 'No valid fields to update',
          code: 'NO_UPDATE_FIELDS',
        });
        return;
      }

      const updatedUser = await UserModel.update(user.id, updateData);
      if (!updatedUser) {
        res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      const userProfile = await UserModel.getProfile(user.id);

      res.json({
        message: 'Profile updated successfully',
        user: userProfile,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        code: 'UPDATE_PROFILE_ERROR',
      });
    }
  }
}