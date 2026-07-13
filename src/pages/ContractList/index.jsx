import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, Printer, Pen, Trash2, X, FileBadge2, FileText, ZoomIn, ZoomOut, Sparkles, CheckCircle2, Music, UserSquare2, CalendarDays } from 'lucide-react';
import PreviewKontrak from '../PreviewKontrak';

export default function ContractList({ db, setDb, onBack, onPreview, onEdit }) {
  const [activeTab, setActiveTab] = useState('artis');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContract, setSelectedContract] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(0.8);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingSongId, setEditingSongId] = useState(null);
  const itemsPerPage = 8;

  const allContracts = db?.kontrak?.filter(k => k.status !== 'Draft') || [];
  
  const tabContracts = allContracts.filter(c => 
    activeTab === 'artis' ? c.jenisKontrak !== 'pencipta' : c.jenisKontrak === 'pencipta'
  );

  const filteredContracts = tabContracts.filter(c => {
    const searchLower = searchQuery.toLowerCase();
    const nama = (c.pihak2_nama || '').toLowerCase();
    const judul = (c.lagu_judul || '').toLowerCase();
    return nama.includes(searchLower) || judul.includes(searchLower);
  });

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = (id) => {
    setDb(prev => ({
      ...prev,
      kontrak: prev.kontrak.filter(k => k.id !== id)
    }));
    setConfirmDeleteId(null);
  };

  const handleUpdateSong = (contractId, newSongTitle) => {
    const relatedPenciptaContract = db?.kontrak?.find(k => k.jenisKontrak === 'pencipta' && k.lagu_judul === newSongTitle);
    
    setDb(prev => ({
      ...prev,
      kontrak: prev.kontrak.map(k => {
        if (k.id === contractId) {
          return {
            ...k,
            lagu_judul: newSongTitle,
            lagu_genre: relatedPenciptaContract?.lagu_genre || k.lagu_genre || '',
            lagu_durasi: relatedPenciptaContract?.lagu_durasi || k.lagu_durasi || ''
          };
        }
        return k;
      })
    }));
    setEditingSongId(null);
  };

  const penciptaSongs = {};
  (db?.kontrak || []).filter(k => k.jenisKontrak === 'pencipta' && k.lagu_judul).forEach(k => {
    const creator = k.pihak2_nama || 'Unknown Pencipta';
    if (!penciptaSongs[creator]) {
      penciptaSongs[creator] = new Set();
    }
    penciptaSongs[creator].add(k.lagu_judul);
  });

  return (
    <div style={{ padding: '32px 40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
        }
        .gradient-text {
          background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .search-wrapper:focus-within {
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
          border-color: #6366f1 !important;
        }
        .contract-row {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }
        .contract-row:hover {
          transform: translateY(-2px) scale(1.002);
          box-shadow: 0 12px 24px -10px rgba(99, 102, 241, 0.15);
          background-color: #ffffff;
          border-color: rgba(99, 102, 241, 0.2);
          z-index: 10;
          position: relative;
        }
        .action-btn {
          transition: all 0.2s;
          opacity: 0.7;
        }
        .action-btn:hover {
          transform: scale(1.15);
          opacity: 1;
        }
        .tab-btn {
          position: relative;
          transition: all 0.3s;
        }
        .tab-btn.active {
          color: #4f46e5;
          font-weight: 700;
        }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #4f46e5, #9333ea);
          border-radius: 4px;
        }
        .fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header Section */}
      <div className="fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Manajemen Kontrak <Sparkles size={28} color="#9333ea" />
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Kelola seluruh kontrak artis dan pencipta lagu secara terpusat.</p>
        </div>
      </div>

      {/* Controls: Tabs & Search */}
      <div className="fade-in" style={{ animationDelay: '0.1s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '32px', borderBottom: '2px solid #e2e8f0', paddingBottom: '4px' }}>
          <button
            className={`tab-btn ${activeTab === 'artis' ? 'active' : ''}`}
            onClick={() => { setActiveTab('artis'); setCurrentPage(1); }}
            style={{
              background: 'none', border: 'none', padding: '8px 4px', cursor: 'pointer',
              fontSize: '16px', color: activeTab === 'artis' ? '#4f46e5' : '#64748b',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <UserSquare2 size={18} /> Kontrak Artis / Penyanyi
          </button>
          <button
            className={`tab-btn ${activeTab === 'pencipta' ? 'active' : ''}`}
            onClick={() => { setActiveTab('pencipta'); setCurrentPage(1); }}
            style={{
              background: 'none', border: 'none', padding: '8px 4px', cursor: 'pointer',
              fontSize: '16px', color: activeTab === 'pencipta' ? '#4f46e5' : '#64748b',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Music size={18} /> Kontrak Pencipta Lagu
          </button>
        </div>

        <div className="search-wrapper glass-panel" style={{
          display: 'flex', alignItems: 'center', 
          borderRadius: '12px', padding: '12px 20px', width: '100%', maxWidth: '380px',
          border: '1px solid #cbd5e1', transition: 'all 0.3s', backgroundColor: '#fff'
        }}>
          <Search size={18} color="#94a3b8" style={{ marginRight: '12px' }} />
          <input
            type="text"
            placeholder="Cari nama artis, pencipta, atau lagu..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#334155', background: 'transparent' }}
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="fade-in glass-panel" style={{ animationDelay: '0.2s', borderRadius: '20px', padding: '24px', backgroundColor: 'rgba(255,255,255,0.85)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '0 20px 12px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{activeTab === 'artis' ? 'Nama Artis' : 'Nama Pencipta'}</th>
              <th style={{ padding: '0 20px 12px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Judul Lagu</th>
              <th style={{ padding: '0 20px 12px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tgl. Produksi</th>
              <th style={{ padding: '0 20px 12px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '0 20px 12px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {paginatedContracts.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '60px 0', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', opacity: 0.5 }}>
                    <FileBadge2 size={48} color="#94a3b8" />
                    <span style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Tidak ada kontrak yang ditemukan</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedContracts.map((contract, idx) => (
                <tr key={contract.id} className="contract-row" style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <td style={{ padding: '20px', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setSelectedContract(contract)}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 'bold' }}>
                        {(contract.pihak2_nama || '?').charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{contract.pihak2_nama || '-'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    {editingSongId === contract.id ? (
                      <select
                        autoFocus
                        onBlur={() => setEditingSongId(null)}
                        onChange={(e) => handleUpdateSong(contract.id, e.target.value)}
                        value={contract.lagu_judul || ''}
                        style={{ padding: '10px 12px', borderRadius: '8px', border: '2px solid #6366f1', fontSize: '14px', width: '100%', outline: 'none', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(99,102,241,0.1)' }}
                      >
                        <option value="" disabled>Pilih lagu</option>
                        {Array.from(new Set(
                          db?.kontrak?.filter(k => k.jenisKontrak === 'pencipta' && k.lagu_judul && k.pihak2_nama === contract.pihak2_nama).map(k => k.lagu_judul)
                        )).map(lagu => (
                          <option key={lagu} value={lagu}>{lagu}</option>
                        ))}
                      </select>
                    ) : (
                      <div 
                        onClick={() => setEditingSongId(contract.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', cursor: 'pointer', width: 'fit-content' }}
                        title="Klik untuk mengubah lagu"
                      >
                        <Music size={14} color="#64748b" />
                        <span style={{ fontSize: '14px', color: contract.lagu_judul ? '#334155' : '#94a3b8', fontWeight: '500' }}>
                          {contract.lagu_judul || 'Pilih lagu...'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '20px', fontSize: '14px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CalendarDays size={14} />
                      {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', backgroundColor: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: '700' }}>
                      <CheckCircle2 size={14} />
                      {contract.status || 'AKTIF'}
                    </div>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                    {confirmDeleteId === contract.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                        <button onClick={() => handleDelete(contract.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Hapus</button>
                        <button onClick={() => setConfirmDeleteId(null)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Batal</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                        <button onClick={() => onEdit && onEdit(contract)} className="action-btn" style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }} title="Edit Kontrak">
                          <Pen size={18} />
                        </button>
                        <button onClick={() => setConfirmDeleteId(contract.id)} className="action-btn" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Hapus Kontrak">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
            Menampilkan <span style={{ color: '#1e293b', fontWeight: '700' }}>{filteredContracts.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredContracts.length)}</span> dari <span style={{ color: '#1e293b', fontWeight: '700' }}>{filteredContracts.length}</span> kontrak
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                color: currentPage === 1 ? '#cbd5e1' : '#64748b', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    background: currentPage === i + 1 ? 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)' : '#fff',
                    border: currentPage === i + 1 ? 'none' : '1px solid #e2e8f0', 
                    borderRadius: '8px', width: '36px', height: '36px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                    color: currentPage === i + 1 ? '#fff' : '#64748b',
                    boxShadow: currentPage === i + 1 ? '0 4px 12px rgba(99,102,241,0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                color: currentPage === totalPages ? '#cbd5e1' : '#64748b', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Profile/Preview Modal with Premium Styling */}
      {selectedContract && (
        <div className="fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
        }}>
          <div style={{
            width: '100%', maxWidth: '850px', height: '90vh', backgroundColor: '#f8fafc',
            borderRadius: '24px', overflow: 'hidden', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <button 
              onClick={() => { setSelectedContract(null); setZoomLevel(0.8); }}
              style={{
                position: 'absolute', top: '20px', right: '20px', zIndex: 20,
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.4)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              <X size={20} />
            </button>

            {/* Premium Modal Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', flexShrink: 0 }}>
              <div style={{
                background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
                padding: '32px 32px', color: '#fff', flex: '1 1 350px',
                position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '20px'
              }}>
                <div style={{ position: 'absolute', top: '-20px', left: '-20px', opacity: 0.1, transform: 'rotate(-15deg)' }}>
                  <FileBadge2 size={160} />
                </div>
                <div style={{
                  width: '70px', height: '70px', background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                  borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, position: 'relative', zIndex: 1,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }}>
                  <FileText size={32} color="#fff" />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px', backdropFilter: 'blur(4px)' }}>
                    {selectedContract.jenisKontrak === 'pencipta' ? 'KONTRAK PENCIPTA' : 'KONTRAK ARTIS'}
                  </div>
                  <h3 style={{
                    fontSize: '24px', fontWeight: '800', letterSpacing: '0.5px',
                    lineHeight: '1.2', margin: '0 0 4px 0', textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    DOKUMEN RESMI
                  </h3>
                  <p style={{ color: '#e0e7ff', fontSize: '14px', margin: 0, opacity: 0.9 }}>
                    Atas nama <strong style={{ color: '#fff', fontSize: '16px' }}>{selectedContract.pihak2_nama}</strong>
                  </p>
                </div>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'center', flex: '1 1 300px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <button 
                  onClick={() => onPreview(selectedContract, true)}
                  style={{
                    flex: '1 1 auto', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff',
                    fontWeight: '700', padding: '14px 20px', borderRadius: '12px', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    cursor: 'pointer', fontSize: '15px', boxShadow: '0 8px 16px rgba(245, 158, 11, 0.25)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Download size={20} /> Unduh PDF
                </button>
                
                <button 
                  onClick={() => onPreview(selectedContract, false)}
                  style={{
                    flex: '1 1 auto', backgroundColor: '#fff', color: '#334155',
                    fontWeight: '700', padding: '12px 20px', borderRadius: '12px',
                    border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#fff'; }}
                >
                  <Printer size={20} /> Cetak Dokumen
                </button>
              </div>
            </div>

            <div style={{ 
              padding: '16px 32px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', zIndex: 2
            }}>
              <div>
                <h4 style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px', margin: 0 }}>Review Isi Kontrak</h4>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>Tinjau dokumen di bawah ini sebelum mengunduh atau mencetak.</p>
              </div>
              
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.1))}
                  style={{ padding: '8px', backgroundColor: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                >
                  <ZoomOut size={16} />
                </button>
                <span style={{ fontSize: '14px', fontWeight: '700', width: '48px', textAlign: 'center', color: '#334155' }}>{Math.round(zoomLevel * 100)}%</span>
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
                  style={{ padding: '8px', backgroundColor: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', backgroundColor: '#f1f5f9' }}>
               <div style={{ 
                 backgroundColor: '#fff', borderRadius: '16px', padding: '40px', 
                 boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', minHeight: '100%', color: '#1e293b' 
               }}>
                  <div style={{ 
                    transform: `scale(${zoomLevel})`, 
                    transformOrigin: 'top center', 
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <div style={{ width: '210mm' }}>
                      <PreviewKontrak 
                        contractData={selectedContract} 
                        isModal={true} 
                      />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
