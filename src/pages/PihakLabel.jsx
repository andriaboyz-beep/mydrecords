import React, { useState } from 'react';
import { Briefcase, Plus, Minus, Search, MoreVertical, Building } from 'lucide-react';

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
        id: `LBL-${String(currentList.length + 1).padStart(3, '0')}`,
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
        <button className={`btn flex items-center gap-2 ${showForm ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-primary'}`} onClick={() => {
          setShowForm(!showForm);
          if(showForm) setFormData({ name: '', alias: '', type: 'Label Rekaman', status: 'Aktif' });
        }}>
          {showForm ? <Minus size={18} /> : <Plus size={18} />} {showForm ? 'Batal' : 'Tambah Mitra Baru'}
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
              className="absolute top-4 right-4 transition-colors" 
              style={{ color: 'var(--text-muted)' }}
              onClick={() => setActiveMenu(activeMenu === label.id ? null : label.id)}
            >
              <MoreVertical size={20} />
            </button>

            {activeMenu === label.id && (
              <div 
                className="absolute top-12 right-4 rounded-lg shadow-lg py-2 z-20 card border-0"
                style={{ minWidth: '150px' }}
              >
                <button 
                  className="w-full text-left px-4 py-2 text-sm transition-colors"
                  style={{ color: 'var(--text-main)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(128,128,128,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => handleEdit(label)}
                >
                  Edit Data
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm transition-colors text-red-500"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => handleDelete(label.id)}
                >
                  Hapus
                </button>
              </div>
            )}

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full p-6 text-center">
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-main)' }}>Konfirmasi Hapus</h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              Apakah Anda yakin ingin menghapus data mitra ini? Data yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                className="btn btn-outline"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                onClick={() => setDeleteConfirmId(null)}
              >
                Batal
              </button>
              <button 
                className="btn text-white px-6 py-2 rounded-lg"
                style={{ backgroundColor: '#ef4444' }}
                onClick={confirmDelete}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
