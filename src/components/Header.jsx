import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Building, LogOut } from 'lucide-react';

export default function Header({ onMenuClick, user, onLogout, db, activeWorkspace, setActiveWorkspace }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    let generated = [];
    
    // Add dynamic notifications from contracts
    if (db?.kontrak && db.kontrak.length > 0) {
      db.kontrak.forEach((k) => {
        generated.push({
           id: `k-${k.id || k.nomorKontrak}`,
           title: `Kontrak baru ditambahkan: ${k.nomorKontrak}`,
           time: 'Baru saja',
           unread: !readIds.includes(`k-${k.id || k.nomorKontrak}`)
        });
      });
    }

    // Add some default ones if empty or to fill up
    if (generated.length === 0) {
       generated.push(
         { id: 'd1', title: 'Kontrak artis Tiara akan segera berakhir', time: '1 jam yang lalu', unread: !readIds.includes('d1') },
         { id: 'd2', title: 'Laporan bulanan telah dibuat', time: '2 hari yang lalu', unread: !readIds.includes('d2') }
       );
    }

    // Sort by newest first and limit to 5
    setNotifications(generated.reverse().slice(0, 5));
  }, [db]);

  const unreadCount = notifications.filter(n => n.unread).length;
  
  // Use the active label or fallback
  const activeLabel = db?.label?.find(l => l.id === activeWorkspace);
  const companyName = activeLabel?.name || user?.name || 'Workspace';

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    localStorage.setItem('read_notifications', JSON.stringify([...new Set([...readIds, ...allIds])]));
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('read_notifications', JSON.stringify(readIds));
    }
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const toggleDropdown = () => {
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
      </div>
      
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="notification-container" ref={dropdownRef} style={{ position: 'relative' }}>
          <button className="notification-btn" onClick={toggleDropdown}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <span>Notifikasi</span>
                {unreadCount > 0 && (
                  <button className="notification-clear-btn" onClick={markAllAsRead}>
                    Tandai semua dibaca
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${notif.unread ? 'unread' : ''}`}
                      onClick={() => markAsRead(notif.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="notification-title">{notif.title}</span>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="notification-item">
                    <span className="notification-title" style={{color: 'var(--text-muted)', textAlign: 'center'}}>Tidak ada notifikasi</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="company-selector hidden sm:flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
          <Building size={16} className="text-slate-300" />
          <select 
            className="bg-transparent text-sm font-semibold text-white outline-none cursor-pointer appearance-none pr-4"
            value={activeWorkspace || ''}
            onChange={(e) => setActiveWorkspace(e.target.value)}
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            {db?.label?.map(l => (
              <option key={l.id} value={l.id} className="text-slate-900">{l.name}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors"
          style={{ 
            color: '#ef4444', 
            border: '1px solid #fee2e2', 
            backgroundColor: '#fef2f2',
            cursor: 'pointer'
          }}
          title="Logout"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
