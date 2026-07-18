const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const db = new DatabaseSync(path.join(__dirname, 'data', 'submissions.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

function insertSubmission({ name, email, company, message }) {
  const stmt = db.prepare(
    'INSERT INTO submissions (name, email, company, message) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(name, email, company || null, message);
  return result.lastInsertRowid;
}

function listSubmissions() {
  return db.prepare('SELECT * FROM submissions ORDER BY id DESC').all();
}

module.exports = { insertSubmission, listSubmissions };
