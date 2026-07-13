import React, { useState } from 'react';
import { UserCog, Plus, Minus, Search, ShieldCheck, X } from 'lucide-react';

const dummyUsers = [
  { id: 'usr-1', name: 'Andi Pratama', email: 'andi@mydrecords.com', role: 'Administrator', status: 'Aktif', avatar: 'https://ui-avatars.com/api/?name=Andi+Pratama&background=6366f1&color=fff' },
  { id: 'usr-2', name: 'Sari Wulandari', email: 'sari@mydrecords.com', role: 'Legal Staff', status: 'Aktif', avatar: 'https://ui-avatars.com/api/?name=Sari+Wulandari&background=ec4899&color=fff' },
];

export default function Pengguna({ db, setDb }) {
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'Legal Staff', status: 'Aktif'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua Peran');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const baseUsers = db?.pengguna ? db.pengguna : dummyUsers;

  const displayedUsers = baseUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'Semua Peran' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setEditingUserId(user.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleForm = () => {
    if (showForm) {
      setShowForm(false);
      setEditingUserId(null);
      setFormData({ name: '', email: '', role: 'Legal Staff', status: 'Aktif' });
    } else {
      setShowForm(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUserId) {
      const updatedUsers = displayedUsers.map(u => 
        u.id === editingUserId ? { ...u, ...formData } : u
      );
      setDb(prev => ({ ...prev, pengguna: updatedUsers }));
    } else {
      const newUser = {
        id: `USR-${Date.now()}`,
        ...formData,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff`
      };
      setDb(prev => ({ ...prev, pengguna: [...displayedUsers, newUser] }));
    }
    setShowForm(false);
    setEditingUserId(null);
    setFormData({ name: '', email: '', role: 'Legal Staff', status: 'Aktif' });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDelete = (id) => {
    setDb(prev => {
      const currentUsers = prev?.pengguna ? prev.pengguna : dummyUsers;
      return { ...prev, pengguna: currentUsers.filter(u => u.id !== id) };
    });
    setConfirmDeleteId(null);
  };

  return (
    <div className="page-container p-6">
      <div className="page-header flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h2>
          <p className="text-gray-500">Kelola akun staf dan hak akses sistem.</p>
        </div>
        <button className={`btn flex items-center gap-2 ${showForm ? 'btn-danger' : 'btn-primary'}`} onClick={toggleForm}>
          {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? 'Batal' : 'Tambah Pengguna'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">
            {editingUserId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="form-group col-span-2 md:col-span-1">
                <label className="font-bold">Nama Lengkap</label>
                <input required name="name" value={formData.name} onChange={handleChange} type="text" className="form-control" />
              </div>
              <div className="form-group col-span-2 md:col-span-1">
                <label className="font-bold">Email</label>
                <input required name="email" value={formData.email} onChange={handleChange} type="email" className="form-control" />
              </div>
              <div className="form-group col-span-2 md:col-span-1">
                <label className="font-bold">Peran (Role)</label>
                <select required name="role" value={formData.role} onChange={handleChange} className="form-control">
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Manager</option>
                  <option value="Legal Staff">Legal Staff</option>
                  <option value="Guest">Guest</option>
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
              <button type="submit" className="btn btn-primary">
                {editingUserId ? 'Simpan Perubahan' : 'Simpan Pengguna'}
              </button>
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
            placeholder="Cari nama atau email pengguna..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="form-control w-48"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="Semua Peran">Semua Peran</option>
          <option value="Administrator">Administrator</option>
          <option value="Manager">Manager</option>
          <option value="Legal Staff">Legal Staff</option>
        </select>
      </div>

      <div className="card overflow-hidden" style={{ padding: 0 }}>
        <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
          <thead style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <tr>
              <th className="px-6 py-4 font-bold text-sm" style={{ color: 'var(--text-muted)' }}>Pengguna</th>
              <th className="px-6 py-4 font-bold text-sm" style={{ color: 'var(--text-muted)' }}>Peran Akses</th>
              <th className="px-6 py-4 font-bold text-sm" style={{ color: 'var(--text-muted)' }}>Status</th>
              <th className="px-6 py-4 font-bold text-sm text-right" style={{ color: 'var(--text-muted)' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=c7d2fe&color=3730a3&size=100`} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=c7d2fe&color=3730a3&size=100`;
                      }}
                    />
                    <div>
                      <div className="font-bold" style={{ color: 'var(--text-main)' }}>{user.name}</div>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className={user.role === 'Administrator' ? 'text-indigo-500' : 'text-gray-400'} />
                    <span className="font-medium" style={{ color: 'var(--text-main)' }}>{user.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${user.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-bold transition-colors"
                    >
                      Edit Akses
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(user.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
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
                Apakah Anda yakin ingin menghapus pengguna ini?
              </p>
            </div>
            
            <div style={{ display: 'flex', width: '100%' }}>
              <button 
                style={{ flex: 1, backgroundColor: '#9ca3af', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}
                className="success-modal-btn"
                onClick={() => setConfirmDeleteId(null)}
              >
                Batal
              </button>
              <button 
                style={{ flex: 1, backgroundColor: '#ef4444', color: 'white' }}
                className="success-modal-btn"
                onClick={() => handleDelete(confirmDeleteId)}
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
