// Mock database and Redis connections for testing
jest.mock('../database/connection', () => ({
  db: {
    raw: jest.fn().mockResolvedValue({}),
    migrate: {
      latest: jest.fn().mockResolvedValue({}),
    },
    destroy: jest.fn().mockResolvedValue({}),
  },
  redis: {
    ping: jest.fn().mockResolvedValue('PONG'),
    setEx: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    ttl: jest.fn().mockResolvedValue(-1),
    quit: jest.fn().mockResolvedValue('OK'),
  },
}));

// Test database setup
beforeAll(async () => {
  // No actual database setup needed for mocked tests
}, 30000);

afterAll(async () => {
  // No actual cleanup needed for mocked tests
}, 30000);

beforeEach(async () => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});
