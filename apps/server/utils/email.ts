import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

export async function sendEmail(subject: string, text: string, html: string) {
  try {
    logger.info('SMTP_USER: %s', process.env.SMTP_USER);
    logger.info('SMTP_PASS is set:', Boolean(process.env.SMTP_PASS));
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully: %o', info.response);
    return info;
  } catch (error) {
    logger.error('Error sending email: %o', error);
    throw error;
  }
}
