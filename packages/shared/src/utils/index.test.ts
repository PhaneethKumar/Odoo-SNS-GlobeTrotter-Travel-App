import {
  formatDate,
  formatDateTime,
  isValidDateRange,
  isValidEmail,
  isValidUUID,
} from './index';

describe('Date utilities', () => {
  test('formatDate should format date correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    expect(formatDate(date)).toBe('2024-01-15');
  });

  test('formatDateTime should format datetime correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    expect(formatDateTime(date)).toBe('2024-01-15T10:30:00.000Z');
  });

  test('isValidDateRange should validate date ranges', () => {
    expect(isValidDateRange('2024-01-01', '2024-01-15')).toBe(true);
    expect(isValidDateRange('2024-01-15', '2024-01-01')).toBe(false);
  });
});

describe('Validation utilities', () => {
  test('isValidEmail should validate email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
  });

  test('isValidUUID should validate UUIDs', () => {
    expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isValidUUID('invalid-uuid')).toBe(false);
    expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
  });
});
