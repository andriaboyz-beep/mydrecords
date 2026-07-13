const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kontrakku.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run('PRAGMA foreign_keys = ON;');
    createTables();
  }
});

function createTables() {
  db.serialize(() => {
    // Label / Perusahaan
    db.run(`CREATE TABLE IF NOT EXISTS label (
      id TEXT PRIMARY KEY,
      name TEXT,
      director TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      logo TEXT,
      createdBy TEXT,
      createdAt TEXT
    )`);

    // Pengguna
    db.run(`CREATE TABLE IF NOT EXISTS pengguna (
      id TEXT PRIMARY KEY,
      name TEXT,
      username TEXT,
      email TEXT,
      role TEXT,
      password TEXT,
      avatar TEXT,
      labelId TEXT,
      createdAt TEXT,
      FOREIGN KEY (labelId) REFERENCES label(id) ON DELETE SET NULL
    )`);

    // Artis
    db.run(`CREATE TABLE IF NOT EXISTS artis (
      id TEXT PRIMARY KEY,
      name TEXT,
      panggung TEXT,
      nik TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      bank TEXT,
      bankAccount TEXT,
      bankName TEXT,
      ktp TEXT,
      npwp TEXT,
      avatar TEXT,
      labelId TEXT,
      createdBy TEXT,
      createdAt TEXT,
      FOREIGN KEY (labelId) REFERENCES label(id) ON DELETE CASCADE
    )`);

    // Pencipta
    db.run(`CREATE TABLE IF NOT EXISTS pencipta (
      id TEXT PRIMARY KEY,
      name TEXT,
      panggung TEXT,
      nik TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      bank TEXT,
      bankAccount TEXT,
      bankName TEXT,
      ktp TEXT,
      npwp TEXT,
      avatar TEXT,
      labelId TEXT,
      createdBy TEXT,
      createdAt TEXT,
      FOREIGN KEY (labelId) REFERENCES label(id) ON DELETE CASCADE
    )`);

    // Lagu
    db.run(`CREATE TABLE IF NOT EXISTS lagu (
      id TEXT PRIMARY KEY,
      judul TEXT,
      pencipta TEXT,
      artis TEXT,
      isni TEXT,
      isrc TEXT,
      labelId TEXT,
      createdBy TEXT,
      createdAt TEXT,
      FOREIGN KEY (labelId) REFERENCES label(id) ON DELETE CASCADE
    )`);

    // Kontrak
    db.run(`CREATE TABLE IF NOT EXISTS kontrak (
      id TEXT PRIMARY KEY,
      jenisKontrak TEXT,
      nomorKontrak TEXT,
      tanggalTtd TEXT,
      tanggalCetak TEXT,
      hariTerbilang TEXT,
      tanggalTerbilang TEXT,
      bulanTerbilang TEXT,
      tahunTerbilang TEXT,
      
      pihak1_nama TEXT,
      pihak1_jabatan TEXT,
      pihak1_perusahaan TEXT,
      pihak1_alamat TEXT,
      pihak2_nama TEXT,
      pihak2_panggung TEXT,
      pihak2_nik TEXT,
      pihak2_alamat TEXT,
      
      lagu_judul TEXT,
      lagu_pencipta TEXT,
      lagu_isrc TEXT,
      lagu_tanggalPenyerahan TEXT,
      
      persentaseLabel TEXT,
      persentasePihakKedua TEXT,
      
      status TEXT,
      labelId TEXT,
      createdBy TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      
      FOREIGN KEY (labelId) REFERENCES label(id) ON DELETE CASCADE
    )`, (err) => {
      if (!err) {
        // Add new columns if they don't exist
        const columnsToAdd = [
          'rekening_nama', 'rekening_nomor', 'rekening_bank',
          'pihak2_hp', 'pihak2_email', 'pihak2_alias',
          'saksi1', 'saksi2'
        ];
        columnsToAdd.forEach(col => {
          db.run(`ALTER TABLE kontrak ADD COLUMN ${col} TEXT`, () => {}); // ignore error if column exists
        });
      }
    });

    // Aktivitas
    db.run(`CREATE TABLE IF NOT EXISTS aktivitas (
      id TEXT PRIMARY KEY,
      userId TEXT,
      userName TEXT,
      action TEXT,
      detail TEXT,
      timestamp TEXT
    )`);
    
    // Add KTP Columns to artis and pencipta
    const ktpColumns = [
      'tempatLahir', 'tanggalLahir', 'jenisKelamin', 'golonganDarah',
      'rtRw', 'kelDesa', 'kecamatan', 'agama', 'statusPerkawinan',
      'pekerjaan', 'kewarganegaraan', 'bank', 'bankAccount', 'bankName'
    ];
    
    ['artis', 'pencipta'].forEach(tableName => {
      ktpColumns.forEach(col => {
        db.run(`ALTER TABLE ${tableName} ADD COLUMN ${col} TEXT`, () => {}); // ignore if column exists
      });
    });
    
    console.log('Tables initialized');
  });
}

module.exports = db;
