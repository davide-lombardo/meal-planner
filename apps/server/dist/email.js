import nodemailer from 'nodemailer';
import logger from './logger.js';
export async function sendEmail(subject, text, html) {
    try {
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
    }
    catch (error) {
        logger.error('Error sending email: %o', error);
        throw error;
    }
}
