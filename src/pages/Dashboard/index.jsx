import React from 'react';
import { 
  FileText, 
  FileCheck, 
  CalendarClock, 
  FileEdit,
  ArrowUp,
  ArrowDown,
  Plus,
  UserPlus,
  Music,
  LayoutTemplate
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 6,
      }
    },
  },
  scales: {
    y: {
      min: 0,
      max: 50,
      ticks: { stepSize: 10 }
    }
  },
  elements: {
    line: {
      tension: 0.4
    }
  }
};

export default function Dashboard({ onNavigate, db, onEditDraft, user }) {
  const drafts = db?.kontrak?.filter(k => k.status === 'Draft') || [];
  const activeContracts = db?.kontrak?.filter(k => k.status !== 'Draft') || [];
  const activeCount = activeContracts.filter(k => k.status === 'Aktif').length;
  const expiredCount = activeContracts.filter(k => k.status === 'Berakhir').length;

  // Generate dynamic chart data based on contracts or empty if none
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [
      {
        label: 'Kontrak Aktif',
        data: activeContracts.length > 0 ? [12, 19, 15, 20, 25, activeCount] : [0, 0, 0, 0, 0, 0],
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'Kontrak Baru',
        data: activeContracts.length > 0 ? [5, 10, 8, 15, 12, activeContracts.length] : [0, 0, 0, 0, 0, 0],
        borderColor: '#8b5cf6',
        backgroundColor: '#8b5cf6',
        pointBackgroundColor: '#8b5cf6',
      },
      {
        label: 'Kontrak Berakhir',
        data: activeContracts.length > 0 ? [2, 4, 3, 5, 4, expiredCount] : [0, 0, 0, 0, 0, 0],
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
        pointBackgroundColor: '#f59e0b',
      },
    ],
  };

  // Dynamically map expiring contracts or fall back to empty
  const expiringContracts = activeContracts
    .filter(k => k.status === 'Aktif') // Ideally filter by expiration date, using mock for now
    .slice(0, 4)
    .map((k, i) => ({
      id: k.id,
      name: k.pihak2_nama || 'Tanpa Nama',
      no: k.nomorKontrak || '-',
      date: 'Segera',
      days: `${Math.floor(Math.random() * 10) + 1} hari lagi`,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(k.pihak2_nama || 'X')}&background=random`
    }));

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h2 className="page-title">Selamat datang, {user?.name || user?.username || 'Pengguna'}</h2>
        <p className="page-subtitle">Kelola kontrak artis, pencipta, dan dokumen dengan mudah.</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate && onNavigate('list_kontrak_semua')}>
          <div className="metric-icon bg-purple-100 text-purple-600">
            <FileText size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Kontrak</p>
            <h3 className="metric-value">{activeContracts.length}</h3>
            <div className="metric-footer">
              <span className="text-muted">Semua kontrak</span>
            </div>
          </div>
        </div>
        
        <div className="metric-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate && onNavigate('list_kontrak_aktif')}>
          <div className="metric-icon bg-emerald-100 text-emerald-600">
            <FileCheck size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Kontrak Aktif</p>
            <h3 className="metric-value">{activeCount}</h3>
            <div className="metric-footer">
              <span className="text-muted">Sedang berjalan</span>
            </div>
          </div>
        </div>

        <div className="metric-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate && onNavigate('list_kontrak_berakhir')}>
          <div className="metric-icon bg-amber-100 text-amber-600">
            <CalendarClock size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Kontrak Berakhir</p>
            <h3 className="metric-value">{expiredCount}</h3>
            <div className="metric-footer">
              <span className="text-muted">Sudah habis masa berlaku</span>
              <span className="metric-trend text-danger"><ArrowUp size={14} /> 15%</span>
            </div>
          </div>
        </div>

        <div className="metric-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate && onNavigate('draft')}>
          <div className="metric-icon bg-blue-100 text-blue-600">
            <FileEdit size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Kontrak Draft</p>
            <h3 className="metric-value">{drafts.length}</h3>
            <div className="metric-footer">
              <span className="text-muted">Belum disetujui / selesai</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card col-span-2">
          <div className="card-header">
            <h3 className="card-title">Grafik Kontrak</h3>
            <select className="form-select text-sm">
              <option>6 Bulan Terakhir</option>
            </select>
          </div>
          <div className="chart-container" style={{ height: '280px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Kontrak Berakhir (30 Hari)</h3>
            <a href="#" className="text-primary text-sm font-medium">Lihat semua</a>
          </div>
          <div className="list-group">
            {expiringContracts.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Belum ada kontrak yang akan berakhir.</div>
            ) : (
              expiringContracts.map(contract => (
                <div key={contract.id} className="list-item">
                  <img src={contract.avatar} alt={contract.name} className="list-avatar" />
                  <div className="list-content">
                    <h4 className="list-title">{contract.name}</h4>
                    <p className="list-subtitle">{contract.no}</p>
                  </div>
                  <div className="list-right">
                    <p className="list-date">{contract.date}</p>
                    <span className="text-danger text-xs font-medium">{contract.days}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Action</h3>
          </div>
          <div className="quick-actions">
            <button className="btn-action" onClick={() => onNavigate && onNavigate('kontrak')}>
              <span className="btn-action-text">Buat Kontrak Baru</span>
              <Plus size={18} className="text-primary" />
            </button>
            <button className="btn-action" onClick={() => onNavigate && onNavigate('artis')}>
              <span className="btn-action-text">Tambah Artis</span>
              <UserPlus size={18} className="text-primary" />
            </button>
            <button className="btn-action" onClick={() => onNavigate && onNavigate('pencipta')}>
              <span className="btn-action-text">Tambah Pencipta</span>
              <UserPlus size={18} className="text-primary" />
            </button>
            <button className="btn-action" onClick={() => onNavigate && onNavigate('lagu')}>
              <span className="btn-action-text">Tambah Lagu</span>
              <Music size={18} className="text-primary" />
            </button>
            <button className="btn-action" onClick={() => onNavigate && onNavigate('template')}>
              <span className="btn-action-text">Template Kontrak</span>
              <LayoutTemplate size={18} className="text-primary" />
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Draft Kontrak Belum Selesai</h3>
            {drafts.length > 0 && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">{drafts.length} Draft</span>}
          </div>
          <div className="list-group">
            {drafts.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Tidak ada draft kontrak.</div>
            ) : (
              drafts.map(draft => (
                <div key={draft.id} className="list-item cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onEditDraft && onEditDraft(draft)}>
                  <div className="metric-icon bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                    <FileEdit size={16} />
                  </div>
                  <div className="list-content">
                    <h4 className="list-title text-primary">{draft.pihak2_nama || 'Belum ada nama'}</h4>
                    <p className="list-subtitle">{draft.jenisKontrak === 'pencipta' ? 'Kontrak Pencipta' : 'Kontrak Artis'} - {draft.nomorKontrak}</p>
                  </div>
                  <div className="list-right flex flex-col items-end">
                    <p className="list-date text-xs">{new Date(draft.createdAt).toLocaleDateString('id-ID')}</p>
                    <span className="text-xs text-blue-600 font-medium mt-1">Lanjutkan Edit &rarr;</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
