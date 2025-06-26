const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sendEmail } = require('../src/utils/email');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/send-meal-plan', async (req, res) => {
  const { subject, text, html } = req.body;
  try {
    await sendEmail(subject, text, html);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Email backend server running on port ${PORT}`);
});
