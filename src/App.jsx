import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ArtisList from './pages/ArtisList';
import PenciptaList from './pages/PenciptaList';
import KontrakBaru from './pages/KontrakBaru';
import Lagu from './pages/Lagu';
import PreviewKontrak from './pages/PreviewKontrak';
import PihakLabel from './pages/PihakLabel';
import TemplateKontrak from './pages/TemplateKontrak';
import Laporan from './pages/Laporan';
import Pengingat from './pages/Pengingat';
import Pengaturan from './pages/Pengaturan';
import Pengguna from './pages/Pengguna';
import DraftList from './pages/DraftList';
import ContractList from './pages/ContractList';
import Login from './pages/Login';

import SuperAdminDashboard from './pages/SuperAdminDashboard';

const initialDB = {
  artis: [
    { id: 'ART-001', name: 'Tiara Andini', alias: 'Tiara', ktp: '3171234567890001', alamat: 'Jl. Musik Indah No. 1, Jakarta', bank: 'BCA', norek: '1234567890', atasNama: 'Tiara Andini' }
  ],
  pencipta: [],
  kontrak: [],
  lagu: [],
  label: [
    { id: 'LBL-001', name: 'MUSIORA', address: 'Jl. SL Tobing No.38 - Tasikmalaya', director: 'Yadi Supriyadi' }
  ],
  pengguna: [
    { id: 'USR-001', username: 'admin', password: 'admin', name: 'Administrator', role: 'Super Admin', active: true }
  ],
  aktivitas: [],
  settings: {
    darkMode: false,
    themeColor: '#7c3aed'
  }
};

const initialContractData = {
  jenisKontrak: 'artis',
  nomorKontrak: '',
  tanggalTerbilang: '',
  hariTerbilang: '',
  bulanTerbilang: '',
  tahunTerbilang: '',
  tanggalTtd: '',
  tanggalCetak: '',
  tempatTtd: '',
  pihak1_perusahaan: '',
  pihak1_alias: '',
  pihak1_alamat: '',
  pihak1_wakil: '',
  pihak1_jabatan: '',
  pihak2_nama: '',
  pihak2_ktp: '',
  pihak2_alamat: '',
  pihak2_hp: '',
  pihak2_email: '',
  pihak2_panggung: '',
  pihak2_alias: '',
  lagu_judul: '',
  lagu_genre: '',
  lagu_durasi: '',
  lagu_tanggalPenyerahan: '',
  persentaseLabel: '',
  persentasePihakKedua: '',
  rekening_nama: '',
  rekening_nomor: '',
  rekening_bank: '',
  saksi1: '',
  saksi2: ''
};

const urlToMenuMap = {
  '/Dashboard/': 'dashboard',
  '/Dashboard': 'dashboard',
  '/KontrakBaru/': 'kontrak',
  '/KontrakBaru': 'kontrak',
  '/Draft/': 'draft',
  '/Draft': 'draft',
  '/DaftarKontrak/': 'list_kontrak_semua',
  '/DaftarKontrak': 'list_kontrak_semua',
  '/Artis/': 'artis',
  '/Artis': 'artis',
  '/Pencipta/': 'pencipta',
  '/Pencipta': 'pencipta',
  '/Lagu/': 'lagu',
  '/Lagu': 'lagu',
  '/Label/': 'pihak-label',
  '/Label': 'pihak-label',
  '/Template/': 'template',
  '/Template': 'template',
  '/Laporan/': 'laporan',
  '/Laporan': 'laporan',
  '/Pengingat/': 'pengingat',
  '/Pengingat': 'pengingat',
  '/Pengaturan/': 'pengaturan',
  '/Pengaturan': 'pengaturan',
  '/Pengguna/': 'pengguna',
  '/Pengguna': 'pengguna',
  '/PreviewKontrak/': 'preview-kontrak',
  '/PreviewKontrak': 'preview-kontrak'
};

