import * as fc from 'fast-check';

// Property test generators for frontend components
export const generators = {
  // UI-specific generators
  nonEmptyString: () => fc.string({ minLength: 1, maxLength: 100 }),
  whitespaceString: () =>
    fc.oneof(
      fc.constant(''),
      fc.constant(' '),
      fc.constant('\t'),
      fc.constant('\n'),
      fc.constant('   '),
      fc.constant('\t\n  ')
    ),
  validTaskDescription: () =>
    fc
      .string({ minLength: 1, maxLength: 500 })
      .filter(s => s.trim().length > 0),

  // Form data generators
  formData: () =>
    fc
      .record({
        title: fc.string({ minLength: 1, maxLength: 255 }),
        description: fc.option(fc.string({ maxLength: 1000 })),
        startDate: fc.date({ min: new Date() }),
        endDate: fc.date({ min: new Date() }),
      })
      .filter(data => data.startDate <= data.endDate),

  // Search query generators
  searchQuery: () =>
    fc
      .record({
        location: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
        category: fc.option(
          fc.oneof(
            fc.constant('sightseeing'),
            fc.constant('dining'),
            fc.constant('entertainment'),
            fc.constant('transportation')
          )
        ),
        minCost: fc.option(fc.float({ min: 0, max: 1000 })),
        maxCost: fc.option(fc.float({ min: 0, max: 10000 })),
      })
      .filter(
        query =>
          !query.minCost || !query.maxCost || query.minCost <= query.maxCost
      ),

  // UI state generators
  uiState: () =>
    fc.record({
      isLoading: fc.boolean(),
      error: fc.option(fc.string()),
      data: fc.option(
        fc.array(
          fc.record({
            id: fc.string(),
            name: fc.string(),
            category: fc.string(),
          })
        )
      ),
    }),
};

// Property test configuration for frontend
export const propertyTestConfig = {
  numRuns: 100, // Minimum 100 iterations as specified in design
  timeout: 5000, // 5 second timeout for UI tests
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
