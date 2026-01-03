import knex from 'knex';
import { createClient } from 'redis';

const knexConfig = require('../../knexfile.js');

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Database connection with connection pooling
export const db = knex(config);

// Redis connection for caching and session management
export const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD,
  database: parseInt(process.env.REDIS_DB || '0'),
});

redis.on('error', err => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

// Initialize Redis connection
redis.connect().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await db.destroy();
  await redis.quit();
  process.exit(0);
});

export default { db, redis };
