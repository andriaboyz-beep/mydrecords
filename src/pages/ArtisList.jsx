import React, { useState } from 'react';
import { Users, Plus, Search, MoreVertical, CheckCircle2, ScanFace, Loader2, X } from 'lucide-react';

export default function ArtisList({ db, setDb, user, activeWorkspace }) {
  const [showForm, setShowForm] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedArtis, setSelectedArtis] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    ktp: '',
    alamat: '',
    bank: '',
    norek: '',
    atasNama: '',
    ktpFile: null,
    fotoProfile: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newArtis = {
      id: `ART-${String(db.artis.length + 1).padStart(3, '0')}`,
      createdBy: user?.id,
      labelId: activeWorkspace,
      ...formData
    };
    setDb(prev => ({
      ...prev,
      artis: [...prev.artis, newArtis]
    }));
    setShowForm(false);
    setFormData({ name: '', alias: '', ktp: '', alamat: '', bank: '', norek: '', atasNama: '', ktpFile: null, fotoProfile: null });
  };

  const handleKTPScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set preview image first
    setFormData(prev => ({ ...prev, ktpFile: URL.createObjectURL(file) }));
    setIsScanning(true);

    try {
      const Tesseract = (await import('tesseract.js')).default;
      const result = await Tesseract.recognize(file, 'ind', {
        logger: m => console.log(m)
      });
      
      const text = result.data.text.toUpperCase();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let parsedNik = '';
      let parsedNama = '';
      let parsedAlamat = '';
      let kota = '';
      let provinsi = '';

      // Ekstrak Provinsi & Kota dari baris awal
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].includes('PROVINSI')) {
          provinsi = lines[i].replace(/[^A-Z ]/g, '').trim();
        }
        if (lines[i].includes('KOTA') || lines[i].includes('KABUPATEN')) {
          kota = lines[i].replace(/[^A-Z ]/g, '').trim();
        }
      }

      // Find NIK
      const nikLine = lines.find(l => l.match(/\d{16}/));
      if (nikLine) parsedNik = nikLine.match(/\d{16}/)[0];
      
      // Find Nama
      const namaIdx = lines.findIndex(l => l.includes('NAMA'));
      if (namaIdx !== -1) {
        const parts = lines[namaIdx].split(':');
        if (parts.length > 1 && parts[1].trim().length > 2) {
          parsedNama = parts[1].replace(/[^A-Z .\-]/g, '').trim();
        } else if (namaIdx + 1 < lines.length) {
          parsedNama = lines[namaIdx+1].replace(/[^A-Z .\-]/g, '').trim();
        }
      }
      
      // Find Jalan/Alamat
      let jalan = '';
      const alamatIdx = lines.findIndex(l => /A\s*L\s*A\s*M\s*A\s*T/i.test(l));
      if (alamatIdx !== -1) {
        let line = lines[alamatIdx];
        if (line.includes(':')) {
           const parts = line.split(':');
           if (parts.length > 1 && parts[1].trim().length > 2) {
              jalan = parts[1].replace(/[^A-Z0-9 .\-,/]/g, '').trim();
           }
        } else {
           const afterAlamat = line.replace(/.*A\s*L\s*A\s*M\s*A\s*T/i, '').replace(/[^A-Z0-9 .\-,/]/g, '').trim();
           if (afterAlamat.length > 2) {
              jalan = afterAlamat;
           }
        }
        
        if (!jalan && alamatIdx + 1 < lines.length) {
          if (!/RT|RW|RAW|KEL|DESA|KEC/i.test(lines[alamatIdx+1])) {
             jalan = lines[alamatIdx+1].replace(/[^A-Z0-9 .\-,/]/g, '').trim();
          }
        }
      }

      // Fallback ekstrim untuk Jalan: Ambil baris di atas RT/RW
      if (!jalan || jalan.length < 3) {
         const rtIdx = lines.findIndex(l => /RT.*RW|RAW|RTI|\d{2,3}[\/|]\d{2,3}/i.test(l) && !/ALAMAT/i.test(l));
         if (rtIdx > 0) {
            const lineAbove = lines[rtIdx - 1];
            if (!/KELAMIN|AGAMA|STATUS|NAMA|LAHIR|KECAMATAN|PROVINSI|KOTA/i.test(lineAbove)) {
               let fallbackJalan = lineAbove.replace(/.*A\s*L\s*A\s*M\s*A\s*T/i, '').replace(/[^A-Z0-9 .\-,/]/g, '').trim();
               fallbackJalan = fallbackJalan.replace(/^[.:,\-\s]+/, '');
               if (fallbackJalan.length > 2) jalan = fallbackJalan;
            }
         }
      }

      // Find RT/RW
      let rtRw = '';
      const rtLine = lines.find(l => /RT.*RW|RAW|RTI|\d{2,3}[\/|]\d{2,3}/i.test(l) && !l.includes('ALAMAT'));
      if (rtLine) {
        const nums = rtLine.replace(/[^0-9/]/g, '').trim();
        if (nums.includes('/')) {
           rtRw = `RT/RW ${nums}`;
        } else if (nums.length >= 4) {
           rtRw = `RT/RW ${nums.slice(0, Math.floor(nums.length/2))}/${nums.slice(Math.floor(nums.length/2))}`;
        } else if (nums.length > 0) {
           rtRw = `RT/RW ${nums}`;
        }
      }

      // Find Kelurahan / Desa
      let kel = '';
      const kelLine = lines.find(l => /KEL|DESA|OESA/i.test(l) && !/KEC/.test(l));
      if (kelLine) {
        let val = kelLine.split(':').pop().replace(/[^A-Z \-]/g, '').trim();
        val = val.replace(/KEL.*DESA|KEL|DESA|OESA/ig, '').trim();
        if (val) kel = `Desa ${val}`;
      }

      // Find Kecamatan
      let kec = '';
      const kecLine = lines.find(l => /KEC|KECAMATAN/i.test(l) && !/KEL/.test(l));
      if (kecLine) {
        let val = kecLine.split(':').pop().replace(/[^A-Z \-]/g, '').trim();
        val = val.replace(/KECAMATAN|KEC/ig, '').trim();
        if (val) kec = `Kec. ${val}`;
      }
      
      parsedAlamat = [jalan, rtRw, kel, kec, kota, provinsi]
        .filter(Boolean)
        .join(', ')
        .replace(/\s+/g, ' ') 
        .replace(/, ,/g, ',');

      setFormData(prev => ({
        ...prev,
        ktp: parsedNik || prev.ktp,
        name: parsedNama || prev.name,
        alamat: parsedAlamat || prev.alamat
      }));

    } catch (err) {
      console.error('OCR KTP Error:', err);
      alert('Gagal memindai KTP. Silakan isi manual.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="page-container p-6">
      <div className="page-header flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daftar Artis</h2>
          <p className="text-gray-500">Kelola data artis yang berada di bawah naungan atau kerja sama.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Batal Tambah' : 'Tambah Artis'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">Tambah Artis Baru</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label className="font-bold">Nama Lengkap (Sesuai KTP)</label>
                <input required name="name" value={formData.name} onChange={handleChange} type="text" className="form-control" />
              </div>
              <div className="form-group">
                <label className="font-bold">Nama Panggung / Alias</label>
                <input required name="alias" value={formData.alias} onChange={handleChange} type="text" className="form-control" />
              </div>
              <div className="form-group">
                <label className="font-bold">No KTP / NIK</label>
                <input required name="ktp" value={formData.ktp} onChange={handleChange} type="text" className="form-control" />
              </div>
              <div className="form-group">
                <label className="font-bold">Alamat Lengkap</label>
                <input required name="alamat" value={formData.alamat} onChange={handleChange} type="text" className="form-control" />
              </div>
              <div className="form-group">
                <label className="font-bold">Nama Bank</label>
                <select required name="bank" value={formData.bank} onChange={handleChange} className="form-control">
                  <option value="" disabled>Pilih Bank</option>
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BNI">BNI (Bank Negara Indonesia)</option>
                  <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                  <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  <option value="CIMB">CIMB Niaga</option>
                  <option value="Permata">Permata Bank</option>
                  <option value="Danamon">Bank Danamon</option>
                  <option value="BJB">Bank BJB</option>
                  <option value="Jago">Bank Jago</option>
                  <option value="SeaBank">SeaBank</option>
                  <option value="Jenius">Jenius (BTPN)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="font-bold">Nomor Rekening</label>
                <input required name="norek" value={formData.norek} onChange={handleChange} type="text" className="form-control" />
              </div>
              <div className="form-group">
                <label className="font-bold">Atas Nama Rekening</label>
                <input required name="atasNama" value={formData.atasNama} onChange={handleChange} type="text" className="form-control" />
              </div>
              <div className="form-group">
                <label className="font-bold">Upload foto terkini (digunakan untuk profile artis)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="form-control file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData(prev => ({ ...prev, fotoProfile: URL.createObjectURL(file) }));
                    }
                  }}
                />
              </div>
              <div className="form-group col-span-2">
                <div className="p-4 border-2 border-dashed border-primary rounded-lg bg-indigo-50 relative overflow-hidden">
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                      <Loader2 size={32} className="text-primary animate-spin mb-2" />
                      <p className="text-sm font-bold text-primary animate-pulse">Memindai Data KTP (OCR)...</p>
                    </div>
                  )}
                  <label className="font-bold flex items-center gap-2 mb-2">
                    <ScanFace size={18} className="text-primary" /> 
                    Smart Scan KTP (Otomatis Isi Data)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Upload foto KTP asli, sistem AI akan mendeteksi NIK, Nama, dan Alamat secara otomatis.</p>
                  <input name="ktpFile" onChange={handleKTPScan} type="file" accept="image/*" className="form-control file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">Simpan Artis</button>
            </div>
          </form>
        </div>
      )}

      <div className="card mb-6 p-4 flex gap-4">
        <div className="input-icon-left flex-1">
          <Search size={18} />
          <input type="text" className="form-control" placeholder="Cari nama artis..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {db.artis.map(art => (
          <div key={art.id} className="card p-5 relative group">
            <div className="flex items-center gap-4 mb-4">
              <img src={`https://ui-avatars.com/api/?name=${art.alias || art.name}&background=fce7f3&color=db2777`} className="w-14 h-14 rounded-full" alt={art.name} />
              <div>
                <h3 
                  className="font-bold text-lg leading-tight hover:text-primary cursor-pointer transition-colors"
                  onClick={() => setSelectedArtis(art)}
                >
                  {art.name}
                </h3>
                <p className="text-sm text-gray-500">{art.alias}</p>
              </div>
            </div>
            
            {art.ktpFile && (
              <div className="space-y-2 text-sm text-gray-600 border-t pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Dokumen:</span>
                  <a href={art.ktpFile} target="_blank" rel="noreferrer" className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                    <CheckCircle2 size={12} /> Lihat KTP
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
        {db.artis.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            Belum ada artis yang terdaftar.
          </div>
        )}
      </div>

      {/* Modal Profile Artis */}
      {selectedArtis && (
        <div className="modal-overlay">
          <div className="profile-modal">
            {/* Modal Body */}
            <div className="profile-modal-body">
              
              {/* Title / Name */}
              <h3 className="profile-name">{selectedArtis.alias || selectedArtis.name}</h3>
              <p className="profile-real-name">{selectedArtis.name}</p>

              {/* Profile Photo */}
              <div className="profile-avatar-container">
                <img 
                  src={selectedArtis.fotoProfile || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedArtis.alias || selectedArtis.name)}&background=fce7f3&color=db2777&size=200`} 
                  className="profile-avatar" 
                  alt={selectedArtis.name} 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedArtis.alias || selectedArtis.name)}&background=fce7f3&color=db2777&size=200`;
                  }}
                />
              </div>

              {/* Data Cards (Clean and soft) */}
              <div className="profile-info-group">
                <div className="profile-info-card">
                   <p className="profile-info-label">NIK / No. KTP</p>
                   <p className="profile-info-value">{selectedArtis.ktp || '-'}</p>
                </div>
                <div className="profile-info-card">
                   <p className="profile-info-label">Alamat Lengkap</p>
                   <p className="profile-info-value small">{selectedArtis.alamat || '-'}</p>
                </div>
                <div className="profile-info-card highlight">
                   <p className="profile-info-label">Informasi Bank</p>
                   <p className="profile-info-value">{selectedArtis.bank || '-'} • {selectedArtis.norek || '-'}</p>
                   <p className="profile-info-sub">a.n {selectedArtis.atasNama || '-'}</p>
                </div>
                {selectedArtis.ktpFile && (
                   <div className="profile-info-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
                      <p className="profile-info-label" style={{ margin: 0, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={18} /> Dokumen KTP
                      </p>
                   </div>
                )}
              </div>
              
              {/* Large Bottom Button */}
              <button 
                onClick={() => setSelectedArtis(null)}
                className="profile-close-btn"
              >
                Tutup Profil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
