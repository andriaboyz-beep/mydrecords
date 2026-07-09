const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Endpoints

// ===================
// Generic CRUD helper
// ===================
function getItems(tableName, req, res) {
  const { labelId } = req.query;
  let sql = `SELECT * FROM ${tableName}`;
  let params = [];
  
  if (labelId) {
    sql += ` WHERE labelId = ?`;
    params.push(labelId);
  }
  
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
}

function getItemById(tableName, req, res) {
  const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
}

function createItem(tableName, fields, req, res) {
  const keys = Object.keys(fields).filter(k => req.body[k] !== undefined || k === 'id');
  const values = keys.map(k => {
    if (k === 'id' && !req.body.id) {
      // Auto-generate simple ID if not provided (e.g. for users)
      return `${tableName.toUpperCase().substring(0,3)}-${Date.now()}`;
    }
    return req.body[k];
  });
  
  const placeholders = keys.map(() => '?').join(',');
  const sql = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`;
  
  db.run(sql, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Return created item
    const id = values[keys.indexOf('id')];
    db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [id], (err, row) => {
      res.status(201).json(row);
    });
  });
}

function updateItem(tableName, req, res) {
  const id = req.params.id;
  const updates = [];
  const values = [];
  
  for (const key in req.body) {
    if (key !== 'id') {
      updates.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }
  
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  
  values.push(id);
  const sql = `UPDATE ${tableName} SET ${updates.join(', ')} WHERE id = ?`;
  
  db.run(sql, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    
    db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [id], (err, row) => {
      res.json(row);
    });
  });
}

function deleteItem(tableName, req, res) {
  const sql = `DELETE FROM ${tableName} WHERE id = ?`;
  db.run(sql, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  });
}

// -------------------
// Routes
// -------------------

const tables = ['label', 'pengguna', 'artis', 'pencipta', 'lagu', 'kontrak', 'aktivitas'];

tables.forEach(table => {
  // GET all
  app.get(`/api/${table}`, (req, res) => getItems(table, req, res));
  
  // GET by id
  app.get(`/api/${table}/:id`, (req, res) => getItemById(table, req, res));
  
  // POST (Create)
  app.post(`/api/${table}`, (req, res) => {
    // Determine fields based on table (we pass a mock object to extract keys)
    let fields = {};
    if (table === 'label') fields = { id: 1, name: 1, director: 1, address: 1, phone: 1, email: 1, logo: 1, createdBy: 1, createdAt: 1 };
    else if (table === 'pengguna') fields = { id: 1, name: 1, username: 1, email: 1, role: 1, password: 1, avatar: 1, labelId: 1, createdAt: 1 };
    else if (table === 'artis' || table === 'pencipta') fields = { id: 1, name: 1, panggung: 1, nik: 1, address: 1, phone: 1, email: 1, bank: 1, bankAccount: 1, bankName: 1, ktp: 1, npwp: 1, avatar: 1, labelId: 1, createdBy: 1, createdAt: 1 };
    else if (table === 'lagu') fields = { id: 1, judul: 1, pencipta: 1, artis: 1, isni: 1, isrc: 1, labelId: 1, createdBy: 1, createdAt: 1 };
    else if (table === 'kontrak') fields = { id: 1, jenisKontrak: 1, nomorKontrak: 1, tanggalTtd: 1, tanggalCetak: 1, hariTerbilang: 1, tanggalTerbilang: 1, bulanTerbilang: 1, tahunTerbilang: 1, pihak1_nama: 1, pihak1_jabatan: 1, pihak1_perusahaan: 1, pihak1_alamat: 1, pihak2_nama: 1, pihak2_panggung: 1, pihak2_nik: 1, pihak2_alamat: 1, lagu_judul: 1, lagu_pencipta: 1, lagu_isrc: 1, lagu_tanggalPenyerahan: 1, persentaseLabel: 1, persentasePihakKedua: 1, status: 1, labelId: 1, createdBy: 1, createdAt: 1, updatedAt: 1 };
    else if (table === 'aktivitas') fields = { id: 1, userId: 1, userName: 1, action: 1, detail: 1, timestamp: 1 };
    
    createItem(table, fields, req, res);
  });
  
  // PUT (Update)
  app.put(`/api/${table}/:id`, (req, res) => updateItem(table, req, res));
  
  // DELETE
  app.delete(`/api/${table}/:id`, (req, res) => deleteItem(table, req, res));
});


// Sync entire DB endpoint (For initial frontend fetch)
app.get('/api/sync', (req, res) => {
  const fullDb = {};
  let tablesProcessed = 0;
  
  tables.forEach(table => {
    db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
      if (!err) {
        fullDb[table] = rows;
      }
      tablesProcessed++;
      
      if (tablesProcessed === tables.length) {
        res.json(fullDb);
      }
    });
  });
});


// Serve React build files for production
app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
