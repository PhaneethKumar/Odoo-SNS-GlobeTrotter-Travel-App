# Globe Trotter - Travel Planning Application

A comprehensive travel planning application that enables users to create, manage, and share customized multi-city itineraries with budget management, activity discovery, and collaborative trip planning.

## Architecture

This is a monorepo containing:

- **Frontend**: React application with TypeScript and Tailwind CSS
- **Backend**: Node.js/Express microservices with TypeScript
- **Shared**: Common types, schemas, and utilities

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL >= 8.0
- Redis >= 6.0

## Quick Start

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd globe-trotter
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp packages/backend/.env.example packages/backend/.env
   cp packages/frontend/.env.example packages/frontend/.env
   # Edit the .env files with your configuration
   ```

3. **Set up the database:**

   ```bash
   # Create MySQL databases
   mysql -u root -p -e "CREATE DATABASE globe_trotter_dev;"
   mysql -u root -p -e "CREATE DATABASE globe_trotter_test;"

   # Run migrations
   cd packages/backend
   npm run migrate
   ```

4. **Start the development servers:**
   ```bash
   npm run dev
   ```

This will start both the backend API server (port 8000) and frontend development server (port 3000).

## Development

### Available Scripts

- `npm run build` - Build all packages
- `npm run test` - Run tests in all packages
- `npm run lint` - Lint all code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run dev` - Start development servers

### Package Structure

```
packages/
├── shared/          # Shared types and utilities
├── backend/         # Express.js API services
└── frontend/        # React application
```

### Database Migrations

```bash
cd packages/backend
npm run migrate          # Run migrations
npm run migrate:rollback # Rollback last migration
npm run seed            # Run database seeds
```

## Testing

The project uses a dual testing approach:

- **Unit tests**: Jest/Vitest for specific examples and edge cases
- **Property tests**: fast-check for universal properties (minimum 100 iterations per property)

### Property-Based Testing

Property-based tests validate universal correctness properties across many generated inputs. Each property test:

- Runs 100+ iterations with random inputs
- References specific design document properties
- Uses the format: **Feature: travel-planner, Property {number}: {property_text}**

Property test helpers are available in:

- `packages/backend/src/test/property-test-helpers.ts`
- `packages/frontend/src/test/property-test-helpers.ts`

### Running Tests

```bash
npm run test                    # Run all tests
npm run test --workspace=backend  # Run backend tests only
npm run test --workspace=frontend # Run frontend tests only
npm run test --workspace=shared   # Run shared utility tests only
```

### Test Files

- `.test.ts` - Unit tests
- `.property.test.ts` - Property-based tests

## Contributing

1. Follow the existing code style (ESLint + Prettier)
2. Write tests for new functionality
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

MIT License
