import { describe, it, expect } from 'vitest';
import { sendEmail } from '../src/utils/email';

describe('email util', () => {
  it('should be a function', () => {
    expect(typeof sendEmail).toBe('function');
  });
  // You can add more integration tests if you mock nodemailer
});
