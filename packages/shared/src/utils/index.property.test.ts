import * as fc from 'fast-check';
import {
  formatDate,
  formatDateTime,
  isValidDateRange,
  isValidEmail,
  isValidUUID,
} from './index';

// Property test configuration
const propertyTestConfig = {
  numRuns: 100,
  timeout: 5000,
};

describe('Date utilities - Property Tests', () => {
  test('formatDate should always return YYYY-MM-DD format', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }),
        date => {
          const formatted = formatDate(date);
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          return dateRegex.test(formatted);
        }
      ),
      propertyTestConfig
    );
  });

  test('formatDateTime should always return valid ISO string', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }),
        date => {
          const formatted = formatDateTime(date);
          // Should be parseable back to a date
          const parsed = new Date(formatted);
          return (
            !isNaN(parsed.getTime()) &&
            formatted.includes('T') &&
            formatted.includes('Z')
          );
        }
      ),
      propertyTestConfig
    );
  });

  test('isValidDateRange should be consistent with date comparison', () => {
    fc.assert(
      fc.property(fc.date(), fc.date(), (date1, date2) => {
        const result = isValidDateRange(date1, date2);
        const expected = date1 <= date2;
        return result === expected;
      }),
      propertyTestConfig
    );
  });
});

describe('Validation utilities - Property Tests', () => {
  test('isValidEmail should reject strings without @ symbol', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !s.includes('@')),
        invalidEmail => {
          return !isValidEmail(invalidEmail);
        }
      ),
      propertyTestConfig
    );
  });

  test('isValidUUID should accept properly formatted UUIDs', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.hexaString({ minLength: 8, maxLength: 8 }),
          fc.hexaString({ minLength: 4, maxLength: 4 }),
          fc
            .oneof(
              fc.constant('1'),
              fc.constant('2'),
              fc.constant('3'),
              fc.constant('4'),
              fc.constant('5')
            )
            .chain(v =>
              fc.hexaString({ minLength: 3, maxLength: 3 }).map(s => v + s)
            ),
          fc
            .oneof(
              fc.constant('8'),
              fc.constant('9'),
              fc.constant('a'),
              fc.constant('b')
            )
            .chain(v =>
              fc.hexaString({ minLength: 3, maxLength: 3 }).map(s => v + s)
            ),
          fc.hexaString({ minLength: 12, maxLength: 12 })
        ),
        ([a, b, c, d, e]) => {
          const uuid = `${a}-${b}-${c}-${d}-${e}`;
          return isValidUUID(uuid);
        }
      ),
      propertyTestConfig
    );
  });

  test('isValidUUID should reject malformed strings', () => {
    fc.assert(
      fc.property(
        fc
          .string()
          .filter(
            s =>
              !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                s
              )
          ),
        invalidUuid => {
          return !isValidUUID(invalidUuid);
        }
      ),
      propertyTestConfig
    );
  });
});
