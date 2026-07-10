import React, { useState } from 'react';
import { 
  Music, 
  Search, 
  Filter, 
  Plus, 
  Minus,
  MoreVertical,
  Disc3,
  Mic2,
  FileAudio
} from 'lucide-react';

const dummySongs = [
  {
    id: 'SNG-001',
    title: 'Terluka Tapi Tak Berdarah',
    artist: 'Tiara Andini',
    composer: 'Yovie Widianto',
    isrc: 'ID-V01-24-00001',
    iswc: 'T-000.000.001-1',
    status: ['master', 'publishing'],
    cover: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=150&auto=format&fit=crop'
  },
  {
    id: 'SNG-002',
    title: 'Waktu Yang Salah',
    artist: 'Fiersa Besari',
    composer: 'Fiersa Besari',
    isrc: 'ID-V01-23-00102',
    iswc: 'T-000.000.002-2',
    status: ['publishing'],
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=150&auto=format&fit=crop'
  },
  {
    id: 'SNG-003',
    title: 'Sisa Rasa',
    artist: 'Mahalini',
    composer: 'Martinus Tintin',
    isrc: 'ID-V01-22-00045',
    iswc: 'T-000.000.003-3',
    status: ['master'],
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=150&auto=format&fit=crop'
  },
  {
    id: 'SNG-004',
    title: 'Evaluasi',
    artist: 'Hindia',
    composer: 'Baskara Putra',
    isrc: 'ID-V01-21-00088',
    iswc: 'T-000.000.004-4',
    status: ['master', 'publishing'],
    cover: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=150&auto=format&fit=crop'
  },
  {
    id: 'SNG-005',
    title: 'Celengan Rindu',
    artist: 'Fiersa Besari',
    composer: 'Fiersa Besari',
    isrc: 'ID-V01-19-00012',
    iswc: 'T-000.000.005-5',
    status: ['publishing'],
    cover: 'https://images.unsplash.com/photo-1516280440502-69f826330089?q=80&w=150&auto=format&fit=crop'
  }
];

