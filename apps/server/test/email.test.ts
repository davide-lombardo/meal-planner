import { describe, it, expect, vi } from 'vitest';
import * as nodemailer from 'nodemailer';
import { sendEmail } from '../utils/email';

describe('sendEmail', () => {
  it('should send an email using nodemailer', async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ response: 'OK' });
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail: sendMailMock } as any);
    const result = await sendEmail('Test', 'text', '<b>html</b>');
    expect(sendMailMock).toHaveBeenCalled();
    expect(result.response).toBe('OK');
  });

  it('should throw on error', async () => {
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail: vi.fn().mockRejectedValue(new Error('fail')) } as any);
    await expect(sendEmail('fail', 'fail', 'fail')).rejects.toThrow('fail');
  });
});
