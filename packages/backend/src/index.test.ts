import request from 'supertest';
import app from './index';

// Mock the database and redis connections
jest.mock('./database/connection', () => ({
  db: {
    raw: jest.fn().mockResolvedValue([]),
  },
  redis: {
    ping: jest.fn().mockResolvedValue('PONG'),
  },
}));

describe('API Health Check', () => {
  test('GET /health should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api should return API info', async () => {
    const response = await request(app)
      .get('/api')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('message', 'Globe Trotter API');
    expect(response.body).toHaveProperty('version', '1.0.0');
  });

  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('error', 'Route not found');
  });
});
