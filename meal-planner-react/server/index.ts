import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sendEmail } from './email.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/send-meal-plan', async (req, res) => {
  const { subject, text, html } = req.body;
  try {
    await sendEmail(subject, text, html);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Email backend server running on port ${PORT}`);
});
