import React, { useState } from 'react';
import { Settings, Save, Palette, Shield, Globe, Printer, Check } from 'lucide-react';

export default function Pengaturan({ db, setDb }) {
  const [activeTab, setActiveTab] = useState('umum');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-container p-6">
      <div className="page-header mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h2>
        <p className="text-gray-500">Konfigurasi preferensi aplikasi KontrakKu.</p>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <button 
            className={`settings-menu-btn ${activeTab === 'umum' ? 'active' : ''}`}
            onClick={() => setActiveTab('umum')}
          >
            <Settings size={18} /> Umum
          </button>
          <button 
            className={`settings-menu-btn ${activeTab === 'tampilan' ? 'active' : ''}`}
            onClick={() => setActiveTab('tampilan')}
          >
            <Palette size={18} /> Tampilan
          </button>
          <button 
            className={`settings-menu-btn ${activeTab === 'cetak' ? 'active' : ''}`}
            onClick={() => setActiveTab('cetak')}
          >
            <Printer size={18} /> Format Cetak
          </button>
          <button 
            className={`settings-menu-btn ${activeTab === 'keamanan' ? 'active' : ''}`}
            onClick={() => setActiveTab('keamanan')}
          >
            <Shield size={18} /> Keamanan
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'umum' && (
            <>
              <h3 className="settings-section-title">Pengaturan Umum</h3>
              
              <div className="settings-form-group">
                <label className="font-bold">Nama Perusahaan Default</label>
                <input type="text" className="form-control" defaultValue="MUSIORA" />
                <p className="settings-hint">Nama ini akan digunakan sebagai pihak pertama secara otomatis pada kontrak baru.</p>
              </div>

              <div className="settings-form-group">
                <label className="font-bold">Zona Waktu</label>
                <div className="input-icon-left">
                  <Globe size={18} />
                  <select className="form-control" defaultValue="wib">
                    <option value="wib">Waktu Indonesia Barat (WIB)</option>
                    <option value="wita">Waktu Indonesia Tengah (WITA)</option>
                    <option value="wit">Waktu Indonesia Timur (WIT)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'tampilan' && (
            <>
              <h3 className="settings-section-title">Pengaturan Tampilan</h3>
              
              <div className="settings-form-group">
                <label className="font-bold">Warna Tema Utama</label>
                <div className="flex gap-4 mt-2">
                  {['#6366f1', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6'].map((color, i) => (
                    <button key={i} className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform cursor-pointer" style={{ backgroundColor: color, borderColor: i === 0 ? 'var(--text-main)' : 'transparent' }} />
                  ))}
                </div>
                <p className="settings-hint">Pilih warna aksen utama untuk aplikasi.</p>
              </div>

              <div className="settings-form-group">
                <label className="font-bold flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                    checked={db.settings?.darkMode || false}
                    onChange={(e) => {
                      setDb(prev => ({
                        ...prev,
                        settings: { ...(prev.settings || {}), darkMode: e.target.checked }
                      }));
                    }}
                  />
                  Aktifkan Mode Gelap (Dark Mode)
                </label>
              </div>
            </>
          )}

          {activeTab === 'cetak' && (
            <>
              <h3 className="settings-section-title">Pengaturan Format Cetak</h3>
              
              <div className="settings-form-group">
                <label className="font-bold">Ukuran Kertas Default</label>
                <select className="form-control" defaultValue="A4">
                  <option value="A4">A4 (210 x 297 mm)</option>
                  <option value="Legal">Legal (216 x 356 mm)</option>
                  <option value="Letter">Letter (215.9 x 279.4 mm)</option>
                </select>
              </div>

              <div className="settings-form-group">
                <label className="font-bold">Margin Kertas (mm)</label>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Atas</label>
                    <input type="number" className="form-control" defaultValue="30" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Bawah</label>
                    <input type="number" className="form-control" defaultValue="20" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Kiri</label>
                    <input type="number" className="form-control" defaultValue="20" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Kanan</label>
                    <input type="number" className="form-control" defaultValue="20" />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'keamanan' && (
            <>
              <h3 className="settings-section-title">Keamanan Akun</h3>
              
              <div className="settings-form-group">
                <label className="font-bold">Ubah Kata Sandi</label>
                <input type="password" className="form-control mb-3" placeholder="Kata Sandi Saat Ini" />
                <input type="password" className="form-control mb-3" placeholder="Kata Sandi Baru" />
                <input type="password" className="form-control" placeholder="Konfirmasi Kata Sandi Baru" />
              </div>

              <div className="settings-form-group mt-6">
                <label className="font-bold flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary focus:ring-primary" />
                  Aktifkan Autentikasi Dua Langkah (2FA)
                </label>
                <p className="settings-hint ml-6">Meningkatkan keamanan akun dengan meminta kode OTP saat login.</p>
              </div>
            </>
          )}

          <div className="settings-actions">
            <button className="btn btn-primary flex items-center gap-2" onClick={handleSave}>
              {saved ? <Check size={18} /> : <Save size={18} />} 
              {saved ? 'Tersimpan!' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
