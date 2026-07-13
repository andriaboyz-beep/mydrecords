import React, { useState, useEffect } from 'react';
import { Users, Plus, Minus, Search, MoreVertical, CheckCircle2, ScanFace, Loader2, X, Trash2 } from 'lucide-react';
import { API_URL } from '../../api';

export default function ArtisList({ db, setDb, user, activeWorkspace }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [previewKtpImage, setPreviewKtpImage] = useState(null);
  const [selectedArtis, setSelectedArtis] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, artisId: null });
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

  // Load draft from localStorage on mount/showForm
  useEffect(() => {
    if (showForm && !editingId) {
      const saved = localStorage.getItem('draft_artis_form');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Object.values(parsed).some(v => v)) {
            setFormData(prev => ({ ...prev, ...parsed }));
          }
        } catch (e) {
          console.error('Failed to parse draft', e);
        }
      }
    }
  }, [showForm, editingId]);

  // Save to localStorage whenever formData changes (only for new entries)
  useEffect(() => {
    if (showForm && !editingId) {
      const dataToSave = { ...formData };
      delete dataToSave.ktpFile;
      delete dataToSave.fotoProfile;
      localStorage.setItem('draft_artis_form', JSON.stringify(dataToSave));
    }
  }, [formData, showForm, editingId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setDb(prev => ({
        ...prev,
        artis: prev.artis.map(art => art.id === editingId ? { ...art, ...formData, status: 'active' } : art)
      }));
    } else {
      const newArtis = {
        id: `ART-${Date.now()}`,
        createdBy: user?.id,
        labelId: activeWorkspace,
        status: 'active',
        ...formData
      };
      setDb(prev => ({
        ...prev,
        artis: [...prev.artis, newArtis]
      }));
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', alias: '', ktp: '', alamat: '', bank: '', norek: '', atasNama: '', ktpFile: null, fotoProfile: null });
    localStorage.removeItem('draft_artis_form');
  };

  const handleSaveDraft = () => {
    if (editingId) {
      setDb(prev => ({
        ...prev,
        artis: prev.artis.map(art => art.id === editingId ? { ...art, ...formData, status: 'draft' } : art)
      }));
    } else {
      const newArtis = {
        id: `ART-${Date.now()}`,
        createdBy: user?.id,
        labelId: activeWorkspace,
        status: 'draft',
        ...formData
      };
      setDb(prev => ({
        ...prev,
        artis: [...prev.artis, newArtis]
      }));
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', alias: '', ktp: '', alamat: '', bank: '', norek: '', atasNama: '', ktpFile: null, fotoProfile: null });
    localStorage.removeItem('draft_artis_form');
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
      
      // Find Jalan/Alamat
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
           if (afterAlamat.length > 2) {
              jalan = afterAlamat;
           }
        }
        
        if (!jalan && alamatIdx + 1 < lines.length) {
          if (!/RT|RW|RAW|KEL|DESA|KEC/i.test(lines[alamatIdx+1])) {
             jalan = lines[alamatIdx+1].replace(/[^A-Za-z0-9 .\-,/]/g, '').trim();
          }
        }
      }

      // Fallback ekstrim untuk Jalan: Ambil baris di atas RT/RW
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

      // Find RT/RW
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

      // Find Kelurahan / Desa
      let kel = '';
      const kelLine = lines.find(l => /KEL|DESA|OESA/i.test(l) && !/KEC/i.test(l));
      if (kelLine) {
        let val = kelLine.split(':').pop().replace(/[^A-Za-z \-]/g, '').trim();
        val = val.replace(/KEL.*DESA|KEL|DESA|OESA/ig, '').trim();
        if (val) kel = `Desa ${val}`;
      }

      // Find Kecamatan
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
          <h2 className="text-2xl font-bold text-gray-800">Daftar Artis</h2>
          <p className="text-gray-500">Kelola data artis yang berada di bawah naungan atau kerja sama.</p>
        </div>
        <div className="flex gap-2">
          {showForm && (
            <>
              <button type="button" onClick={handleSaveDraft} className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                Simpan Draft
              </button>
              <button type="submit" form="artisForm" className="btn btn-primary">
                Simpan Artis
              </button>
            </>
          )}
          <button className={`btn ${showForm ? 'btn-danger' : 'btn-primary'}`} onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
              setFormData({ name: '', alias: '', ktp: '', alamat: '', bank: '', norek: '', atasNama: '', ktpFile: null, fotoProfile: null });
            } else {
              setShowForm(true);
            }
          }}>
            {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? 'Batal' : 'Tambah Artis'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-6 p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">{editingId ? 'Edit Data Artis' : 'Tambah Artis Baru'}</h3>
          <form id="artisForm" onSubmit={handleSubmit}>
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
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, fotoProfile: reader.result }));
                      };
                      reader.readAsDataURL(file);
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
          </form>
        </div>
      )}

      <div className="card mb-6 p-4 flex gap-4">
        <div className="input-icon-left flex-1">
          <Search size={18} />
          <input type="text" className="form-control" placeholder="Cari nama artis..." />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #f3f4f6', marginTop: '16px' }}>
        {db.artis.map(art => (
          <div 
            key={art.id} 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'minmax(250px, 3fr) minmax(80px, 1fr) minmax(150px, 2fr) minmax(150px, 2fr) minmax(120px, 1fr) minmax(150px, 2fr)',
              alignItems: 'center', 
              padding: '16px', 
              borderBottom: '1px solid #f3f4f6', 
              cursor: 'pointer',
              gap: '16px',
              backgroundColor: '#ffffff',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            onClick={() => setSelectedArtis(art)}
          >
            {/* 1. Avatar, Name & Alias */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img 
                  src={art.fotoProfile || `https://ui-avatars.com/api/?name=${encodeURIComponent(art.alias || art.name || 'Draft')}&background=fce7f3&color=db2777`} 
                  style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  alt={art.name || 'Draft'} 
                />
              </div>
              <div style={{ marginLeft: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {art.name || 'Tanpa Nama'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: '#6b7280', backgroundColor: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {art.alias || 'Belum ada alias'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Counter */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#4b5563' }}>1</span>
            </div>

            {/* 3. Date & Location (Left aligned) */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 2px 0' }}>{art.createdAt ? new Date(art.createdAt).toISOString().split('T')[0] : '2026-07-17'}</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{art.alamat ? (art.alamat.split(',')[0].length > 15 ? art.alamat.substring(0,15)+'...' : art.alamat.split(',')[0]) : 'Jakarta'}</p>
            </div>

            {/* NEW: Bank Info */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 2px 0' }}>{art.bank || '-'}</p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{art.norek || '-'}</p>
            </div>

            {/* 4. Status */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: art.status === 'draft' ? '#eab308' : '#10b981' }}></div>
                <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: art.status === 'draft' ? '#ca8a04' : '#10b981' }}>
                  {art.status === 'draft' ? 'DRAFT' : 'LIVE'}
                </span>
              </div>
            </div>

            {/* 5. Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px', color: '#9ca3af' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedArtis(art); }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex' }}
                title="Detail / Edit"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex' }} onClick={(e) => e.stopPropagation()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', opacity: 0.5 }} onClick={(e) => e.stopPropagation()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', opacity: 0.5 }} onClick={(e) => e.stopPropagation()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setDeleteConfirmModal({ show: true, artisId: art.id }); }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ef4444', display: 'flex' }}
                title="Hapus"
              >
                <Trash2 size={18} />
              </button>
            </div>
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
              <h3 className="profile-name flex items-center justify-center">
                {selectedArtis.alias || selectedArtis.name || 'Tanpa Nama'}
                {selectedArtis.status === 'draft' && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">Draft</span>}
              </h3>
              <p className="profile-real-name">{selectedArtis.name || 'Belum ada nama lengkap'}</p>

              {/* Profile Photo */}
              <div className="profile-avatar-container">
                <img 
                  src={selectedArtis.fotoProfile || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedArtis.alias || selectedArtis.name || 'Draft')}&background=fce7f3&color=db2777&size=200`} 
                  className="profile-avatar" 
                  alt={selectedArtis.name || 'Draft'} 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedArtis.alias || selectedArtis.name || 'Draft')}&background=fce7f3&color=db2777&size=200`;
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
                   <button 
                     onClick={() => setPreviewKtpImage(selectedArtis.ktpFile)}
                     className="profile-info-card" 
                     style={{ width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}
                   >
                      <p className="profile-info-label" style={{ margin: 0, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={18} /> Lihat KTP
                      </p>
                   </button>
                )}
              </div>
              
              {/* Large Bottom Button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '1.5rem' }}>
                <button 
                  onClick={() => {
                    setFormData({
                      name: selectedArtis.name || '',
                      alias: selectedArtis.alias || '',
                      ktp: selectedArtis.ktp || '',
                      alamat: selectedArtis.alamat || '',
                      bank: selectedArtis.bank || '',
                      norek: selectedArtis.norek || '',
                      atasNama: selectedArtis.atasNama || '',
                      ktpFile: selectedArtis.ktpFile || null,
                      fotoProfile: selectedArtis.fotoProfile || null
                    });
                    setEditingId(selectedArtis.id);
                    setShowForm(true);
                    setSelectedArtis(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn btn-outline-primary"
                  style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold', borderRadius: '0.75rem', borderWidth: '2px', borderStyle: 'solid' }}
                >
                  Edit Data Artis
                </button>
                <button 
                  onClick={() => setSelectedArtis(null)}
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
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Dokumen terlampir untuk artis ini</p>
              
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

      {/* Delete Confirm Modal */}
      {deleteConfirmModal.show && (
        <div className="success-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="success-modal-content" style={{ maxWidth: '280px' }}>
            <div className="success-modal-header">
              <div className="success-modal-icon-container">
                <div className="success-modal-icon" style={{ backgroundColor: '#ef4444' }}>
                  <X size={24} strokeWidth={4} />
                </div>
              </div>
            </div>
            
            <div className="success-modal-body">
              <h2 className="success-modal-title">Konfirmasi</h2>
              <p className="success-modal-text">
                Apakah Anda yakin ingin menghapus data artis ini?
              </p>
            </div>
            
            <div style={{ display: 'flex', width: '100%' }}>
              <button 
                style={{ flex: 1, backgroundColor: '#9ca3af', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}
                className="success-modal-btn"
                onClick={() => setDeleteConfirmModal({ show: false, artisId: null })}
              >
                Batal
              </button>
              <button 
                style={{ flex: 1, backgroundColor: '#ef4444', color: 'white' }}
                className="success-modal-btn"
                onClick={() => {
                  setDb(prev => ({
                    ...prev,
                    artis: prev.artis.filter(a => a.id !== deleteConfirmModal.artisId)
                  }));
                  setDeleteConfirmModal({ show: false, artisId: null });
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
