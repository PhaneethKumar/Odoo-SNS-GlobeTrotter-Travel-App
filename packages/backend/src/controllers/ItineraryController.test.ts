import request from 'supertest';
import app from '../index';
import { ItineraryModel, StopModel } from '../models';
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

// Mock models
jest.mock('../models');
jest.mock('../models/User');
const MockedItineraryModel = ItineraryModel as jest.Mocked<typeof ItineraryModel>;
const MockedStopModel = StopModel as jest.Mocked<typeof StopModel>;
const MockedUserModel = UserModel as jest.Mocked<typeof UserModel>;

// Mock AuthService
jest.mock('../services/AuthService');
const MockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('ItineraryController', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authentication
    MockedAuthService.verifyAccessToken.mockResolvedValue({
      userId: mockUser.id,
      email: mockUser.email,
      tokenId: 'token-123',
    });
    MockedUserModel.getProfile.mockResolvedValue(mockUser);
  });

  describe('POST /api/itineraries', () => {
    it('should create a new itinerary', async () => {
      const itineraryData = {
        title: 'Test Trip',
        description: 'A test trip description',
        start_date: '2024-06-01',
        end_date: '2024-06-10',
        status: 'draft',
      };

      const mockItinerary = {
        id: 'itinerary-123',
        user_id: mockUser.id,
        title: itineraryData.title,
        description: itineraryData.description,
        start_date: new Date(itineraryData.start_date),
        end_date: new Date(itineraryData.end_date),
        status: 'draft' as const,
        metadata: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      MockedItineraryModel.create.mockResolvedValue(mockItinerary);

      const response = await request(app)
        .post('/api/itineraries')
        .set('Authorization', `Bearer ${mockTokens.accessToken}`)
        .send(itineraryData)
        .expect(201);

      expect(response.body.message).toBe('Itinerary created successfully');
      expect(response.body.itinerary).toMatchObject({
        title: itineraryData.title,
        description: itineraryData.description,
        status: itineraryData.status,
        user_id: mockUser.id,
      });

      expect(MockedItineraryModel.create).toHaveBeenCalledWith({
        user_id: mockUser.id,
        title: itineraryData.title,
        description: itineraryData.description,
        start_date: new Date(itineraryData.start_date),
        end_date: new Date(itineraryData.end_date),
        status: itineraryData.status,
        metadata: undefined,
      });
    });

    it('should reject invalid date ranges', async () => {
      const itineraryData = {
        title: 'Invalid Trip',
        start_date: '2024-06-10',
        end_date: '2024-06-01', // End before start
      };

      const response = await request(app)
        .post('/api/itineraries')
        .set('Authorization', `Bearer ${mockTokens.accessToken}`)
        .send(itineraryData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should require authentication', async () => {
      const itineraryData = {
        title: 'Test Trip',
        start_date: '2024-06-01',
        end_date: '2024-06-10',
      };

      await request(app)
        .post('/api/itineraries')
        .send(itineraryData)
        .expect(401);
    });
  });

  describe('GET /api/itineraries', () => {
    it('should get all itineraries for authenticated user', async () => {
      const mockItineraries = [
        {
          id: 'itinerary-1',
          user_id: mockUser.id,
          title: 'Trip 1',
          description: 'First trip',
          start_date: new Date('2024-07-01'),
          end_date: new Date('2024-07-10'),
          status: 'draft' as const,
          metadata: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'itinerary-2',
          user_id: mockUser.id,
          title: 'Trip 2',
          description: 'Second trip',
          start_date: new Date('2024-08-01'),
          end_date: new Date('2024-08-10'),
          status: 'active' as const,
          metadata: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      MockedItineraryModel.findByUserId.mockResolvedValue(mockItineraries);

      const response = await request(app)
        .get('/api/itineraries')
        .set('Authorization', `Bearer ${mockTokens.accessToken}`)
        .expect(200);

      expect(response.body.itineraries).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(MockedItineraryModel.findByUserId).toHaveBeenCalledWith(mockUser.id);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/itineraries')
        .expect(401);
    });
  });

  describe('GET /api/itineraries/:id', () => {
    it('should get specific itinerary by ID', async () => {
      const mockItinerary = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: mockUser.id,
        title: 'Test Trip',
        description: 'A test trip',
        start_date: new Date('2024-08-01'),
        end_date: new Date('2024-08-10'),
        status: 'draft' as const,
        metadata: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockStops = [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          itinerary_id: '550e8400-e29b-41d4-a716-446655440001',
          destination_name: 'Paris',
          destination_code: 'PAR',
          latitude: 48.8566,
          longitude: 2.3522,
          arrival_date: new Date('2024-08-02'),
          departure_date: new Date('2024-08-05'),
          order_index: 1,
          metadata: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      MockedItineraryModel.isOwner.mockResolvedValue(true);
      MockedItineraryModel.findById.mockResolvedValue(mockItinerary);
      MockedStopModel.findByItineraryId.mockResolvedValue(mockStops);

      const response = await request(app)
        .get(`/api/itineraries/${mockItinerary.id}`)
        .set('Authorization', `Bearer ${mockTokens.accessToken}`)
        .expect(200);

      expect(response.body.itinerary.id).toBe(mockItinerary.id);
      expect(response.body.itinerary.title).toBe(mockItinerary.title);
      expect(response.body.itinerary.stops).toHaveLength(1);
      expect(MockedItineraryModel.isOwner).toHaveBeenCalledWith(mockItinerary.id, mockUser.id);
    });

    it('should return 404 for non-existent itinerary', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      MockedItineraryModel.isOwner.mockResolvedValue(false);

      await request(app)
        .get(`/api/itineraries/${fakeId}`)
        .set('Authorization', `Bearer ${mockTokens.accessToken}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .get('/api/itineraries/invalid-id')
        .set('Authorization', `Bearer ${mockTokens.accessToken}`)
        .expect(400);
    });
  });

  describe('POST /api/itineraries/:id/stops', () => {
    it('should add a stop to an itinerary', async () => {
      const itineraryId = '550e8400-e29b-41d4-a716-446655440003';
      const stopData = {
        destination_name: 'Paris',
        destination_code: 'PAR',
        latitude: 48.8566,
        longitude: 2.3522,
        arrival_date: '2024-09-02',
        departure_date: '2024-09-05',
        order_index: 1,
      };

      const mockStop = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        itinerary_id: itineraryId,
        destination_name: stopData.destination_name,
        destination_code: stopData.destination_code,
        latitude: stopData.latitude,
        longitude: stopData.longitude,
        arrival_date: new Date(stopData.arrival_date),
        departure_date: new Date(stopData.departure_date),
        order_index: stopData.order_index,
        metadata: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      MockedItineraryModel.isOwner.mockResolvedValue(true);
      MockedStopModel.create.mockResolvedValue(mockStop);

      const response = await request(app)
        .post(`/api/itineraries/${itineraryId}/stops`)
        .set('Authorization', `Bearer ${mockTokens.accessToken}`)
        .send(stopData)
        .expect(201);

      expect(response.body.message).toBe('Stop added successfully');
      expect(response.body.stop).toMatchObject({
        destination_name: stopData.destination_name,
        destination_code: stopData.destination_code,
        itinerary_id: itineraryId,
      });

      expect(MockedStopModel.create).toHaveBeenCalledWith({
        ...stopData,
        itinerary_id: itineraryId,
        arrival_date: new Date(stopData.arrival_date),
        departure_date: new Date(stopData.departure_date),
      });
    });

    it('should return 404 for non-owned itinerary', async () => {
      const itineraryId = '550e8400-e29b-41d4-a716-446655440005';
      const stopData = {
        destination_name: 'London',
        arrival_date: '2024-08-01',
        departure_date: '2024-08-05',
      };

      MockedItineraryModel.isOwner.mockResolvedValue(false);

      await request(app)
        .post(`/api/itineraries/${itineraryId}/stops`)
        .set('Authorization', `Bearer ${mockTokens.accessToken}`)
        .send(stopData)
        .expect(404);
    });
  });
});