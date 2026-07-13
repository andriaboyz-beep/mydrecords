import React, { useState } from 'react';
import { Briefcase, Plus, Minus, Search, MoreVertical, Building, X, Trash2 } from 'lucide-react';

export default function PihakLabel({ db, setDb, user, activeWorkspace }) {
  const [showForm, setShowForm] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Semua Tipe');
  const [formData, setFormData] = useState({
    name: '', alias: '', type: 'Label Rekaman', status: 'Aktif'
  });

  const dummyLabels = [
    { id: 'LBL-001', name: 'MUSIORA', alias: 'MUSIORA', type: 'Label Rekaman', status: 'Aktif' },
    { id: 'LBL-002', name: 'PT. Nada Nusantara', alias: 'Nusantara Music', type: 'Publisher', status: 'Aktif' },
    { id: 'LBL-003', name: 'PT. Suara Merdu', alias: 'Suara Merdu', type: 'Event Organizer', status: 'Non-Aktif' },
  ];

  // Tampilkan data db jika ada (termasuk array kosong), jika undefined baru pakai dummy
  const rawLabels = db?.label !== undefined ? db.label : dummyLabels;
  
  // Saring berdasarkan pencarian dan tipe
  const displayedLabels = rawLabels.filter(label => {
    const matchSearch = label.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (label.alias && label.alias.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchType = filterType === 'Semua Tipe' || label.type === filterType;
    return matchSearch && matchType;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentList = db?.label !== undefined ? db.label : dummyLabels;
    
    if (formData.id) {
      // Mode Edit
      const newLabels = currentList.map(l => l.id === formData.id ? formData : l);
      setDb(prev => ({ ...prev, label: newLabels }));
    } else {
      // Mode Tambah Baru
      const newLabel = {
        id: `LBL-${Date.now()}`,
        createdBy: user?.id,
        labelId: activeWorkspace, // Link this partner to the active workspace
        ...formData
      };
      setDb(prev => ({ ...prev, label: [...currentList, newLabel] }));
    }
    
    setShowForm(false);
    setFormData({ name: '', alias: '', type: 'Label Rekaman', status: 'Aktif' });
  };

  const handleEdit = (label) => {
    setFormData(label);
    setShowForm(true);
    setActiveMenu(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
    setActiveMenu(null);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    const currentList = (db?.label && db.label.length > 0) ? db.label : (db?.label ? [] : dummyLabels);
    const newLabels = currentList.filter(l => l.id !== deleteConfirmId);
    
    setDb(prev => ({ ...prev, label: newLabels.length === 0 ? [] : newLabels }));
    setDeleteConfirmId(null);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="page-container p-6">
      <div className="page-header flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Pihak / Label</h2>
          <p style={{ color: 'var(--text-muted)' }}>Kelola entitas perusahaan dan mitra kerja sama.</p>
        </div>
        <button className={`btn flex items-center gap-2 ${showForm ? 'btn-danger' : 'btn-primary'}`} onClick={() => {
          setShowForm(!showForm);
          if(showForm) setFormData({ name: '', alias: '', type: 'Label Rekaman', status: 'Aktif' });
        }}>
          {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? 'Batal' : 'Tambah Mitra Baru'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">{formData.id ? 'Edit Mitra / Perusahaan' : 'Tambah Mitra / Perusahaan Baru'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="form-group col-span-2 md:col-span-1">
                <label className="font-bold">Nama Perusahaan Lengkap</label>
                <input required name="name" value={formData.name} onChange={handleChange} type="text" className="form-control" />
              </div>
              <div className="form-group col-span-2 md:col-span-1">
                <label className="font-bold">Nama Alias / Merek</label>
                <input required name="alias" value={formData.alias} onChange={handleChange} type="text" className="form-control" />
              </div>
              <div className="form-group col-span-2 md:col-span-1">
                <label className="font-bold">Tipe Mitra</label>
                <select required name="type" value={formData.type} onChange={handleChange} className="form-control">
                  <option value="Label Rekaman">Label Rekaman</option>
                  <option value="Publisher">Publisher</option>
                  <option value="Event Organizer">Event Organizer</option>
                  <option value="Manajemen Artis">Manajemen Artis</option>
                </select>
              </div>
              <div className="form-group col-span-2 md:col-span-1">
                <label className="font-bold">Status</label>
                <select required name="status" value={formData.status} onChange={handleChange} className="form-control">
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">Simpan Mitra</button>
            </div>
          </form>
        </div>
      )}

      <div className="card mb-6 p-4 flex gap-4">
        <div className="input-icon-left flex-1">
          <Search size={18} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Cari nama perusahaan atau alias..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="form-control w-48"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option>Semua Tipe</option>
          <option>Label Rekaman</option>
          <option>Publisher</option>
          <option>Event Organizer</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedLabels.map(label => (
          <div key={label.id} className="card p-5 relative group">
            <button 
              onClick={() => setDeleteConfirmId(label.id)}
              style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#fee2e2', color: '#ef4444', padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              title="Hapus"
            >
              <Trash2 size={18} />
            </button>

            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <Building size={24} />
            </div>
            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-main)' }}>{label.name}</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{label.alias}</p>
            
            <div className="flex items-center justify-between mt-auto">
              <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)' }}>{label.type}</span>
              <span className="text-sm font-bold" style={{ color: label.status === 'Aktif' ? '#34d399' : 'var(--text-muted)' }}>
                {label.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirmId && (
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
                Apakah Anda yakin ingin menghapus data mitra ini?
              </p>
            </div>
            
            <div style={{ display: 'flex', width: '100%' }}>
              <button 
                style={{ flex: 1, backgroundColor: '#9ca3af', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}
                className="success-modal-btn"
                onClick={() => setDeleteConfirmId(null)}
              >
                Batal
              </button>
              <button 
                style={{ flex: 1, backgroundColor: '#ef4444', color: 'white' }}
                className="success-modal-btn"
                onClick={confirmDelete}
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