export default function Lagu({ db, setDb, user, activeWorkspace }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', artist: '', composer: '', isrc: '', iswc: '', statusMaster: false, statusPublishing: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSong = {
      id: `LGU-${Date.now()}`,
      status: 'Proses Perekaman',
      createdBy: user?.id,
      labelId: activeWorkspace,
      title: formData.title,
      artist: formData.artist,
      composer: formData.composer,
      isrc: formData.isrc,
      iswc: formData.iswc,
      status: [
        ...(formData.statusMaster ? ['master'] : []),
        ...(formData.statusPublishing ? ['publishing'] : [])
      ],
      cover: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=150&auto=format&fit=crop'
    };
    
    setDb(prev => ({
      ...prev,
      lagu: [...prev.lagu, newSong]
    }));
    
    setShowForm(false);
    setFormData({ title: '', artist: '', composer: '', isrc: '', iswc: '', statusMaster: false, statusPublishing: false });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const displayedSongs = db?.lagu?.length > 0 ? db.lagu : dummySongs;

  return (
    <div className="page-container p-6">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Master Data Lagu</h2>
          <p className="text-sm text-gray-500">Kelola data karya cipta, master rekaman, dan metadata lagu</p>
        </div>
        <button className={`btn flex items-center gap-2 ${showForm ? 'btn-danger' : 'btn-primary'}`} onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? 'Batal Tambah' : 'Tambah Lagu Baru'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">Tambah Data Lagu</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="form-group col-span-2 md:col-span-1">
                <label className="font-bold">Judul Lagu</label>
                <input required name="title" value={formData.title} onChange={handleChange} type="text" className="form-control" />
              </div>
              <div className="form-group col-span-2 md:col-span-1">
                <label className="font-bold">Artis Utama</label>
                <input required name="artist" value={formData.artist} onChange={handleChange} type="text" className="form-control" />
              </div>
              <div className="form-group col-span-2 md:col-span-1">
                <label className="font-bold">Pencipta (Komposer)</label>
                <input required name="composer" value={formData.composer} onChange={handleChange} type="text" className="form-control" />
              </div>
              <div className="form-group col-span-2 md:col-span-1 flex gap-4">
                <div className="flex-1">
                  <label className="font-bold">Kode ISRC</label>
                  <input name="isrc" value={formData.isrc} onChange={handleChange} type="text" className="form-control" placeholder="ID-XXX-XX-XXXXX" />
                </div>
                <div className="flex-1">
                  <label className="font-bold">Kode ISWC</label>
                  <input name="iswc" value={formData.iswc} onChange={handleChange} type="text" className="form-control" placeholder="T-XXX.XXX.XXX-X" />
                </div>
              </div>
              <div className="form-group col-span-2">
                <label className="font-bold block mb-2">Status Hak Kepemilikan</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="statusMaster" checked={formData.statusMaster} onChange={handleChange} className="rounded text-primary focus:ring-primary" />
                    Hak Master (Rekaman Suara)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="statusPublishing" checked={formData.statusPublishing} onChange={handleChange} className="rounded text-primary focus:ring-primary" />
                    Hak Publishing (Karya Cipta)
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">Simpan Lagu</button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card flex items-center p-4 md:p-5">
          <div 
            className="rounded-full flex items-center justify-center shrink-0 mobile-icon-48" 
            style={{ 
              width: '48px', height: '48px', minWidth: '48px', marginRight: '16px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' 
            }}
          >
            <Music size={24} className="icon-shrink" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Total Lagu</p>
            <h3 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-main)' }}>1,248</h3>
          </div>
        </div>
        <div className="card flex items-center p-4 md:p-5">
          <div 
            className="rounded-full flex items-center justify-center shrink-0 mobile-icon-48" 
            style={{ 
              width: '48px', height: '48px', minWidth: '48px', marginRight: '16px',
              backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#10b981' 
            }}
          >
            <Disc3 size={24} className="icon-shrink" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Hak Master</p>
            <h3 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-main)' }}>842</h3>
          </div>
        </div>
        <div className="card flex items-center p-4 md:p-5">
          <div 
            className="rounded-full flex items-center justify-center shrink-0 mobile-icon-48" 
            style={{ 
              width: '48px', height: '48px', minWidth: '48px', marginRight: '16px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' 
            }}
          >
            <FileAudio size={24} className="icon-shrink" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Hak Publishing</p>
            <h3 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-main)' }}>1,056</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="card">
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b gap-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari judul lagu, artis, atau ISRC..." 
              className="form-control w-full pl-10 pr-4 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="btn btn-outline flex items-center gap-2 text-sm flex-1 md:flex-none justify-center">
              <Filter size={16} /> Filter
            </button>
            <button className="btn btn-outline flex items-center gap-2 text-sm flex-1 md:flex-none justify-center">
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul Lagu</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Artis / Pencipta</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode ISRC & ISWC</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Hak</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedSongs.map(song => (
                <tr key={song.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={song.cover} alt={song.title} className="w-10 h-10 rounded-md object-cover" />
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{song.title}</p>
                        <p className="text-xs text-gray-500">{song.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Mic2 size={12} className="text-gray-400" />
                        <span className="font-medium">{song.artist}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FileAudio size={12} className="text-gray-400" />
                        <span>{song.composer}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)' }}>ISRC</span>
                        <span>{song.isrc || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)' }}>ISWC</span>
                        <span>{song.iswc || '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {song.status.includes('master') && (
                        <span 
                          className="px-2 py-1 text-[10px] font-bold tracking-wide uppercase rounded-full"
                          style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}
                        >
                          Master
                        </span>
                      )}
                      {song.status.includes('publishing') && (
                        <span 
                          className="px-2 py-1 text-[10px] font-bold tracking-wide uppercase rounded-full"
                          style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}
                        >
                          Publishing
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-gray-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-primary-light">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t flex items-center justify-between text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
          <p>Menampilkan 1 hingga {displayedSongs.length} dari {displayedSongs.length} data</p>
          <div className="flex gap-1">
            <button className="btn btn-outline px-3 py-1" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }} disabled>Seb</button>
            <button className="btn btn-primary px-3 py-1 text-white">1</button>
            <button className="btn btn-outline px-3 py-1" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>2</button>
            <button className="btn btn-outline px-3 py-1" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>3</button>
            <button className="btn btn-outline px-3 py-1" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>Sel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
