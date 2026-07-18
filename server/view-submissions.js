const { listSubmissions } = require('./db');

for (const row of listSubmissions()) {
  console.log('---');
  console.log(`#${row.id}  ${row.created_at}`);
  console.log(`${row.name} <${row.email}>${row.company ? ' — ' + row.company : ''}`);
  console.log(row.message);
}
