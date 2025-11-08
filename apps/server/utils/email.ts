import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

export async function sendEmail(subject: string, text: string, html: string, emailConfig?: {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  fromAddress?: string;
  toAddress?: string;
}) {
  try {
    const host = emailConfig?.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = emailConfig?.smtpPort || Number(process.env.SMTP_PORT) || 587;
    const user = emailConfig?.smtpUser || process.env.SMTP_USER;
    const pass = emailConfig?.smtpPass || process.env.SMTP_PASS;
    const from = emailConfig?.fromAddress || user;
    const to = emailConfig?.toAddress || process.env.NOTIFICATION_EMAIL || user;
    logger.info('SMTP_USER: %s', user);
    logger.info('SMTP_PASS is set:', Boolean(pass));
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });
    const mailOptions = { from, to, subject, text, html };
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully: %o', info.response);
    return info;
  } catch (error) {
    logger.error('Error sending email: %o', error);
    throw error;
  }
}