const menuToUrlMap = {
  'dashboard': '/Dashboard/',
  'kontrak': '/KontrakBaru/',
  'draft': '/Draft/',
  'list_kontrak_semua': '/DaftarKontrak/',
  'list_kontrak_aktif': '/DaftarKontrak/',
  'list_kontrak_berakhir': '/DaftarKontrak/',
  'artis': '/Artis/',
  'pencipta': '/Pencipta/',
  'lagu': '/Lagu/',
  'pihak-label': '/Label/',
  'template': '/Template/',
  'laporan': '/Laporan/',
  'pengingat': '/Pengingat/',
  'pengaturan': '/Pengaturan/',
  'pengguna': '/Pengguna/',
  'superadmin': '/Dashboard/',
  'preview-kontrak': '/PreviewKontrak/'
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('kontrakku_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeMenu, setActiveMenu] = useState(() => {
    return urlToMenuMap[window.location.pathname] || 'dashboard';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  
  // Local Database State
  const [db, _setDb] = useState(initialDB);
  const [isLoading, setIsLoading] = useState(true);

  // Advanced setDb wrapper that diffs state changes and syncs to backend API
  const setDb = (action) => {
    _setDb(prev => {
      const nextState = typeof action === 'function' ? action(prev) : action;
      
      // Perform Diffing for API Sync
      import('./api').then(({ createItem, updateItem, deleteItem }) => {
        const collections = ['label', 'pengguna', 'artis', 'pencipta', 'lagu', 'kontrak', 'aktivitas'];
        
        collections.forEach(key => {
          const oldArr = prev[key] || [];
          const newArr = nextState[key] || [];
          
          // Added items
          const added = newArr.filter(n => !oldArr.find(o => o.id === n.id));
          added.forEach(item => createItem(key, item));
          
          // Deleted items
          const deleted = oldArr.filter(o => !newArr.find(n => n.id === o.id));
          deleted.forEach(item => deleteItem(key, item.id));
          
          // Updated items
          const updated = newArr.filter(n => {
            const oldItem = oldArr.find(o => o.id === n.id);
            if (!oldItem) return false;
            return JSON.stringify(oldItem) !== JSON.stringify(n);
          });
          updated.forEach(item => updateItem(key, item.id, item));
        });
      });
      
      return nextState;
    });
  };

  useEffect(() => {
    import('./api').then(({ fetchAllData }) => {
      fetchAllData().then(data => {
        if (data) {
          // Use original _setDb to prevent triggering API POST for fetched items!
          _setDb(prev => ({ ...prev, ...data }));
        }
        setIsLoading(false);
      });
    });

    const handlePopState = () => {
      const path = window.location.pathname;
      setActiveMenu(urlToMenuMap[path] || 'dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Active Workspace State
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    const savedWs = localStorage.getItem('kontrakku_workspace');
    if (savedWs && db.label?.find(l => l.id === savedWs)) {
      return savedWs;
    }
    return db.label?.[0]?.id || 'LBL-001';
  });

  useEffect(() => {
    localStorage.setItem('kontrakku_workspace', activeWorkspace);
  }, [activeWorkspace]);

  // Helper for logging activity
  const logActivity = (user, action, details) => {
    if (!user) return;
    const logEntry = {
      id: `LOG-${Date.now()}`,
      userId: user.id || user.username,
      userName: user.name || user.username,
      role: user.role,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setDb(prev => ({
      ...prev,
      aktivitas: [logEntry, ...(prev.aktivitas || [])].slice(0, 500) // Keep last 500 logs
    }));
  };

  // Save to localStorage whenever db changes
  useEffect(() => {
    localStorage.setItem('kontrakku_db', JSON.stringify(db));
    
    // Apply dark mode
    if (db.settings?.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [db]);

  const [contractData, setContractData] = useState(initialContractData);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('kontrakku_user', JSON.stringify(user));
    logActivity(user, 'Login', 'Berhasil masuk ke sistem');
    setActiveMenu('dashboard');
  };

  const handleLogout = () => {
    if (currentUser) {
      logActivity(currentUser, 'Logout', 'Keluar dari sistem');
    }
    setCurrentUser(null);
    localStorage.removeItem('kontrakku_user');
    setActiveMenu('dashboard');
  };

  // Auto Logout after 3 minutes (180000 ms) of inactivity
  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (currentUser) {
        timeoutId = setTimeout(() => {
          handleLogout();
          alert('Sesi Anda telah berakhir karena tidak ada aktivitas selama 3 menit. Silakan login kembali.');
        }, 180000);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    if (currentUser) {
      events.forEach(e => document.addEventListener(e, resetTimer));
      resetTimer();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [currentUser]);

  const handleNavigate = (menu) => {
    if (menu === 'kontrak') {
      // Clear data if we're explicitly navigating to a new contract (not via edit draft)
      setContractData(initialContractData);
    }
    setActiveMenu(menu);

    const newUrl = menuToUrlMap[menu] || `/${menu}/`;
    if (window.location.pathname !== newUrl) {
      window.history.pushState(null, '', newUrl);
    }

    logActivity(currentUser, 'Navigasi', `Membuka halaman ${menu}`);
  };

  const handleEditDraft = (draft) => {
    setContractData(draft);
    setActiveMenu('kontrak');
    logActivity(currentUser, 'Edit Draft', `Membuka draft kontrak ${draft.nomorKontrak}`);
  };

  const handleRegister = (newUser) => {
    setDb(prev => ({
      ...prev,
      pengguna: [...(prev.pengguna || []), newUser]
    }));
    logActivity(newUser, 'Daftar', `Pendaftaran akun baru: ${newUser.username}`);
    // Auto login after register
    handleLogin(newUser);
  };

  const handleResetPassword = (username, newPassword) => {
    let success = false;
    setDb(prev => {
      const users = prev.pengguna || [];
      const updatedUsers = users.map(u => {
        if (u.username === username || u.email === username) {
          success = true;
          return { ...u, password: newPassword };
        }
        return u;
      });
      return { ...prev, pengguna: updatedUsers };
    });
    return success;
  };

  // Multi-Tenant Isolation: Create a scoped database for the active workspace
  const scopedDb = React.useMemo(() => {
    // If there is no active workspace or the user is not authenticated, fall back to db
    if (!currentUser) return db;

    // Filter items based on the active workspace (labelId)
    const isWorkspaceItem = (item) => item.labelId === activeWorkspace;

    return {
      ...db,
      artis: db.artis?.filter(isWorkspaceItem) || [],
      pencipta: db.pencipta?.filter(isWorkspaceItem) || [],
      kontrak: db.kontrak?.filter(isWorkspaceItem) || [],
      lagu: db.lagu?.filter(isWorkspaceItem) || [],
      // Keep all labels accessible so the header dropdown works,
      // but if you only want the active label data to be passed around:
      label: db.label || [],
      // Pengguna and Aktivitas are NOT filtered here
    };
  }, [db, currentUser, activeWorkspace]);

  if (isLoading) {
    return <div className="loading-screen text-white flex items-center justify-center h-screen bg-gray-900">Loading Database...</div>;
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} onResetPassword={handleResetPassword} db={db} />;
  }

  const isFormWizard = activeMenu === 'kontrak' || activeMenu === 'preview-kontrak';

  // Hooks are now moved up

  return (
    <div className="app-container">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={handleNavigate}  
        collapsed={sidebarCollapsed}
        openMobile={sidebarOpenMobile}
        setOpenMobile={setSidebarOpenMobile}
        user={currentUser}
        onLogout={handleLogout}
      />
      {sidebarOpenMobile && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpenMobile(false)}
        />
      )}
      <main className="main-content bg-main">
        {!isFormWizard && (
          <Header 
            user={currentUser}
            db={scopedDb}
            onLogout={handleLogout}
            activeWorkspace={activeWorkspace}
            setActiveWorkspace={setActiveWorkspace}
            onMenuClick={() => {
              if (window.innerWidth <= 768) {
                setSidebarOpenMobile(!sidebarOpenMobile);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }} 
          />
        )}
        <div className={isFormWizard ? "content-full" : "content-scrollable"}>
          {activeMenu === 'dashboard' && <Dashboard onNavigate={handleNavigate} db={scopedDb} onEditDraft={handleEditDraft} user={currentUser} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'draft' && <DraftList db={scopedDb} setDb={setDb} onEditDraft={handleEditDraft} onBack={() => handleNavigate('dashboard')} activeWorkspace={activeWorkspace} />}
          {activeMenu?.startsWith('list_kontrak') && <ContractList db={scopedDb} setDb={setDb} filter={activeMenu.replace('list_kontrak_', '') === 'list_kontrak' ? 'semua' : activeMenu.replace('list_kontrak_', '')} onBack={() => handleNavigate('dashboard')} onPreview={(data, autoDownload) => { setContractData({...data, autoDownload}); handleNavigate('preview-kontrak'); }} onEdit={handleEditDraft} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'artis' && <ArtisList db={scopedDb} setDb={setDb} user={currentUser} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'pencipta' && <PenciptaList db={scopedDb} setDb={setDb} onNavigate={handleNavigate} user={currentUser} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'kontrak' && <KontrakBaru onBack={(menu) => handleNavigate(menu || 'dashboard')} contractData={contractData} setContractData={setContractData} db={scopedDb} setDb={setDb} user={currentUser} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'preview-kontrak' && <PreviewKontrak onBack={() => handleNavigate(contractData?.status === 'Aktif' ? 'list_kontrak_aktif' : 'kontrak')} contractData={contractData} db={scopedDb} setDb={setDb} user={currentUser} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'lagu' && <Lagu db={scopedDb} setDb={setDb} user={currentUser} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'pihak-label' && <PihakLabel db={scopedDb} setDb={setDb} user={currentUser} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'template' && <TemplateKontrak onNavigate={setActiveMenu} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'laporan' && <Laporan db={scopedDb} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'pengingat' && <Pengingat db={scopedDb} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'pengaturan' && <Pengaturan db={db} setDb={setDb} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'pengguna' && <Pengguna db={db} setDb={setDb} activeWorkspace={activeWorkspace} />}
          {activeMenu === 'superadmin' && currentUser?.role === 'Super Admin' && <SuperAdminDashboard db={db} setDb={setDb} />}
          {activeMenu === 'superadmin' && currentUser?.role !== 'Super Admin' && <Dashboard onNavigate={handleNavigate} db={scopedDb} onEditDraft={handleEditDraft} user={currentUser} activeWorkspace={activeWorkspace} />}
        </div>
      </main>
    </div>
  );
}

export default App;
