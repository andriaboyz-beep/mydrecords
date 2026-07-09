import React from 'react';
import { 
  LayoutDashboard, 
  FileText,
  FileEdit,
  Users, 
  UserSquare2, 
  Music, 
  Briefcase, 
  LayoutTemplate, 
  BarChart3, 
  Bell, 
  Settings, 
  UserCog,
  MessageCircleQuestion,
  ArrowRight,
  LogOut,
  ShieldCheck
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kontrak', label: 'Kontrak Baru', icon: FileText },
  { id: 'draft', label: 'Draft Kontrak', icon: FileEdit },
  { id: 'artis', label: 'Artis', icon: Users },
  { id: 'pencipta', label: 'Pencipta', icon: UserSquare2 },
  { id: 'lagu', label: 'Lagu', icon: Music },
  { id: 'pihak-label', label: 'Pihak / Label', icon: Briefcase },
  { id: 'template', label: 'Template', icon: LayoutTemplate },
  { id: 'laporan', label: 'Laporan', icon: BarChart3 },
  { id: 'pengingat', label: 'Pengingat', icon: Bell },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  { id: 'pengguna', label: 'Pengguna', icon: UserCog },
];

export default function Sidebar({ activeMenu, setActiveMenu, collapsed, openMobile, setOpenMobile, user, onLogout }) {
  const filteredMenuItems = user?.role === 'Super Admin' 
    ? [{ id: 'superadmin', label: 'Super Admin', icon: ShieldCheck }, ...menuItems]
    : menuItems;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${openMobile ? 'open-mobile' : ''} dark-theme`}>
      <div className="sidebar-brand flex justify-center py-6 border-b border-white/5">
        <img 
          src="/Logo-1.png" 
          alt="Musiora Icon" 
          className="transition-all duration-300 object-contain"
          style={{ 
            maxHeight: collapsed ? '30px' : '48px', 
            maxWidth: collapsed ? '40px' : '100%',
          }} 
        />
      </div>

      <div className="sidebar-scrollable" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <nav className="sidebar-nav py-4 px-3 flex-1" style={{ flex: 1, overflowY: 'visible', padding: '1rem' }}>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveMenu(item.id);
                  if (setOpenMobile) setOpenMobile(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="sidebar-bottom-section" style={{ padding: '0 1rem 1rem' }}>
            <div className="sidebar-logo-text" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <img 
                src="/Logo-2.png" 
                alt="Musiora Text" 
                style={{ maxWidth: '140px', width: '100%', height: 'auto', objectFit: 'contain', opacity: 0.8 }}
              />
            </div>

            <div className="sidebar-help-card" style={{ backgroundColor: '#11111a', border: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#11111a'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e5e7eb' }}>
                <MessageCircleQuestion size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>Panduan Penggunaan</span>
              </div>
              <ArrowRight size={14} color="#9ca3af" />
            </div>
          </div>
        )}
      </div>

    </aside>
  );
}
