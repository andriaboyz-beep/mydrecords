import React, { useState } from 'react';
import { ShieldCheck, Activity, Users, UserX, UserCheck, RefreshCw, AlertTriangle } from 'lucide-react';

export default function SuperAdminDashboard({ db, setDb }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const users = db?.pengguna || [];
  const activities = db?.aktivitas || [];

  const activeUsers = users.filter(u => u.active !== false).length;
  const suspendedUsers = users.filter(u => u.active === false).length;
  const todayActivities = activities.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length;

  const handleToggleStatus = (userId, currentStatus) => {
    if (window.confirm(`Apakah Anda yakin ingin ${currentStatus === false ? 'mengaktifkan' : 'menangguhkan (suspend)'} pengguna ini?`)) {
      setDb(prev => ({
        ...prev,
        pengguna: prev.pengguna.map(u => u.id === userId ? { ...u, active: currentStatus === false ? true : false } : u),
        aktivitas: [
          {
            id: `LOG-${Date.now()}`,
            userId: 'System',
            userName: 'Super Admin',
            role: 'System',
            action: currentStatus === false ? 'Aktivasi Akun' : 'Suspend Akun',
            details: `Mengubah status akun ID: ${userId} menjadi ${currentStatus === false ? 'Aktif' : 'Suspended'}`,
            timestamp: new Date().toISOString()
          },
          ...(prev.aktivitas || [])
        ].slice(0, 500)
      }));
    }
  };

  const handleForceReset = (userId) => {
    const newPassword = prompt("Masukkan password baru untuk pengguna ini:", "musiora123");
    if (newPassword) {
      setDb(prev => ({
        ...prev,
        pengguna: prev.pengguna.map(u => u.id === userId ? { ...u, password: newPassword } : u),
        aktivitas: [
          {
            id: `LOG-${Date.now()}`,
            userId: 'System',
            userName: 'Super Admin',
            role: 'System',
            action: 'Force Reset Password',
            details: `Mereset password akun ID: ${userId}`,
            timestamp: new Date().toISOString()
          },
          ...(prev.aktivitas || [])
        ].slice(0, 500)
      }));
      alert('Password berhasil diubah!');
    }
  };

  const filteredLogs = activities.filter(log => 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container p-6" style={{ minHeight: '100vh' }}>
      <div className="page-header flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <ShieldCheck className="text-indigo-600" size={28} />
            Dasbor Super Admin
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Pantau aktivitas sistem dan kelola kontrol tingkat lanjut.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card flex items-center gap-4 p-6">
          <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
            <Users className="text-indigo-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Pengguna Aktif</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{activeUsers}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-6">
          <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Akun Suspended</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{suspendedUsers}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-6">
          <div style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
            <Activity className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Aktivitas Hari Ini</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{todayActivities}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Control Table */}
        <div className="card overflow-hidden flex flex-col" style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Kontrol Cepat Pengguna</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Pengguna</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Role</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Aksi Kontrol</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <p style={{ fontWeight: '600', color: u.active === false ? 'var(--text-muted)' : 'var(--text-main)' }}>{u.name || u.username}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.username}</p>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{u.role}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {u.role !== 'Super Admin' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleToggleStatus(u.id, u.active)}
                            style={{ padding: '0.375rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', border: 'none', backgroundColor: u.active === false ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)', color: u.active === false ? '#166534' : '#991b1b' }}
                          >
                            {u.active === false ? <><UserCheck size={14}/> Aktifkan</> : <><UserX size={14}/> Suspend</>}
                          </button>
                          <button 
                            onClick={() => handleForceReset(u.id)}
                            style={{ padding: '0.375rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', border: 'none', backgroundColor: 'rgba(107, 114, 128, 0.1)', color: 'var(--text-main)' }}
                          >
                            <RefreshCw size={14} /> Reset
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Log Table */}
        <div className="card overflow-hidden flex flex-col h-[600px]" style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Log Aktivitas Sistem</h3>
            <input 
              type="text" 
              placeholder="Cari aktivitas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ width: '50%', padding: '0.5rem 1rem', borderRadius: '9999px' }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
            {filteredLogs.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Belum ada aktivitas yang terekam.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredLogs.map(log => (
                  <div key={log.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', flexShrink: 0, fontWeight: 'bold', fontSize: '0.875rem' }}>
                      {log.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{log.userName}</span> <span style={{ color: 'var(--text-muted)' }}>({log.role})</span> melakukan <span style={{ fontWeight: '600', color: '#4f46e5' }}>{log.action}</span>
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{log.details}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
