import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

export async function sendEmail(subject: string, text: string, html: string) {
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
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
