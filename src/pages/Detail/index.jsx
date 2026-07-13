import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  CreditCard, 
  FileText, 
  History,
  CheckCircle2,
  UploadCloud
} from 'lucide-react';

const tabs = [
  { id: 'info', label: 'Informasi Pribadi' },
  { id: 'identitas', label: 'Identitas' },
  { id: 'kontak', label: 'Kontak' },
  { id: 'pembayaran', label: 'Pembayaran' },
  { id: 'dokumen', label: 'Dokumen' },
];

const sideMenu = [
  { id: 'pribadi', label: 'Data Pribadi', icon: User },
  { id: 'kontak', label: 'Kontak', icon: Phone },
  { id: 'pembayaran', label: 'Pembayaran', icon: CreditCard },
  { id: 'dokumen', label: 'Dokumen', icon: FileText, active: true },
  { id: 'riwayat', label: 'Riwayat Kontrak', icon: History },
];

export default function Detail({ type = 'artis', onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  
  const isArtis = type === 'artis';
  
  const profile = {
    name: isArtis ? 'Tiara Andini' : 'Fiersa Besari',
    role: isArtis ? 'Nama Panggung' : 'Nama Pena',
    avatar: isArtis 
      ? 'https://ui-avatars.com/api/?name=Tiara+Andini&background=fce7f3&color=db2777&size=150' 
      : 'https://ui-avatars.com/api/?name=Fiersa+Besari&background=fef3c7&color=d97706&size=150'
  };

  return (
    <div className="detail-container">
      <div className="detail-header">
        <div className="flex items-center gap-4">
          <button className="btn-ghost" onClick={onBack}>
            <ArrowLeft size={20} />
            <span className="text-sm">Kembali</span>
          </button>
          <h2 className="page-title">Detail {isArtis ? 'Artis' : 'Pencipta'}</h2>
        </div>
        <div className="flex gap-3">
          <button 
            className={`btn ${isEditing ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Simpan Data' : 'Edit Data'}
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate && onNavigate('kontrak')}>
            + Kontrak Baru
          </button>
        </div>
      </div>

      <div className="detail-layout">
        <div className="profile-sidebar card">
          <div className="profile-avatar-container">
            <img src={profile.avatar} alt={profile.name} className="profile-avatar-large" />
          </div>
          <h3 className="profile-name-large">{profile.name}</h3>
          <p className="profile-role">{profile.role}</p>
          <p className="profile-name-small">{profile.name}</p>
          
          <div className="profile-nav mt-6">
            {sideMenu.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} className={`profile-nav-item ${item.active ? 'active' : ''}`}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="detail-content card">
          <div className="tabs-container">
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            
            {/* TAB: INFO PRIBADI */}
            {activeTab === 'info' && (
              <div>
                <h4 className="font-semibold mb-4">Informasi Pribadi</h4>
                <div className="form-row grid-cols-2">
                  <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" className="form-control" defaultValue={profile.name} readOnly={!isEditing} />
                  </div>
                  <div className="form-group">
                    <label>{isArtis ? "Nama Panggung" : "Nama Pena (Opsional)"}</label>
                    <input type="text" className="form-control" defaultValue={isArtis ? profile.name : "-"} readOnly={!isEditing} />
                  </div>
                </div>
                <div className="form-row grid-cols-2">
                  <div className="form-group">
                    <label>Tempat Lahir</label>
                    <input type="text" className="form-control" defaultValue="Jakarta" readOnly={!isEditing} />
                  </div>
                  <div className="form-group">
                    <label>Tanggal Lahir</label>
                    <input type="date" className="form-control" defaultValue="2000-01-01" readOnly={!isEditing} />
                  </div>
                </div>
                <div className="form-row grid-cols-2">
                  <div className="form-group">
                    <label>Jenis Kelamin</label>
                    <select className="form-control" disabled={!isEditing}>
                      <option>Laki-laki</option>
                      <option selected>Perempuan</option>
                    </select>
                  </div>
                  {isArtis && (
                    <div className="form-group">
                      <label>Kewarganegaraan</label>
                      <input type="text" className="form-control" defaultValue="WNI" readOnly={!isEditing} />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-6">
                  <button className="btn btn-primary">Simpan Perubahan</button>
                </div>
              </div>
            )}

            {/* TAB: IDENTITAS */}
            {activeTab === 'identitas' && (
              <div>
                <h4 className="font-semibold mb-4">Identitas Resmi</h4>
                <div className="form-row grid-cols-2">
                  <div className="form-group">
                    <label>NIK</label>
                    <input type="text" className="form-control" defaultValue="3171234567890001" readOnly={!isEditing} />
                  </div>
                  <div className="form-group">
                    <label>NPWP</label>
                    <input type="text" className="form-control" defaultValue="12.345.678.9-012.000" readOnly={!isEditing} />
                  </div>
                </div>
                <div className="form-row grid-cols-2">
                  <div className="form-group">
                    <label>Nomor Paspor (Opsional)</label>
                    <input type="text" className="form-control" placeholder="Masukkan Nomor Paspor" readOnly={!isEditing} />
                  </div>
                </div>
                
                <h5 className="font-semibold mt-6 mb-3 text-sm">Dokumen Identitas</h5>
                <div className="document-grid">
                  <div className="doc-card">
                    <div className="doc-header">
                      <h5 className="doc-title">Foto KTP</h5>
                      <span className="doc-status"><CheckCircle2 size={12} /> Terverifikasi</span>
                    </div>
                    <div className="doc-preview bg-gray-100">
                      <div className="dummy-ktp"></div>
                    </div>
                    <div className="doc-actions">
                      <button className="btn-outline flex-1">Lihat</button>
                      <button className="btn-outline flex-1">Ganti</button>
                    </div>
                  </div>
                  
                  {isArtis && (
                    <div className="doc-card upload-zone">
                      <h5 className="doc-title mb-4">Foto Selfie dengan KTP (Opsional)</h5>
                      <div className="upload-box flex-col items-center justify-center">
                        <UploadCloud size={32} className="text-primary mb-2" />
                        <p className="text-primary text-sm font-medium mb-1">Klik atau drag file</p>
                        <p className="text-xs text-muted">Format: JPG, PNG Maks. 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-6">
                  <button className="btn btn-primary">Simpan Perubahan</button>
                </div>
              </div>
            )}

            {/* TAB: KONTAK */}
            {activeTab === 'kontak' && (
              <div>
                <h4 className="font-semibold mb-4">Informasi Kontak</h4>
                <div className="form-row grid-cols-3">
                  <div className="form-group">
                    <label>Nomor HP</label>
                    <input type="text" className="form-control" defaultValue="081234567890" readOnly={!isEditing} />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp</label>
                    <input type="text" className="form-control" defaultValue="081234567890" readOnly={!isEditing} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-control" defaultValue="contact@artist.com" readOnly={!isEditing} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Alamat Lengkap</label>
                  <textarea className="form-control" rows="3" defaultValue="Jl. Musik Indah No. 123, Kebayoran Baru" readOnly={!isEditing}></textarea>
                </div>
                {isArtis && (
                  <div className="form-row grid-cols-3">
                    <div className="form-group">
                      <label>Kota</label>
                      <input type="text" className="form-control" defaultValue="Jakarta Selatan" readOnly={!isEditing} />
                    </div>
                    <div className="form-group">
                      <label>Provinsi</label>
                      <input type="text" className="form-control" defaultValue="DKI Jakarta" readOnly={!isEditing} />
                    </div>
                    <div className="form-group">
                      <label>Kode Pos</label>
                      <input type="text" className="form-control" defaultValue="12110" readOnly={!isEditing} />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-6">
                  <button className="btn btn-primary">Simpan Perubahan</button>
                </div>
              </div>
            )}

            {/* TAB: PEMBAYARAN */}
            {activeTab === 'pembayaran' && (
              <div>
                <h4 className="font-semibold mb-4">Informasi Pembayaran</h4>
                <div className="form-row grid-cols-2">
                  <div className="form-group">
                    <label>Nama Bank</label>
                    <select className="form-control" disabled={!isEditing}>
                      <option>BCA</option>
                      <option>Mandiri</option>
                      <option>BNI</option>
                      <option>BRI</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nomor Rekening</label>
                    <input type="text" className="form-control" defaultValue="1234567890" readOnly={!isEditing} />
                  </div>
                </div>
                <div className="form-row grid-cols-2">
                  <div className="form-group">
                    <label>Nama Pemilik Rekening</label>
                    <input type="text" className="form-control" defaultValue={profile.name} readOnly={!isEditing} />
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button className="btn btn-primary">Simpan Perubahan</button>
                </div>
              </div>
            )}

            {/* TAB: DOKUMEN PENDUKUNG */}
            {activeTab === 'dokumen' && (
              <div>
                <h4 className="font-semibold mb-4">Dokumen Pendukung</h4>
                
                {isArtis ? (
                  <div className="document-grid">
                    {/* Pas Foto */}
                    <div className="doc-card">
                      <div className="doc-header">
                        <h5 className="doc-title">Pas Foto</h5>
                        <span className="doc-status"><CheckCircle2 size={12} /> Terverifikasi</span>
                      </div>
                      <div className="doc-preview bg-gray-100 flex items-center justify-center">
                        <img src={profile.avatar} alt="Pas Foto" className="doc-img-preview" />
                      </div>
                      <div className="doc-info">
                        <p className="doc-filename">PAS_FOTO_TIARA.jpg</p>
                        <p className="doc-date">Diunggah: 10 Mei 2024</p>
                      </div>
                      <div className="doc-actions">
                        <button className="btn-outline flex-1">Lihat</button>
                        <button className="btn-outline flex-1">Ganti</button>
                      </div>
                    </div>

                    {/* Foto KTP */}
                    <div className="doc-card">
                      <div className="doc-header">
                        <h5 className="doc-title">Foto KTP</h5>
                        <span className="doc-status"><CheckCircle2 size={12} /> Terverifikasi</span>
                      </div>
                      <div className="doc-preview bg-gray-100">
                        <div className="dummy-ktp"></div>
                      </div>
                      <div className="doc-info">
                        <p className="doc-filename">KTP_ARTIS_0001.jpg</p>
                        <p className="doc-date">Diunggah: 10 Mei 2024</p>
                      </div>
                      <div className="doc-actions">
                        <button className="btn-outline flex-1">Lihat</button>
                        <button className="btn-outline flex-1">Ganti</button>
                      </div>
                    </div>

                    {/* NPWP */}
                    <div className="doc-card">
                      <div className="doc-header">
                        <h5 className="doc-title">Scan NPWP</h5>
                        <span className="doc-status"><CheckCircle2 size={12} /> Terverifikasi</span>
                      </div>
                      <div className="doc-preview bg-gray-100">
                        <div className="dummy-npwp"></div>
                      </div>
                      <div className="doc-info">
                        <p className="doc-filename">NPWP_TIARA.jpg</p>
                        <p className="doc-date">Diunggah: 10 Mei 2024</p>
                      </div>
                      <div className="doc-actions">
                        <button className="btn-outline flex-1">Lihat</button>
                        <button className="btn-outline flex-1">Ganti</button>
                      </div>
                    </div>

                    {/* Tanda Tangan */}
                    <div className="doc-card">
                      <div className="doc-header">
                        <h5 className="doc-title">Tanda Tangan Digital</h5>
                        <span className="doc-status"><CheckCircle2 size={12} /> Terverifikasi</span>
                      </div>
                      <div className="doc-preview bg-gray-50 flex items-center justify-center">
                        <div className="dummy-signature">Tiara</div>
                      </div>
                      <div className="doc-info">
                        <p className="doc-filename">TTD_TIARA.png</p>
                        <p className="doc-date">Diunggah: 10 Mei 2024</p>
                      </div>
                      <div className="doc-actions">
                        <button className="btn-outline flex-1">Lihat</button>
                        <button className="btn-outline flex-1">Ganti</button>
                      </div>
                    </div>

                    {/* Dokumen Lainnya */}
                    <div className="doc-card">
                      <div className="doc-header">
                        <h5 className="doc-title">Dokumen Lainnya</h5>
                        <span className="text-xs text-muted">1 File</span>
                      </div>
                      <div className="doc-preview bg-gray-50 flex items-center justify-center">
                        <FileText size={48} className="text-gray-300" />
                      </div>
                      <div className="doc-info">
                        <p className="doc-filename">SURAT_PERNYATAAN.pdf</p>
                        <p className="doc-date">Diunggah: 10 Mei 2024</p>
                      </div>
                      <div className="doc-actions">
                        <button className="btn-outline flex-1">Lihat</button>
                        <button className="btn-outline flex-1">Ganti</button>
                      </div>
                    </div>

                    {/* Upload Zone */}
                    <div className="doc-card upload-zone">
                      <h5 className="doc-title mb-4">Upload Dokumen Lain</h5>
                      <div className="upload-box flex-col items-center justify-center">
                        <UploadCloud size={32} className="text-primary mb-2" />
                        <p className="text-primary text-sm font-medium mb-1">Klik atau drag file ke sini</p>
                        <p className="text-xs text-muted">Format: JPG, PNG, PDF</p>
                        <p className="text-xs text-muted">Maks. 5 MB</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-sm font-semibold text-gray-600">Jenis Dokumen</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                          <th className="py-3 px-4 text-sm font-semibold text-gray-600">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium">Foto KTP</td>
                          <td className="py-3 px-4 text-sm"><span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={14} /> Ada</span></td>
                          <td className="py-3 px-4 text-sm"><button className="text-primary hover:underline font-medium">Lihat / Ganti</button></td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium">NPWP</td>
                          <td className="py-3 px-4 text-sm"><span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={14} /> Ada</span></td>
                          <td className="py-3 px-4 text-sm"><button className="text-primary hover:underline font-medium">Lihat / Ganti</button></td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium">Pas Foto</td>
                          <td className="py-3 px-4 text-sm"><span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={14} /> Ada</span></td>
                          <td className="py-3 px-4 text-sm"><button className="text-primary hover:underline font-medium">Lihat / Ganti</button></td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium">Tanda Tangan</td>
                          <td className="py-3 px-4 text-sm"><span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={14} /> Ada</span></td>
                          <td className="py-3 px-4 text-sm"><button className="text-primary hover:underline font-medium">Lihat / Ganti</button></td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium">Dokumen Lain</td>
                          <td className="py-3 px-4 text-sm"><span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={14} /> Ada</span></td>
                          <td className="py-3 px-4 text-sm"><button className="text-primary hover:underline font-medium">Upload / Download</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
