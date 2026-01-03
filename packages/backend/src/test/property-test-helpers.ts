import * as fc from 'fast-check';

// Property test generators for travel planner domain
export const generators = {
  // User generators
  email: () => fc.emailAddress(),
  password: () => fc.string({ minLength: 8, maxLength: 50 }),
  name: () => fc.string({ minLength: 1, maxLength: 100 }),
  uuid: () =>
    fc
      .tuple(
        fc.hexaString({ minLength: 8, maxLength: 8 }),
        fc.hexaString({ minLength: 4, maxLength: 4 }),
        fc.hexaString({ minLength: 4, maxLength: 4 }),
        fc.hexaString({ minLength: 4, maxLength: 4 }),
        fc.hexaString({ minLength: 12, maxLength: 12 })
      )
      .map(([a, b, c, d, e]) => `${a}-${b}-${c}-${d}-${e}`),

  // Date generators
  futureDate: () =>
    fc.date({
      min: new Date(),
      max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    }),
  pastDate: () =>
    fc.date({
      min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      max: new Date(),
    }),
  dateRange: () =>
    fc
      .tuple(
        fc.date({
          min: new Date(),
          max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        }),
        fc.date({
          min: new Date(),
          max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        })
      )
      .filter(([start, end]) => start <= end),

  // Travel-specific generators
  destinationName: () =>
    fc.oneof(
      fc.constant('Paris'),
      fc.constant('Tokyo'),
      fc.constant('New York'),
      fc.constant('London'),
      fc.constant('Sydney'),
      fc.constant('Rome'),
      fc.constant('Barcelona'),
      fc.constant('Amsterdam')
    ),
  destinationCode: () =>
    fc.oneof(
      fc.constant('PAR'),
      fc.constant('TYO'),
      fc.constant('NYC'),
      fc.constant('LON'),
      fc.constant('SYD'),
      fc.constant('ROM'),
      fc.constant('BCN'),
      fc.constant('AMS')
    ),
  coordinates: () =>
    fc.tuple(
      fc.float({ min: -90, max: 90 }), // latitude
      fc.float({ min: -180, max: 180 }) // longitude
    ),
  currency: () =>
    fc.oneof(
      fc.constant('USD'),
      fc.constant('EUR'),
      fc.constant('GBP'),
      fc.constant('JPY'),
      fc.constant('AUD')
    ),
  positiveAmount: () => fc.float({ min: 0.01, max: 10000, noNaN: true }),
  activityCategory: () =>
    fc.oneof(
      fc.constant('sightseeing'),
      fc.constant('dining'),
      fc.constant('entertainment'),
      fc.constant('transportation'),
      fc.constant('accommodation'),
      fc.constant('shopping')
    ),

  // Complex object generators
  user: () =>
    fc.record({
      id: generators.uuid(),
      email: generators.email(),
      firstName: generators.name(),
      lastName: generators.name(),
      createdAt: generators.pastDate(),
      updatedAt: generators.pastDate(),
    }),

  itinerary: () =>
    fc
      .record({
        id: generators.uuid(),
        userId: generators.uuid(),
        title: fc.string({ minLength: 1, maxLength: 255 }),
        description: fc.option(fc.string({ maxLength: 1000 })),
        startDate: generators.futureDate(),
        endDate: generators.futureDate(),
        status: fc.oneof(
          fc.constant('draft' as const),
          fc.constant('active' as const),
          fc.constant('completed' as const),
          fc.constant('cancelled' as const)
        ),
        createdAt: generators.pastDate(),
        updatedAt: generators.pastDate(),
      })
      .filter(itinerary => itinerary.startDate <= itinerary.endDate),

  stop: () =>
    fc
      .record({
        id: generators.uuid(),
        itineraryId: generators.uuid(),
        destinationName: generators.destinationName(),
        destinationCode: fc.option(generators.destinationCode()),
        latitude: fc.option(fc.float({ min: -90, max: 90 })),
        longitude: fc.option(fc.float({ min: -180, max: 180 })),
        arrivalDate: generators.futureDate(),
        departureDate: generators.futureDate(),
        orderIndex: fc.nat({ max: 100 }),
        createdAt: generators.pastDate(),
        updatedAt: generators.pastDate(),
      })
      .filter(stop => stop.arrivalDate <= stop.departureDate),

  activity: () =>
    fc
      .record({
        id: generators.uuid(),
        stopId: generators.uuid(),
        name: fc.string({ minLength: 1, maxLength: 255 }),
        description: fc.option(fc.string({ maxLength: 1000 })),
        category: generators.activityCategory(),
        startTime: fc.option(generators.futureDate()),
        endTime: fc.option(generators.futureDate()),
        estimatedCost: fc.option(generators.positiveAmount()),
        currency: fc.option(generators.currency()),
        bookingUrl: fc.option(fc.webUrl()),
        createdAt: generators.pastDate(),
        updatedAt: generators.pastDate(),
      })
      .filter(
        activity =>
          !activity.startTime ||
          !activity.endTime ||
          activity.startTime <= activity.endTime
      ),
};

// Property test configuration
export const propertyTestConfig = {
  numRuns: 100, // Minimum 100 iterations as specified in design
  timeout: 10000, // 10 second timeout
  verbose: process.env.NODE_ENV === 'test',
};

// Helper function to run property tests with consistent configuration
export const runPropertyTest = (
  name: string,
  property: fc.IProperty<unknown>
): void => {
  test(name, () => {
    fc.assert(property, propertyTestConfig);
  });
};
