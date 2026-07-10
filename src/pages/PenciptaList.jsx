import React, { useState } from 'react';
import { Users, Plus, Minus, Search, MoreVertical, CheckCircle2, ScanFace, Loader2, X } from 'lucide-react';
import { API_URL } from '../api';

export default function PenciptaList({ db, setDb, onNavigate, user, activeWorkspace }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [previewKtpImage, setPreviewKtpImage] = useState(null);
  const [selectedPencipta, setSelectedPencipta] = useState(null);
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
    if (editingId) {
      setDb(prev => ({
        ...prev,
        pencipta: prev.pencipta.map(pct => pct.id === editingId ? { ...pct, ...formData } : pct)
      }));
    } else {
      const newPencipta = {
        id: `PCT-${Date.now()}`,
        createdBy: user?.id,
        labelId: activeWorkspace,
        ...formData
      };
      setDb(prev => ({
        ...prev,
        pencipta: [...prev.pencipta, newPencipta]
      }));
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', alias: '', ktp: '', alamat: '', bank: '', norek: '', atasNama: '', ktpFile: null, fotoProfile: null });
  };

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, fotoProfile: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleKTPScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);

    try {
      // Read file and compress to base64 via Canvas to bypass 1MB Nginx limit
      const base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let targetWidth = 1200; // optimal for OCR
            let scale = img.width > targetWidth ? targetWidth / img.width : 1;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            
            // Save original or compressed for preview persistence
            setFormData(prev => ({ ...prev, ktpFile: compressedBase64 }));
            resolve(compressedBase64);
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      });

      // Send to server for OCR processing
      const response = await fetch(`${API_URL}/scan_ktp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'OCR failed');
      }

      const data = await response.json();
      const text = data.text || '';
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let parsedNik = '';
      let parsedNama = '';
      let parsedAlamat = '';
      let kota = '';
      let provinsi = '';

      for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].includes('PROVINSI')) provinsi = lines[i].replace(/[^A-Z ]/g, '').trim();
        if (lines[i].includes('KOTA') || lines[i].includes('KABUPATEN')) kota = lines[i].replace(/[^A-Z ]/g, '').trim();
      }

      // Find NIK
      const digitsLine = lines.map(l => l.replace(/\D/g, '')).find(d => d.length >= 12);
      if (digitsLine) {
        parsedNik = digitsLine.substring(0, 16);
      }
      
      // Find Nama
      const namaIdx = lines.findIndex(l => l.toUpperCase().replace(/\s/g, '').includes('NAMA'));
      if (namaIdx !== -1) {
        let line = lines[namaIdx];
        let afterNama = '';
        if (line.includes(':')) {
          afterNama = line.split(':').slice(1).join(':').trim();
        } else {
          afterNama = line.replace(/.*N\s*A\s*M\s*A/i, '').replace(/^[^A-Za-z]*/, '').trim();
        }
        
        if (afterNama.length > 2) {
          parsedNama = afterNama.replace(/[^A-Za-z .\-']/g, '').trim().toUpperCase();
        } else if (namaIdx + 1 < lines.length) {
          parsedNama = lines[namaIdx+1].replace(/[^A-Za-z .\-']/g, '').trim().toUpperCase();
        }
      }

      // Fallback for Nama: line after NIK
      if (!parsedNama && parsedNik) {
        const nikIdxForNama = lines.findIndex(l => l.replace(/\D/g, '').includes(parsedNik));
        if (nikIdxForNama !== -1 && nikIdxForNama + 1 < lines.length) {
          let possibleNama = lines[nikIdxForNama + 1];
          if (!possibleNama.toUpperCase().includes('LAHIR') && !possibleNama.toUpperCase().includes('TEMPAT')) {
             parsedNama = possibleNama.replace(/[^A-Za-z .\-']/g, '').trim().toUpperCase();
          }
        }
      }

      // Clean up NAMA prefix if any
      if (parsedNama) {
         parsedNama = parsedNama.replace(/^N\s*A\s*M\s*A\s*/i, '').trim();
         parsedNama = parsedNama.replace(/^:\s*/, '').trim();
      }
      
      let jalan = '';
      const alamatIdx = lines.findIndex(l => /A\s*L\s*A\s*M\s*A\s*T/i.test(l));
      if (alamatIdx !== -1) {
        let line = lines[alamatIdx];
        if (line.includes(':')) {
           const parts = line.split(':');
           if (parts.length > 1 && parts[1].trim().length > 2) {
              jalan = parts[1].replace(/[^A-Za-z0-9 .\-,/]/g, '').trim();
           }
        } else {
           const afterAlamat = line.replace(/.*A\s*L\s*A\s*M\s*A\s*T/i, '').replace(/[^A-Za-z0-9 .\-,/]/g, '').trim();
           if (afterAlamat.length > 2) jalan = afterAlamat;
        }
        
        if (!jalan && alamatIdx + 1 < lines.length) {
          if (!/RT|RW|RAW|KEL|DESA|KEC/i.test(lines[alamatIdx+1])) {
             jalan = lines[alamatIdx+1].replace(/[^A-Za-z0-9 .\-,/]/g, '').trim();
          }
        }
      }

      if (!jalan || jalan.length < 3) {
         const rtIdx = lines.findIndex(l => /RT.*RW|RAW|RTI|\d{2,3}[\/|]\d{2,3}/i.test(l) && !/ALAMAT/i.test(l));
         if (rtIdx > 0) {
            const lineAbove = lines[rtIdx - 1];
            if (!/KELAMIN|AGAMA|STATUS|NAMA|LAHIR|KECAMATAN|PROVINSI|KOTA/i.test(lineAbove)) {
               let fallbackJalan = lineAbove.replace(/.*A\s*L\s*A\s*M\s*A\s*T/i, '').replace(/[^A-Za-z0-9 .\-,/]/g, '').trim();
               fallbackJalan = fallbackJalan.replace(/^[.:,\-\s]+/, '');
               if (fallbackJalan.length > 2) jalan = fallbackJalan;
            }
         }
      }

      let rtRw = '';
      const rtLine = lines.find(l => /RT.*RW|RAW|RTI|\d{2,3}[\/|]\d{2,3}/i.test(l) && !l.toUpperCase().includes('ALAMAT'));
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

      let kel = '';
      const kelLine = lines.find(l => /KEL|DESA|OESA/i.test(l) && !/KEC/i.test(l));
      if (kelLine) {
        let val = kelLine.split(':').pop().replace(/[^A-Za-z \-]/g, '').trim();
        val = val.replace(/KEL.*DESA|KEL|DESA|OESA/ig, '').trim();
        if (val) kel = `Desa ${val}`;
      }

      let kec = '';
      const kecLine = lines.find(l => /KEC|KECAMATAN/i.test(l) && !/KEL/i.test(l));
      if (kecLine) {
        let val = kecLine.split(':').pop().replace(/[^A-Za-z \-]/g, '').trim();
        val = val.replace(/KECAMATAN|KEC/ig, '').trim();
        if (val) kec = `Kec. ${val}`;
      }
      
      parsedAlamat = [jalan, rtRw, kel, kec, kota, provinsi]
        .filter(Boolean)
        .join(', ')
        .replace(/\s+/g, ' ') 
        .replace(/, ,/g, ',')
        .toUpperCase();

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
          <h2 className="text-2xl font-bold text-gray-800">Daftar Pencipta</h2>
          <p className="text-gray-500">Kelola data pencipta lagu / komposer yang terdaftar.</p>
        </div>
        <button className={`btn ${showForm ? 'btn-danger' : 'btn-primary'}`} onClick={() => {
          if (showForm) {
            setShowForm(false);
            setEditingId(null);
            setFormData({ name: '', alias: '', ktp: '', alamat: '', bank: '', norek: '', atasNama: '', ktpFile: null, fotoProfile: null });
          } else {
            setShowForm(true);
          }
        }}>
          {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? 'Batal' : 'Tambah Pencipta'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">{editingId ? 'Edit Data Pencipta' : 'Tambah Pencipta Baru'}</h3>
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

              <div className="form-group col-span-2">
                <div className="p-4 border-2 border-dashed border-primary rounded-lg bg-indigo-50 relative overflow-hidden">
                  <label className="font-bold flex items-center gap-2 mb-2">
                    Foto Terkini
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Upload foto wajah terkini pencipta.</p>
                  <input name="fotoProfile" onChange={handleFotoUpload} type="file" accept="image/*" className="form-control file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">Simpan Pencipta</button>
            </div>
          </form>
        </div>
      )}

      <div className="card mb-6 p-4 flex gap-4">
        <div className="input-icon-left flex-1">
          <Search size={18} />
          <input type="text" className="form-control" placeholder="Cari nama pencipta..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {db.pencipta.map(pct => (
          <div key={pct.id} className="card p-5 relative group">
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h3 
                  className="font-bold text-lg leading-tight hover:text-primary cursor-pointer transition-colors"
                  onClick={() => setSelectedPencipta(pct)}
                >
                  {pct.name}
                </h3>
                <p className="text-sm text-gray-500">{pct.alias}</p>
              </div>
            </div>
            
            {pct.ktpFile && (
              <div className="space-y-2 text-sm text-gray-600 border-t pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Dokumen:</span>
                  <button onClick={() => setPreviewKtpImage(pct.ktpFile)} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                    <CheckCircle2 size={12} /> Lihat KTP
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {db.pencipta.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            Belum ada pencipta yang terdaftar.
          </div>
        )}
      </div>

      {/* Modal Profile Pencipta */}
      {selectedPencipta && (
        <div className="modal-overlay">
          <div className="profile-modal">
            <div className="profile-modal-body">

              <h3 className="profile-name">{selectedPencipta.alias || selectedPencipta.name}</h3>
              <p className="profile-real-name">{selectedPencipta.name}</p>
              
              {/* Profile Photo */}
              <div className="profile-avatar-container">
                <img 
                  src={selectedPencipta.fotoProfile || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPencipta.alias || selectedPencipta.name)}&background=fce7f3&color=db2777&size=200`} 
                  className="profile-avatar" 
                  alt={selectedPencipta.name} 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPencipta.alias || selectedPencipta.name)}&background=fce7f3&color=db2777&size=200`;
                  }}
                />
              </div>

              <div className="profile-info-group">
                <div className="profile-info-card">
                   <p className="profile-info-label">NIK / No. KTP</p>
                   <p className="profile-info-value">{selectedPencipta.ktp || '-'}</p>
                </div>
                <div className="profile-info-card">
                   <p className="profile-info-label">Alamat Lengkap</p>
                   <p className="profile-info-value small">{selectedPencipta.alamat || '-'}</p>
                </div>
                <div className="profile-info-card highlight">
                   <p className="profile-info-label">Informasi Bank</p>
                   <p className="profile-info-value">{selectedPencipta.bank || '-'} • {selectedPencipta.norek || '-'}</p>
                   <p className="profile-info-sub">a.n {selectedPencipta.atasNama || '-'}</p>
                </div>
                {selectedPencipta.ktpFile && (
                   <button 
                     onClick={() => setPreviewKtpImage(selectedPencipta.ktpFile)}
                     className="profile-info-card" 
                     style={{ width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}
                   >
                      <p className="profile-info-label" style={{ margin: 0, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={18} /> Lihat KTP
                      </p>
                   </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '1.5rem' }}>
                <button 
                  onClick={() => {
                    setFormData({
                      name: selectedPencipta.name || '',
                      alias: selectedPencipta.alias || '',
                      ktp: selectedPencipta.ktp || '',
                      alamat: selectedPencipta.alamat || '',
                      bank: selectedPencipta.bank || '',
                      norek: selectedPencipta.norek || '',
                      atasNama: selectedPencipta.atasNama || '',
                      ktpFile: selectedPencipta.ktpFile || null,
                      fotoProfile: selectedPencipta.fotoProfile || null
                    });
                    setEditingId(selectedPencipta.id);
                    setShowForm(true);
                    setSelectedPencipta(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn btn-outline-primary"
                  style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold', borderRadius: '0.75rem', borderWidth: '2px', borderStyle: 'solid' }}
                >
                  Edit Data Pencipta
                </button>
                <button 
                  onClick={() => setSelectedPencipta(null)}
                  className="profile-close-btn"
                >
                  Tutup Profil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview KTP (Modern Success Style) */}
      {previewKtpImage && (
        <div className="modal-overlay" onClick={() => setPreviewKtpImage(null)}>
          <div 
            className="profile-modal" 
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Purple Header with Icon */}
            <div style={{ backgroundColor: 'var(--primary)', height: '7rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', bottom: '-2rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ backgroundColor: '#10b981', width: '3.5rem', height: '3.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={32} color="white" />
                </div>
              </div>
            </div>
            
            {/* White Body with Image */}
            <div style={{ paddingTop: '3rem', paddingBottom: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Preview KTP</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Dokumen terlampir untuk pencipta ini</p>
              
              <div style={{ width: '100%', backgroundColor: 'var(--bg-main)', borderRadius: '0.75rem', overflow: 'hidden', border: '2px dashed var(--border-color)' }}>
                <img 
                  src={previewKtpImage} 
                  alt="Preview KTP" 
                  style={{ width: '100%', maxHeight: '45vh', objectFit: 'contain', display: 'block' }}
                />
              </div>
            </div>

            {/* Bottom Purple Button */}
            <button 
              onClick={() => setPreviewKtpImage(null)}
              style={{ width: '100%', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: '1.125rem', padding: '1rem', border: 'none', cursor: 'pointer' }}
            >
              Oke
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
