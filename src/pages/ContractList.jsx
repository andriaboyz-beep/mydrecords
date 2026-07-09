import React, { useState } from 'react';
import { FileText, Trash2, Search, FileCheck, CalendarClock, ArrowLeft, X, Download, Printer, FileBadge2, ZoomIn, ZoomOut, Pen } from 'lucide-react';
import PreviewKontrak from './PreviewKontrak';

export default function ContractList({ db, setDb, filter = 'semua', onBack, onPreview, onEdit }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(0.8);
  
  // Get all non-draft contracts
  const allContracts = db?.kontrak?.filter(k => k.status !== 'Draft') || [];
  
  // Filter based on the requested type
  let filteredContracts = [];
  let title = '';
  let subtitle = '';
  let Icon = FileText;
  let iconColor = 'text-purple-600 bg-purple-100';

  if (filter === 'aktif') {
    filteredContracts = allContracts.filter(k => k.status === 'Aktif');
    title = 'Kontrak Aktif';
    subtitle = 'Daftar kontrak yang sedang berjalan.';
    Icon = FileCheck;
    iconColor = 'text-emerald-600 bg-emerald-100';
  } else if (filter === 'berakhir') {
    filteredContracts = allContracts.filter(k => k.status === 'Berakhir');
    title = 'Kontrak Berakhir';
    subtitle = 'Daftar kontrak yang sudah habis masa berlakunya.';
    Icon = CalendarClock;
    iconColor = 'text-amber-600 bg-amber-100';
  } else {
    filteredContracts = allContracts;
    title = 'Semua Kontrak';
    subtitle = 'Daftar semua kontrak artis dan pencipta.';
  }

  const handleDelete = (id) => {
    setDb(prev => ({
      ...prev,
      kontrak: prev.kontrak.filter(k => k.id !== id)
    }));
    setConfirmDeleteId(null);
  };

  const artisContracts = filteredContracts.filter(c => c.jenisKontrak !== 'pencipta');
  const penciptaContracts = filteredContracts.filter(c => c.jenisKontrak === 'pencipta');

  const renderContractItem = (contract) => (
    <div key={contract.id} className="list-item hover:bg-gray-50 transition-colors p-4 rounded-lg border border-gray-100 mb-3">
      <div className={`metric-icon w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div className="list-content flex-1 ml-4">
        <h4 
          className="list-title text-primary text-lg cursor-pointer hover:underline"
          onClick={() => setSelectedContract(contract)}
        >
          {contract.pihak2_nama || 'Belum ada nama pihak kedua'}
        </h4>
        <p className="list-subtitle mt-1">
          <span className="font-medium">{contract.jenisKontrak === 'pencipta' ? 'Kontrak Pencipta' : 'Kontrak Artis'}</span> 
          {contract.nomorKontrak && <span className="mx-2 text-gray-300">|</span>}
          {contract.nomorKontrak}
        </p>
        <p className="text-xs text-gray-500 mt-2 flex gap-4">
          <span>Dibuat: {new Date(contract.createdAt).toLocaleString('id-ID')}</span>
          <span className="font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Status: {contract.status || 'Aktif'}</span>
        </p>
      </div>
      <div className="list-actions flex gap-2">
        {confirmDeleteId === contract.id ? (
          <div className="flex items-center gap-2 bg-red-50 p-1 rounded-md border border-red-100">
            <span className="text-sm font-medium text-red-600 px-2">Yakin hapus?</span>
            <button 
              type="button"
              className="btn btn-outline border-red-300 text-white bg-red-600 hover:bg-red-700 px-3 py-1"
              onClick={() => handleDelete(contract.id)}
            >
              Ya
            </button>
            <button 
              type="button"
              className="btn btn-outline px-3 py-1"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
              onClick={() => setConfirmDeleteId(null)}
            >
              Batal
            </button>
          </div>
        ) : (
          <>
            <button 
              type="button"
              className="btn btn-outline border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => onEdit && onEdit(contract)}
              title="Edit Kontrak"
            >
              <Pen size={16} /> Edit
            </button>
            <button 
              type="button"
              className="btn btn-outline border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setConfirmDeleteId(contract.id)}
              title="Hapus Kontrak"
            >
              <Trash2 size={16} /> Hapus
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 m-0">{title}</h2>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
        {onBack && (
          <button 
            type="button"
            className="btn btn-secondary flex items-center gap-2"
            onClick={onBack}
          >
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header border-b border-gray-100 pb-4 mb-4">
          <div className="flex justify-between items-center w-full">
            <h3 className="card-title m-0">Daftar Kontrak ({filteredContracts.length})</h3>
            <div className="search-box">
              <Search size={18} className="text-gray-400" />
              <input type="text" placeholder="Cari kontrak..." className="search-input" />
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Kolom Artis */}
          <div className="list-group">
            <h4 style={{ marginBottom: '16px', fontWeight: 'bold', color: '#7c3aed', borderBottom: '2px solid #ede9fe', paddingBottom: '8px', fontSize: '18px' }}>
              Kontrak Artis/Penyanyi ({artisContracts.length})
            </h4>
            {artisContracts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Icon size={32} className="mx-auto text-gray-300 mb-4" />
                <p className="text-sm">Tidak ada data kontrak artis</p>
              </div>
            ) : (
              artisContracts.map(renderContractItem)
            )}
          </div>

          {/* Kolom Pencipta */}
          <div className="list-group" style={{ borderLeft: '1px dashed #e5e7eb', paddingLeft: '24px' }}>
            <h4 style={{ marginBottom: '16px', fontWeight: 'bold', color: '#10b981', borderBottom: '2px solid #d1fae5', paddingBottom: '8px', fontSize: '18px' }}>
              Kontrak Pencipta Lagu ({penciptaContracts.length})
            </h4>
            {penciptaContracts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Icon size={32} className="mx-auto text-gray-300 mb-4" />
                <p className="text-sm">Tidak ada data kontrak pencipta</p>
              </div>
            ) : (
              penciptaContracts.map(renderContractItem)
            )}
          </div>
        </div>
      </div>

      {/* Beautiful Promotional Modal (Inline Styled) */}
      {selectedContract && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            width: '100%', maxWidth: '800px', maxHeight: '90vh', backgroundColor: 'var(--bg-card)',
            borderRadius: '20px', overflow: 'hidden', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => {
                setSelectedContract(null);
                setZoomLevel(0.8);
              }}
              style={{
                position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.2)', border: 'none',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            {/* Top Area: Header + Actions (Horizontal Layout) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
              {/* Header / Graphic Area */}
              <div style={{
                background: 'linear-gradient(135deg, #209CEE, #1B80C4)',
                padding: '24px 20px', color: '#fff', flex: '1 1 300px',
                position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '16px'
              }}>
                <div style={{ position: 'absolute', top: '-10px', left: '-10px', opacity: 0.15 }}>
                  <FileBadge2 size={120} />
                </div>
                <div style={{
                  width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)', flexShrink: 0, position: 'relative', zIndex: 1
                }}>
                  <FileText size={28} color="#fff" />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{
                    fontSize: '20px', fontWeight: '900', letterSpacing: '0.5px',
                    lineHeight: '1.2', margin: '0 0 4px 0', textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    KONTRAK {selectedContract.jenisKontrak === 'pencipta' ? 'PENCIPTA' : 'ARTIS'}<br/>SIAP DICETAK!
                  </h3>
                  <p style={{ color: '#E0F2FE', fontSize: '13px', margin: 0 }}>
                    Dokumen legal atas nama <br/>
                    <strong style={{ color: '#fff', fontSize: '15px' }}>
                      {selectedContract.pihak2_nama}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Actions Area */}
              <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'center', flex: '1 1 300px', backgroundColor: 'var(--bg-sidebar-hover)' }}>
                <button 
                  onClick={() => onPreview(selectedContract, true)}
                  style={{
                    flex: '1 1 auto', backgroundColor: '#FFD600', color: '#1B80C4',
                    fontWeight: '900', padding: '12px 16px', borderRadius: '10px', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    cursor: 'pointer', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <Download size={18} />
                  Unduh PDF
                </button>
                
                <button 
                  onClick={() => onPreview(selectedContract, false)}
                  style={{
                    flex: '1 1 auto', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)',
                    fontWeight: 'bold', padding: '10px 16px', borderRadius: '10px',
                    border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px'
                  }}
                >
                  <Printer size={18} />
                  Cetak Layar Penuh
                </button>
              </div>
            </div>

            {/* Review Header + Zoom Controls (Fixed) */}
            <div style={{ 
              padding: '16px 24px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', zIndex: 2
            }}>
              <div>
                <h4 style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '16px', margin: 0 }}>Review Isi Kontrak</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0 0' }}>Scroll ke bawah untuk membaca seluruh isi dokumen sebelum dicetak.</p>
              </div>
              
              {/* Zoom Controls */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--bg-main)', padding: '4px', borderRadius: '8px' }}>
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.1))}
                  style={{ padding: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span style={{ fontSize: '13px', fontWeight: 'bold', width: '40px', textAlign: 'center', color: 'var(--text-main)' }}>{Math.round(zoomLevel * 100)}%</span>
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
                  style={{ padding: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            {/* Bottom Area: Scrolling Contract Review */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: 'var(--bg-main)' }}>
               <div style={{ 
                 backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '32px', 
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minHeight: '100%', color: 'var(--text-main)' 
               }}>
                  <div style={{ 
                    transform: `scale(${zoomLevel})`, 
                    transformOrigin: 'top center', 
                    transition: 'transform 0.2s ease-in-out',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    {/* We wrap it tightly so scaling doesn't push it off screen */}
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
