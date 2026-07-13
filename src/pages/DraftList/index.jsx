import React, { useState } from 'react';
import { FileEdit, Trash2, Search, ArrowLeft, X } from 'lucide-react';

export default function DraftList({ db, setDb, onEditDraft, onBack }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const drafts = db?.kontrak?.filter(k => k.status === 'Draft') || [];

  const handleDelete = (id) => {
    setDb(prev => ({
      ...prev,
      kontrak: prev.kontrak.filter(k => k.id !== id)
    }));
    setConfirmDeleteId(null);
  };

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h2 className="page-title">Draft Kontrak</h2>
          <p className="page-subtitle">Daftar kontrak yang belum selesai dan masih tersimpan sebagai draft.</p>
        </div>
        {onBack && (
          <button 
            type="button"
            className="btn btn-outline border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={onBack}
          >
            <ArrowLeft size={18} /> Kembali ke Dashboard
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header border-b border-gray-100 pb-4 mb-4">
          <div className="flex justify-between items-center w-full">
            <h3 className="card-title m-0">Semua Draft ({drafts.length})</h3>
            <div className="search-box">
              <Search size={18} className="text-gray-400" />
              <input type="text" placeholder="Cari draft..." className="search-input" />
            </div>
          </div>
        </div>
        
        <div className="list-group">
          {drafts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileEdit size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="font-medium text-lg">Tidak ada draft kontrak</p>
              <p className="text-sm">Semua kontrak Anda sudah selesai atau Anda belum menyimpan draft apapun.</p>
            </div>
          ) : (
            drafts.map(draft => (
              <div key={draft.id} className="list-item hover:bg-gray-50 transition-colors p-4 rounded-lg border border-gray-100 mb-3">
                <div className="metric-icon bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                  <FileEdit size={20} />
                </div>
                <div className="list-content flex-1 ml-4">
                  <h4 className="list-title text-primary text-lg">{draft.pihak2_nama || 'Belum ada nama pihak kedua'}</h4>
                  <p className="list-subtitle mt-1">
                    <span className="font-medium">{draft.jenisKontrak === 'pencipta' ? 'Kontrak Pencipta' : 'Kontrak Artis'}</span> 
                    {draft.nomorKontrak && <span className="mx-2 text-gray-300">|</span>}
                    {draft.nomorKontrak}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Disimpan pada: {new Date(draft.updatedAt || draft.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="list-actions flex gap-2">
                  <button 
                    type="button"
                    className="btn btn-outline border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => onEditDraft && onEditDraft(draft)}
                  >
                    <FileEdit size={16} /> Lanjutkan Edit
                  </button>
                  
                  <button 
                    type="button"
                    className="btn btn-outline border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setConfirmDeleteId(draft.id)}
                    title="Hapus Draft"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
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
                Apakah Anda yakin ingin menghapus draft kontrak ini?
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
