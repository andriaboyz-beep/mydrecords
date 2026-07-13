const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/kontrakku.sqlite');
db.all('SELECT * FROM artis', [], (err, rows) => {
  console.log(JSON.stringify(rows, null, 2));
});
