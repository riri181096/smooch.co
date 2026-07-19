const express = require('express');
const cors = require('cors');
const crypto = require('node:crypto');
const { insertSubmission, listSubmissions } = require('./db');

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

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

app.get('/admin/submissions', (req, res) => {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return res.status(503).send('ADMIN_TOKEN is not configured on the server.');
  }
  if (!timingSafeEqual(req.query.token || '', adminToken)) {
    return res.status(401).send('Unauthorized.');
  }

  const rows = listSubmissions();
  const rowsHtml = rows.map(row => `
    <tr>
      <td>${row.id}</td>
      <td>${escapeHtml(row.created_at)}</td>
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.email)}</td>
      <td>${escapeHtml(row.company || '')}</td>
      <td>${escapeHtml(row.message)}</td>
    </tr>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Submissions</title>
      <style>
        body { font-family: sans-serif; margin: 2rem; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
        th { background: #f0f0f0; }
      </style>
    </head>
    <body>
      <h1>Contact form submissions (${rows.length})</h1>
      <table>
        <tr><th>ID</th><th>Received</th><th>Name</th><th>Email</th><th>Company</th><th>Message</th></tr>
        ${rowsHtml}
      </table>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Contact API listening on http://localhost:${PORT}`);
});
