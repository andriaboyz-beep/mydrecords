import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X,
  Plus,
  Info,
  Check,
  ArrowRight,
  ArrowLeft,
  FileEdit,
  Calendar,
  Building,
  User,
  Users,
  RefreshCw
} from 'lucide-react';

export default function KontrakBaru({ onBack, contractData, setContractData, db, setDb, user, activeWorkspace }) {
  const [activeStep, setActiveStep] = useState(1);
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  // Auto-generate nomorKontrak for new contracts
  useEffect(() => {
    if (!contractData.id && !contractData.nomorKontrak && !hasAutoFilled) {
      let maxNum = 49;
      db.kontrak.forEach(k => {
        if (k.nomorKontrak) {
          const match = k.nomorKontrak.match(/^(\d{4})\//);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
      });
      
      const nextNum = String(maxNum + 1).padStart(4, '0');
      const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      const currentMonth = romanMonths[new Date().getMonth()];
      const currentYear = new Date().getFullYear();
      
      const nextNomorKontrak = `${nextNum}/PKS/RSA/MYDR/${currentMonth}/${currentYear}`;
      
      setContractData(prev => ({
        ...prev,
        nomorKontrak: nextNomorKontrak
      }));
      setHasAutoFilled(true);
    }
  }, [contractData.id, contractData.nomorKontrak, db.kontrak, setContractData, hasAutoFilled]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = parseInt(entry.target.id.replace('section-', ''), 10);
            if (!isNaN(step)) {
              setActiveStep(step);
            }
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    [1, 2, 3, 4].forEach((step) => {
      const el = document.getElementById(`section-${step}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToStep = (step) => {
    if (step === 5) {
      onBack('preview-kontrak');
    } else {
      setActiveStep(step);
      const el = document.getElementById(`section-${step}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContractData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const rawDate = e.target.value;
    if (!rawDate) {
      setContractData(prev => ({
         ...prev,
         tanggalTtd: '',
         tanggalCetak: '',
         hariTerbilang: '',
         tanggalTerbilang: '',
         bulanTerbilang: '',
         tahunTerbilang: ''
      }));
      return;
    }

    const dateObj = new Date(rawDate);
    const hari = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'][dateObj.getDay()];
    const bulanArr = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
    const bulan = bulanArr[dateObj.getMonth()];
    
    const tanggal = dateObj.getDate().toString().padStart(2, '0');
    const tahun = dateObj.getFullYear().toString();
    
    const bulanNormal = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][dateObj.getMonth()];
    const tanggalCetak = `${dateObj.getDate()} ${bulanNormal} ${tahun}`;

    setContractData(prev => ({
      ...prev,
      tanggalTtd: rawDate,
      tanggalCetak: tanggalCetak,
      hariTerbilang: hari,
      tanggalTerbilang: tanggal,
      bulanTerbilang: bulan,
      tahunTerbilang: tahun
    }));
  };

  const isFormValid = () => {
    const requiredFields = [
      'nomorKontrak',
      'tempatTtd',
      'tanggalTtd',
      'pihak1_perusahaan',
      'pihak1_wakil',
      'pihak2_nama',
      'pihak2_ktp',
      'pihak2_alamat'
    ];
    
    if (contractData?.jenisKontrak === 'pencipta') {
      requiredFields.push('lagu_judul');
    } else {
      requiredFields.push('pihak2_panggung');
    }

    const emptyFields = requiredFields.filter(field => !contractData?.[field] || String(contractData[field]).trim() === '');
    return emptyFields.length === 0;
  };

  const validateForm = () => {
    const valid = isFormValid();
    if (!valid) {
      alert('Mohon lengkapi semua data wajib sebelum menyimpan sebagai Kontrak Aktif.');
      return false;
    }
    return true;
  };

  const saveContract = (targetStatus) => {
    if (!setDb) {
      alert('Fungsi simpan belum tersedia.');
      return;
    }
    
    if (targetStatus === 'Aktif' && !validateForm()) {
      return; // Stop if validation fails
    }

    const contractId = contractData.id || `KNT-${Date.now()}`;
    const newContract = {
      ...contractData,
      id: contractId,
      createdBy: contractData.createdBy || user?.id,
      labelId: contractData.labelId || activeWorkspace,
      status: targetStatus,
      createdAt: contractData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setDb(prev => {
      const exists = prev.kontrak.find(k => k.id === contractId);
      let newKontrakList = exists 
        ? prev.kontrak.map(k => k.id === contractId ? newContract : k)
        : [...prev.kontrak, newContract];

      // Auto-register Artis or Pencipta if they don't exist yet
      const isArtis = newContract.jenisKontrak === 'artis';
      const targetArrayName = isArtis ? 'artis' : 'pencipta';
      const targetArray = prev[targetArrayName] || [];
      
      let newTargetArray = [...targetArray];
      // Check if already registered by KTP (and KTP is not empty)
      const existingPersonIndex = newContract.pihak2_ktp ? targetArray.findIndex(p => p.ktp === newContract.pihak2_ktp) : -1;
      
      if (newContract.pihak2_nama) {
        const personData = {
          name: newContract.pihak2_nama,
          alias: newContract.pihak2_panggung || newContract.pihak2_alias || newContract.pihak2_nama,
          ktp: newContract.pihak2_ktp || '',
          alamat: newContract.pihak2_alamat || '',
          bank: newContract.pihak2_bank || '',
          norek: newContract.pihak2_norek || '',
          atasNama: newContract.pihak2_atasnama || '',
          labelId: activeWorkspace,
          createdBy: newContract.createdBy || user?.id
        };

        if (existingPersonIndex >= 0) {
          // Update existing
          newTargetArray[existingPersonIndex] = {
            ...newTargetArray[existingPersonIndex],
            ...personData
          };
        } else {
          // Create new
          const prefix = isArtis ? 'ART' : 'PCT';
          personData.id = `${prefix}-${Date.now()}`;
          newTargetArray.push(personData);
        }
      }

      return {
        ...prev,
        kontrak: newKontrakList,
        [targetArrayName]: newTargetArray
      };
    });
    
    let successMessage = '';
    if (targetStatus === 'Aktif' && isEditActive) {
      successMessage = 'Kontrak Aktif berhasil diperbarui!';
    } else if (targetStatus === 'Aktif') {
      successMessage = 'Kontrak Baru berhasil dibuat dan diaktifkan!';
    } else {
      successMessage = 'Draft kontrak berhasil disimpan!';
    }
    
    setSuccessModal({
      show: true,
      message: successMessage
    });
  };

  const isEditMode = Boolean(contractData?.id);
  const isEditActive = isEditMode && contractData?.status === 'Aktif';
  const formReady = isFormValid();

  return (
    <div className="wizard-container">
      {/* HEADER WIZARD */}
      <div className="wizard-header">
        <div className="wizard-header-title">
          <h2>{isEditMode ? 'Edit Kontrak' : 'Kontrak Baru'}</h2>
          <p>{isEditMode ? 'Perbarui data kontrak yang sudah ada' : 'Buat kontrak baru untuk artis atau pencipta'}</p>
        </div>
        <div className="wizard-header-actions" style={{ gap: '12px' }}>
          {!isEditActive && (
            <button className="btn btn-outline" onClick={() => saveContract('Draft')}>
              <Save size={16} />
              <span className="text-primary font-bold">Simpan Draft</span>
            </button>
          )}
          
          <button 
            className="btn btn-primary" 
            onClick={() => saveContract('Aktif')}
            disabled={!formReady}
            style={{
              ...(isEditActive ? { backgroundColor: '#f3f4f6', color: '#2563eb', border: '1px solid #bfdbfe' } : {}),
              opacity: formReady ? 1 : 0.5,
              cursor: formReady ? 'pointer' : 'not-allowed'
            }}
            title={!formReady ? "Isi semua data wajib untuk mengaktifkan tombol ini" : ""}
          >
            {isEditActive ? <RefreshCw size={16} /> : <Check size={16} />}
            <span className="font-bold">
              {isEditActive ? 'Perbarui Kontrak' : 'Simpan Kontrak Aktif'}
            </span>
          </button>
          
          <button className="btn btn-icon" onClick={() => onBack('dashboard')} style={{ marginLeft: '8px' }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* HORIZONTAL STEPPER */}
      <div className="horizontal-stepper">
        <div className={`step-item ${activeStep >= 1 ? 'active' : ''} ${activeStep === 1 ? 'active-current' : ''} cursor-pointer`} onClick={() => scrollToStep(1)}>
          <div className="step-number">1</div>
          <div className="step-text">
            <p className="step-title">Jenis Kontrak</p>
            <p className="step-desc">Pilih jenis kontrak</p>
          </div>
        </div>
        <div className="step-divider"></div>
        <div className={`step-item ${activeStep >= 2 ? 'active' : ''} ${activeStep === 2 ? 'active-current' : ''} cursor-pointer`} onClick={() => scrollToStep(2)}>
          <div className="step-number">2</div>
          <div className="step-text">
            <p className="step-title">Pihak</p>
            <p className="step-desc">Pilih pihak terkait</p>
          </div>
        </div>
        <div className="step-divider"></div>
        <div className={`step-item ${activeStep >= 3 ? 'active' : ''} ${activeStep === 3 ? 'active-current' : ''} cursor-pointer`} onClick={() => scrollToStep(3)}>
          <div className="step-number">3</div>
          <div className="step-text">
            <p className="step-title">Detail Kontrak</p>
            <p className="step-desc">Isi detail perjanjian</p>
          </div>
        </div>
        <div className="step-divider"></div>
        <div className={`step-item ${activeStep >= 4 ? 'active' : ''} ${activeStep === 4 ? 'active-current' : ''} cursor-pointer`} onClick={() => scrollToStep(4)}>
          <div className="step-number">4</div>
          <div className="step-text">
            <p className="step-title">Ketentuan</p>
            <p className="step-desc">Atur rekening & saksi</p>
          </div>
        </div>
        <div className="step-divider"></div>
        <div className={`step-item ${activeStep >= 5 ? 'active' : ''} ${activeStep === 5 ? 'active-current' : ''} cursor-pointer`} onClick={() => scrollToStep(5)}>
          <div className="step-number">5</div>
          <div className="step-text">
            <p className="step-title">Preview</p>
            <p className="step-desc">Tinjau & simpan</p>
          </div>
        </div>
      </div>

      <div className="wizard-body">
        {/* LEFT COLUMN: FORM */}
        <div className="wizard-form-area">
          
          {/* SECTION 1: Jenis Kontrak */}
          <div id="section-1" className="form-section card mb-6">
            <div className="form-section-header">
              <div>
                <h3>Pilih Jenis Kontrak</h3>
                <p>Tentukan jenis kontrak yang ingin dibuat</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                type="button"
                className={`btn flex-1 py-3 justify-center flex-col gap-1 ${contractData?.jenisKontrak === 'artis' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setContractData(prev => ({ 
                  ...prev, 
                  jenisKontrak: 'artis',
                  nomorKontrak: prev.nomorKontrak ? prev.nomorKontrak.replace('PCL', 'RSA') : ''
                }))}
              >
                <span className="font-bold text-base">Kontrak Rekaman Artis</span>
                <span className="text-xs opacity-80">Untuk penyanyi, musisi, atau grup band</span>
              </button>
              <button 
                type="button"
                className={`btn flex-1 py-3 justify-center flex-col gap-1 ${contractData?.jenisKontrak === 'pencipta' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setContractData(prev => ({ 
                  ...prev, 
                  jenisKontrak: 'pencipta',
                  nomorKontrak: prev.nomorKontrak ? prev.nomorKontrak.replace('RSA', 'PCL') : ''
                }))}
              >
                <span className="font-bold text-base">Kontrak Pencipta Lagu</span>
                <span className="text-xs opacity-80">Untuk penulis lirik dan pencipta karya musik</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: Pihak */}
          <div id="section-2" className="form-section card">
            <div className="form-section-header">
              <div>
                <h3>1. Pihak yang Terlibat</h3>
                <p>Tentukan pihak pertama (Anda) dan pihak kedua ({contractData?.jenisKontrak === 'pencipta' ? 'Pencipta' : 'Artis'})</p>
              </div>
            </div>
            
            <div className="form-row grid-cols-2 gap-6">
              {/* Pihak Pertama */}
              <div className="party-box">
                <h4 className="party-title text-primary">Pihak Pertama (Perusahaan / Label)</h4>
                
                <div className="form-group">
                  <label>Perusahaan / Label <span className="text-danger">*</span></label>
                  <input type="text" name="pihak1_perusahaan" value={contractData?.pihak1_perusahaan || ''} onChange={handleChange} className="form-control" />
                </div>
                
                <div className="form-group">
                  <label>Alias Perusahaan <span className="text-danger">*</span></label>
                  <input type="text" name="pihak1_alias" value={contractData?.pihak1_alias || ''} onChange={handleChange} className="form-control" />
                </div>
                
                <div className="form-group">
                  <label>Alamat Perusahaan <span className="text-danger">*</span></label>
                  <textarea name="pihak1_alamat" value={contractData?.pihak1_alamat || ''} onChange={handleChange} className="form-control" rows="2" />
                </div>
                
                <div className="form-group">
                  <label>Diwakili Oleh <span className="text-danger">*</span></label>
                  <input type="text" name="pihak1_wakil" value={contractData?.pihak1_wakil || ''} onChange={handleChange} className="form-control" />
                </div>
                
                <div className="form-group">
                  <label>Jabatan <span className="text-danger">*</span></label>
                  <input type="text" name="pihak1_jabatan" value={contractData?.pihak1_jabatan || ''} onChange={handleChange} className="form-control" />
                </div>
              </div>

              {/* Pihak Kedua */}
              <div className="party-box">
                <h4 className="party-title text-primary">
                  {contractData?.jenisKontrak === 'pencipta' ? 'Pihak Kedua (Pencipta Lagu)' : 'Pihak Kedua (Artis)'}
                </h4>
                
                <div className="space-y-6">
                  <div className="form-group mb-6">
                    <label className="font-bold text-lg text-primary">
                      Pilih {contractData?.jenisKontrak === 'pencipta' ? 'Pencipta' : 'Artis'} dari Database
                    </label>
                    <select 
                      className="form-control"
                      onChange={(e) => {
                        const id = e.target.value;
                        if (!id) return;
                        if (contractData?.jenisKontrak === 'pencipta') {
                          const selected = db?.pencipta?.find(p => p.id === id);
                          if (selected) {
                            setContractData(prev => ({
                              ...prev,
                              pihak2_nama: selected.name,
                              pihak2_alias: selected.alias,
                              pihak2_ktp: selected.ktp,
                              pihak2_alamat: selected.alamat,
                              pihak2_hp: selected.hp || '',
                              pihak2_email: selected.email || '',
                              rekening_bank: selected.bank,
                              rekening_nomor: selected.norek,
                              rekening_nama: selected.atasNama
                            }));
                          }
                        } else {
                          const selected = db?.artis?.find(a => a.id === id);
                          if (selected) {
                            setContractData(prev => ({
                              ...prev,
                              pihak2_nama: selected.name,
                              pihak2_alias: selected.alias,
                              pihak2_ktp: selected.ktp,
                              pihak2_alamat: selected.alamat,
                              rekening_bank: selected.bank,
                              rekening_nomor: selected.norek,
                              rekening_nama: selected.atasNama
                            }));
                          }
                        }
                      }}
                    >
                      <option value="">-- Pilih {contractData?.jenisKontrak === 'pencipta' ? 'Pencipta' : 'Artis'} --</option>
                      {contractData?.jenisKontrak === 'pencipta' ? (
                        db?.pencipta?.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.alias})</option>
                        ))
                      ) : (
                        db?.artis?.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.alias})</option>
                        ))
                      )}
                    </select>
                    <p className="text-sm text-gray-500 mt-2">Pilih untuk mengisi otomatis data di bawah ini.</p>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Nama Asli Sesuai KTP <span className="text-danger">*</span></label>
                  <input type="text" name="pihak2_nama" value={contractData?.pihak2_nama || ''} onChange={handleChange} className="form-control" placeholder="nama sesuai KTP" />
                </div>
                <div className="form-group">
                  <label>Nomor KTP (NIK) <span className="text-danger">*</span></label>
                  <input type="text" name="pihak2_ktp" value={contractData?.pihak2_ktp || ''} onChange={handleChange} className="form-control" placeholder="masukkan 16 digit NIK" />
                </div>
                <div className="form-group md:col-span-2">
                  <label>Alamat KTP <span className="text-danger">*</span></label>
                  <textarea name="pihak2_alamat" value={contractData?.pihak2_alamat || ''} onChange={handleChange} className="form-control" rows="3" placeholder="alamat lengkap sesuai KTP..." />
                </div>
                
                {contractData?.jenisKontrak === 'pencipta' ? (
                  <>
                    <div className="form-group">
                      <label>Nomor HP / WhatsApp</label>
                      <input type="text" name="pihak2_hp" value={contractData?.pihak2_hp || ''} onChange={handleChange} className="form-control" placeholder="contoh: 08123456789" />
                    </div>
                    <div className="form-group">
                      <label>Email <span className="text-gray-400 font-normal text-xs">(Opsional)</span></label>
                      <input type="email" name="pihak2_email" value={contractData?.pihak2_email || ''} onChange={handleChange} className="form-control" placeholder="nama@email.com" />
                    </div>
                  </>
                  
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="form-group">
                        <label>Nama Panggung / Group <span className="text-danger">*</span></label>
                        <input type="text" name="pihak2_panggung" value={contractData?.pihak2_panggung || ''} onChange={handleChange} className="form-control" placeholder="nama panggung / nama grup" />
                      </div>
                      <div className="form-group">
                        <label>Alias Penanda Tangan <span className="text-danger">*</span></label>
                        <input type="text" name="pihak2_alias" value={contractData?.pihak2_alias || ''} onChange={handleChange} className="form-control" placeholder="nama sesuai KTP" />
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION FOR SONG DETAILS (Only for Pencipta Lagu) */}
          {contractData?.jenisKontrak === 'pencipta' && (
            <div className="form-section card mb-6 mt-6">
              <div className="form-section-header">
                <div>
                  <h3>2. Objek Perjanjian (Lagu)</h3>
                  <p>Isi informasi detail mengenai lagu yang diserahkan</p>
                </div>
              </div>
              
              <div className="form-row grid-cols-2 gap-6">
                <div className="form-group">
                  <label>Judul Lagu <span className="text-danger">*</span></label>
                  <input type="text" name="lagu_judul" value={contractData?.lagu_judul || ''} onChange={handleChange} className="form-control" placeholder="Contoh: Sang Dewi" />
                </div>
                <div className="form-group">
                  <label>Genre <span className="text-danger">*</span></label>
                  <input type="text" name="lagu_genre" value={contractData?.lagu_genre || ''} onChange={handleChange} className="form-control" placeholder="Pop, Rock, R&B, dll" />
                </div>
              </div>

              <div className="form-row grid-cols-2 gap-6 mt-4">
                <div className="form-group">
                  <label>Durasi <span className="text-danger">*</span></label>
                  <input type="text" name="lagu_durasi" value={contractData?.lagu_durasi || ''} onChange={handleChange} className="form-control" placeholder="e.g. 03:45" />
                </div>
                <div className="form-group">
                  <label>Tanggal Penyerahan <span className="text-danger">*</span></label>
                  <input type="text" name="lagu_tanggalPenyerahan" value={contractData?.lagu_tanggalPenyerahan || ''} onChange={handleChange} className="form-control" placeholder="e.g. 04 Juli 2025" />
                </div>
              </div>
            </div>
          )}
 
          {/* SECTION 3: Dokumentasi */}
          <div id="section-3" className="form-section card mb-6 mt-6">
            <div className="form-section-header">
              <div>
                <h3>{contractData?.jenisKontrak === 'pencipta' ? '3' : '2'}. Informasi Dokumen & Tanggal</h3>
                <p>Isi informasi penanggalan untuk dokumen kontrak</p>
              </div>
            </div>
            
            <div className="form-row grid-cols-3 gap-4">
              <div className="form-group">
                <label>Nomor Kontrak <span className="text-danger">*</span></label>
                <input type="text" name="nomorKontrak" value={contractData?.nomorKontrak || ''} onChange={handleChange} className="form-control" placeholder="contoh: 001/MYD/2025" />
              </div>
              <div className="form-group">
                <label>Tempat TTD Dokumen <span className="text-danger">*</span></label>
                <input type="text" name="tempatTtd" value={contractData?.tempatTtd || ''} onChange={handleChange} className="form-control" placeholder="contoh: Tasikmalaya" />
              </div>
              <div className="form-group">
                <label>Tanggal TTD Dokumen <span className="text-danger">*</span></label>
                <div className="input-icon-left">
                  <Calendar size={16} />
                  <input type="date" name="tanggalTtd" value={contractData?.tanggalTtd || ''} onChange={handleDateChange} className="form-control" />
                </div>
              </div>
            </div>
 
            <div className="form-row grid-cols-4 mt-4">
              <div className="form-group">
                <label>Hari Terbilang <span className="text-danger">*</span></label>
                <select name="hariTerbilang" value={contractData?.hariTerbilang || ''} onChange={handleChange} className="form-control">
                  <option value="">Pilih Hari...</option>
                  <option value="SENIN">SENIN</option>
                  <option value="SELASA">SELASA</option>
                  <option value="RABU">RABU</option>
                  <option value="KAMIS">KAMIS</option>
                  <option value="JUMAT">JUMAT</option>
                  <option value="SABTU">SABTU</option>
                  <option value="MINGGU">MINGGU</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tanggal Terbilang <span className="text-danger">*</span></label>
                <select name="tanggalTerbilang" value={contractData?.tanggalTerbilang || ''} onChange={handleChange} className="form-control">
                  <option value="">Pilih Tanggal...</option>
                  {Array.from({ length: 31 }, (_, i) => {
                    const val = String(i + 1).padStart(2, '0');
                    return <option key={val} value={val}>{val}</option>;
                  })}
                </select>
              </div>
              <div className="form-group">
                <label>Bulan Terbilang <span className="text-danger">*</span></label>
                <select name="bulanTerbilang" value={contractData?.bulanTerbilang || ''} onChange={handleChange} className="form-control">
                  <option value="">Pilih Bulan...</option>
                  <option value="JANUARI">JANUARI</option>
                  <option value="FEBRUARI">FEBRUARI</option>
                  <option value="MARET">MARET</option>
                  <option value="APRIL">APRIL</option>
                  <option value="MEI">MEI</option>
                  <option value="JUNI">JUNI</option>
                  <option value="JULI">JULI</option>
                  <option value="AGUSTUS">AGUSTUS</option>
                  <option value="SEPTEMBER">SEPTEMBER</option>
                  <option value="OKTOBER">OKTOBER</option>
                  <option value="NOVEMBER">NOVEMBER</option>
                  <option value="DESEMBER">DESEMBER</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tahun Terbilang <span className="text-danger">*</span></label>
                <select name="tahunTerbilang" value={contractData?.tahunTerbilang || ''} onChange={handleChange} className="form-control">
                  <option value="">Pilih Tahun...</option>
                  {Array.from({ length: 3000 - 2010 + 1 }, (_, i) => 2010 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* SECTION FOR DURASI KONTRAK (Only for Artis) */}
          {contractData?.jenisKontrak === 'artis' && (
            <div className="form-section card mb-6 border-2 border-primary/20">
              <div className="form-section-header mb-4">
                <div>
                  <h3 className="text-primary">Detail Durasi Kontrak</h3>
                  <p>Isi informasi mengenai masa berlaku kontrak artis dan kepemilikan master</p>
                </div>
              </div>
              
              <div className="form-row grid-cols-2">
                <div className="form-group">
                  <label>Durasi Kontrak Artis <span className="text-danger">*</span></label>
                  <input type="text" name="durasiKontrakArtis" value={contractData?.durasiKontrakArtis || ''} onChange={handleChange} className="form-control" placeholder="Contoh: 2 (dua) tahun" />
                </div>
                <div className="form-group">
                  <label>Durasi Kepemilikan Master <span className="text-danger">*</span></label>
                  <input type="text" name="durasiLaguMaster" value={contractData?.durasiLaguMaster || ''} onChange={handleChange} className="form-control" placeholder="Contoh: selamanya (Life Time)" />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: Pembagian Pendapatan */}
          <div id="section-4" className="form-section card mb-6 border-2 border-primary/20">
            <div className="form-section-header mb-4">
              <div>
                <h3 className="text-primary">Pembagian Pendapatan Bersih</h3>
                <p>Tentukan persentase bagi hasil antara label dan {contractData?.jenisKontrak === 'pencipta' ? 'pencipta' : 'artis'}</p>
              </div>
            </div>
            
            <div className="form-row grid-cols-2">
              <div className="form-group">
                <label>Persentase MUSIORA (%) <span className="text-danger">*</span></label>
                <select name="persentaseLabel" value={contractData?.persentaseLabel || ''} onChange={(e) => {
                  const val = e.target.value;
                  setContractData(prev => ({ ...prev, persentaseLabel: val, persentasePihakKedua: val ? 100 - parseInt(val) : '' }));
                }} className="form-control">
                  <option value="">Pilih...</option>
                  {Array.from({ length: 20 }, (_, i) => (i + 1) * 5).map(val => (
                    <option key={val} value={val}>{val}%</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Persentase {contractData?.jenisKontrak === 'pencipta' ? 'Pencipta Lagu' : 'Artis'} (%) <span className="text-danger">*</span></label>
                <select name="persentasePihakKedua" value={contractData?.persentasePihakKedua || ''} onChange={(e) => {
                  const val = e.target.value;
                  setContractData(prev => ({ ...prev, persentasePihakKedua: val, persentaseLabel: val ? 100 - parseInt(val) : '' }));
                }} className="form-control">
                  <option value="">Pilih...</option>
                  {Array.from({ length: 20 }, (_, i) => (i + 1) * 5).map(val => (
                    <option key={val} value={val}>{val}%</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Keuangan & Saksi */}
          <div className="form-section card mb-6">
            <div className="form-section-header">
              <div>
                <h3>{contractData?.jenisKontrak === 'pencipta' ? '4' : '3'}. Ketentuan Pembayaran & Saksi</h3>
                <p>Informasi rekening bank {contractData?.jenisKontrak === 'pencipta' ? 'pencipta' : 'artis'} dan saksi</p>
              </div>
            </div>

            <h4 className="font-bold mb-3 text-primary">Informasi Rekening Bank</h4>
            <div className="form-row grid-cols-3">
              <div className="form-group">
                <label>Nama Rekening <span className="text-danger">*</span></label>
                <input type="text" name="rekening_nama" value={contractData?.rekening_nama || ''} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Nomor Rekening <span className="text-danger">*</span></label>
                <input type="text" name="rekening_nomor" value={contractData?.rekening_nomor || ''} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Nama Bank <span className="text-danger">*</span></label>
                <input type="text" name="rekening_bank" value={contractData?.rekening_bank || ''} onChange={handleChange} className="form-control" />
              </div>
            </div>
            
            <div className="form-row grid-cols-2 mt-4">
              <div className="form-group">
                <label>Saksi 1 <span className="text-danger">*</span></label>
                <input type="text" name="saksi1" value={contractData?.saksi1 || ''} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Saksi 2 <span className="text-danger">*</span></label>
                <input type="text" name="saksi2" value={contractData?.saksi2 || ''} onChange={handleChange} className="form-control" />
              </div>
            </div>
          </div>
 
        </div>
 
        {/* RIGHT COLUMN: SIDEBAR SUMMARY */}
        <div className="wizard-sidebar-area">
          <div className="card summary-card">
            <h3 className="summary-title">Ringkasan Draf Kontrak</h3>
            
            <div className="summary-list">
              <div className="summary-item">
                <span className="summary-label">Kategori</span>
                <span 
                  className="summary-value badge" 
                  style={{
                    backgroundColor: contractData?.jenisKontrak === 'pencipta' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(147, 51, 234, 0.15)',
                    color: contractData?.jenisKontrak === 'pencipta' ? '#60a5fa' : '#c084fc'
                  }}
                >
                  {contractData?.jenisKontrak === 'pencipta' ? 'Pencipta Lagu' : 'Kontrak Artis'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pihak Pertama</span>
                <span className="summary-value truncate max-w-[150px]" title={contractData?.pihak1_perusahaan}>{contractData?.pihak1_perusahaan || '-'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pihak Kedua</span>
                <span className="summary-value truncate max-w-[150px]" title={contractData?.pihak2_nama}>{contractData?.pihak2_nama || '-'}</span>
              </div>
              {contractData?.jenisKontrak === 'pencipta' ? (
                <div className="summary-item">
                  <span className="summary-label">Judul Lagu</span>
                  <span className="summary-value truncate max-w-[150px]" title={contractData?.lagu_judul}>{contractData?.lagu_judul || '-'}</span>
                </div>
              ) : (
                <div className="summary-item">
                  <span className="summary-label">Panggung</span>
                  <span className="summary-value truncate max-w-[150px]" title={contractData?.pihak2_panggung}>{contractData?.pihak2_panggung || '-'}</span>
                </div>
              )}
              <div className="summary-item">
                <span className="summary-label">Nomor Kontrak</span>
                <span className="summary-value truncate max-w-[150px]" title={contractData?.nomorKontrak}>{contractData?.nomorKontrak || '-'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Rekening Bank</span>
                <span className="summary-value truncate max-w-[150px]" title={contractData?.rekening_bank}>{contractData?.rekening_bank || '-'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Bagi Hasil</span>
                <span className="summary-value">{contractData?.persentaseLabel || 0}% / {contractData?.persentasePihakKedua || 0}%</span>
              </div>
            </div>
 
            <div className="summary-info-box mt-4">
              <Info size={16} className="text-primary shrink-0" />
              <p>Setelah pengisian selesai, klik Lanjutkan untuk melihat tampilan utuh kontrak yang siap dicetak.</p>
            </div>
          </div>
 
          <div className="card summary-card mt-4">
            <div className="wizard-actions">
              <button className="btn btn-primary w-full justify-center mb-3" onClick={() => onBack('preview-kontrak')}>
                Lanjutkan ke Preview <ArrowRight size={16} />
              </button>
            </div>
          </div>
 
        </div>
      </div>

      {/* Success Modal */}
      {successModal.show && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <div className="success-modal-header">
              <div className="success-modal-icon-container">
                <div className="success-modal-icon">
                  <Check size={24} strokeWidth={4} />
                </div>
              </div>
            </div>
            
            <div className="success-modal-body">
              <h2 className="success-modal-title">Successfully</h2>
              <p className="success-modal-text">
                {successModal.message}
              </p>
            </div>
            
            <button 
              className="success-modal-btn"
              onClick={() => {
                setSuccessModal({ show: false, message: '' });
                onBack('dashboard');
              }}
            >
              Oke
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
