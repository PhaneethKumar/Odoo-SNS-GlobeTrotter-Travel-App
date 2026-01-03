import request from 'supertest';
import app from '../index';
import { UserModel } from '../models/User';
import { AuthService } from '../services/AuthService';

// Mock the database and Redis connections for testing
jest.mock('../database/connection', () => ({
  db: {
    raw: jest.fn().mockResolvedValue({}),
  },
  redis: {
    ping: jest.fn().mockResolvedValue('PONG'),
    setEx: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    ttl: jest.fn().mockResolvedValue(-1),
  },
}));

// Mock UserModel
jest.mock('../models/User');
const MockedUserModel = UserModel as jest.Mocked<typeof UserModel>;

// Mock AuthService
jest.mock('../services/AuthService');
const MockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        first_name: 'John',
        last_name: 'Doe',
        profile_image_url: undefined,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockUserProfile = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        profile_image_url: undefined,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: '15m',
      };

      MockedUserModel.findByEmail.mockResolvedValue(null);
      MockedUserModel.create.mockResolvedValue(mockUser);
      MockedUserModel.getProfile.mockResolvedValue(mockUserProfile);
      MockedAuthService.generateTokens.mockResolvedValue(mockTokens);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toMatchObject({
        id: mockUserProfile.id,
        email: mockUserProfile.email,
        first_name: mockUserProfile.first_name,
        last_name: mockUserProfile.last_name,
      });
      expect(response.body.tokens).toMatchObject(mockTokens);

      expect(MockedUserModel.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(MockedUserModel.create).toHaveBeenCalledWith(userData);
      expect(MockedAuthService.generateTokens).toHaveBeenCalledWith(mockUser);
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const existingUser = {
        id: 'existing-user',
        email: 'existing@example.com',
        password_hash: 'hashed-password',
        first_name: 'Jane',
        last_name: 'Doe',
        profile_image_url: undefined,
        created_at: new Date(),
        updated_at: new Date(),
      };

      MockedUserModel.findByEmail.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toMatchObject({
        error: 'User already exists with this email address',
        code: 'EMAIL_EXISTS',
      });
    });

    it('should return 400 for invalid input', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        first_name: '',
        last_name: 'Doe',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        profile_image_url: undefined,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: '15m',
      };

      const mockLoginResult = {
        user: mockUser,
        tokens: mockTokens,
      };

      MockedAuthService.login.mockResolvedValue(mockLoginResult);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
      });
      expect(response.body.tokens).toMatchObject(mockTokens);

      expect(MockedAuthService.login).toHaveBeenCalledWith(credentials);
    });

    it('should return 401 for invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      MockedAuthService.login.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: '15m',
      };

      MockedAuthService.refreshAccessToken.mockResolvedValue(mockTokens);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Token refreshed successfully',
        tokens: mockTokens,
      });

      expect(MockedAuthService.refreshAccessToken).toHaveBeenCalledWith(refreshToken);
    });

    it('should return 401 for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      MockedAuthService.refreshAccessToken.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    });
  });
});