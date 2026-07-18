const express = require('express');
const cors = require('cors');
const { insertSubmission } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8899')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10kb' }));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = { name: 200, email: 320, company: 200, message: 5000 };

app.post('/api/contact', (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const company = String(body.company || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (
    name.length > MAX_LEN.name ||
    email.length > MAX_LEN.email ||
    company.length > MAX_LEN.company ||
    message.length > MAX_LEN.message
  ) {
    return res.status(400).json({ error: 'One or more fields exceed the maximum length.' });
  }

  const id = insertSubmission({ name, email, company, message });
  res.status(201).json({ id, status: 'received' });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Contact API listening on http://localhost:${PORT}`);
});
