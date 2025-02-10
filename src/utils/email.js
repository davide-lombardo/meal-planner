const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Invia un'email con il menù settimanale
 * @param {String} menuText Testo del menù settimanale
 */
async function sendEmail( subject, text, html) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // Use port 587 for TLS
      secure: false, // false for TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Define email options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: subject || "No Subject", // Fallback for subject
      text, // Plain text version
      html, // HTML version
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Rethrow error for higher-level handling
  }
}

module.exports = { sendEmail };
