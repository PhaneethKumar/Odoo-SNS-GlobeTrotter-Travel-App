import { db, redis } from '../database/connection';

// Test database setup
beforeAll(async () => {
  try {
    // Run migrations for test database
    await db.migrate.latest();
  } catch (error) {
    console.warn(
      'Database migration failed - database may not be available:',
      error
    );
  }
}, 30000);

afterAll(async () => {
  try {
    // Clean up database connections
    await db.destroy();
    await redis.quit();
  } catch (error) {
    console.warn('Cleanup failed - services may not be available:', error);
  }
}, 30000);

beforeEach(async () => {
  try {
    // Clean up test data before each test
    const tables = [
      'itinerary_collaborators',
      'shared_links',
      'budget_items',
      'budgets',
      'activities',
      'stops',
      'itineraries',
      'users',
    ];

    for (const table of tables) {
      try {
        await db(table).del();
      } catch (error) {
        // Table might not exist yet, ignore error
      }
    }
  } catch (error) {
    console.warn(
      'Test data cleanup failed - database may not be available:',
      error
    );
  }
});
