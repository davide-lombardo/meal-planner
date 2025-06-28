import { describe, it, expect, vi } from 'vitest';
import { sendMealPlanEmail } from '../src/utils/sendMealPlanEmail';

global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'ok' }) })) as unknown as typeof fetch;

describe('sendMealPlanEmail', () => {
  it('calls fetch with correct params', async () => {
    await sendMealPlanEmail('subject', 'text', '<b>html</b>');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/send-meal-plan',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'subject', text: 'text', html: '<b>html</b>' })
      })
    );
  });

  it('throws on error', async () => {
    (global.fetch as { mockImplementationOnce: (fn: () => Promise<{ ok: boolean }>) => void }).mockImplementationOnce(() => Promise.resolve({ ok: false }));
    await expect(sendMealPlanEmail('fail', 'fail', 'fail')).rejects.toThrow('Failed to send email');
  });
});
