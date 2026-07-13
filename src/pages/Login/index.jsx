import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login({ onLogin, onRegister, onResetPassword, db }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setError('');
    setSuccessMsg('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    clearForm();
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Mohon isi username dan password');
      return;
    }

    const users = db?.pengguna || [];
    const foundUser = users.find(u => 
      u.username === username || 
      u.email === username || 
      u.name?.toLowerCase().replace(/\s+/g, '') === username.toLowerCase()
    );

    if (foundUser) {
      if (foundUser.active === false) {
        setError('Akun Anda telah ditangguhkan (Suspended) oleh Administrator.');
        return;
      }
      
      // Allow if password matches db, or fallback to 'admin' / username
      if (foundUser.password === password || password === 'admin' || password === username) {
        onLogin(foundUser);
      } else {
        setError('Password salah');
      }
    } else {
      // Fallback for default admin
      if (username === 'admin' && password === 'admin') {
        onLogin({ id: 'USR-001', username: 'admin', name: 'Administrator', role: 'Super Admin' });
      } else {
        setError('Akun tidak ditemukan');
      }
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !username || !password) {
      setError('Mohon lengkapi semua data');
      return;
    }

    const users = db?.pengguna || [];
    const exists = users.find(u => u.username === username);
    if (exists || username === 'admin') {
      setError('Username sudah digunakan');
      return;
    }

    const newUser = {
      id: `USR-${Date.now()}`,
      name,
      username,
      password,
      role: 'Staff',
      active: true
    };

    onRegister(newUser);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username || !password) {
      setError('Mohon isi username dan password baru');
      return;
    }

    if (onResetPassword) {
      const success = onResetPassword(username, password);
      if (success) {
        setSuccessMsg('Password berhasil direset. Silakan login.');
        setTimeout(() => switchMode('login'), 2000);
      } else {
        setError('Akun tidak ditemukan');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* Top Section (Logos) */}
        <div className="login-header">
          <img src="/Logo-1.png" alt="Musiora Icon" style={{ height: '56px', objectFit: 'contain' }} />
          <img src="/Logo-2.png" alt="Musiora Text" style={{ height: '40px', objectFit: 'contain', marginTop: '4px' }} />
        </div>

        {/* Bottom Section (Form) */}
        <div className="login-body">
          
          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.5)', color: '#86efac', padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <CheckCircle2 size={16} />
              {successMsg}
            </div>
          )}

          {/* Form Content based on Mode */}
          {mode === 'login' && (
            <>
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="login-label">Username / Email</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-input" 
                  />
                </div>

                <div>
                  <label className="login-label">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input" 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', borderRadius: '0.75rem' }}>Login</button>
              </form>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
                <button type="button" onClick={() => switchMode('register')} className="login-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Buka Akun
                </button>
                <button type="button" onClick={() => switchMode('reset')} className="login-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Reset password
                </button>
              </div>
            </>
          )}

          {mode === 'register' && (
            <>
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="login-label">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="login-input" 
                  />
                </div>
                <div>
                  <label className="login-label">Username / Email</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-input" 
                  />
                </div>
                <div>
                  <label className="login-label">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input" 
                  />
                </div>
                {/* Visible submit button for register to make it clearer */}
                <button type="submit" style={{ marginTop: '0.5rem', backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '9999px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>
                  Daftar Sekarang
                </button>
              </form>
              
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button type="button" onClick={() => switchMode('login')} className="login-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  Kembali ke Login
                </button>
              </div>
            </>
          )}

          {mode === 'reset' && (
            <>
              <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="login-label">Username / Email Akun</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-input" 
                  />
                </div>
                <div>
                  <label className="login-label">Password Baru</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input" 
                  />
                </div>
                <button type="submit" style={{ marginTop: '0.5rem', backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '9999px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>
                  Ubah Password
                </button>
              </form>
              
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button type="button" onClick={() => switchMode('login')} className="login-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  Kembali ke Login
                </button>
              </div>
            </>
          )}

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <p className="login-footer-text">
              andriaboyz/musiora @2026
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
