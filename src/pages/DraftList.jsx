import React, { useState } from 'react';
import { FileEdit, Trash2, Search, ArrowLeft } from 'lucide-react';

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
                  
                  {confirmDeleteId === draft.id ? (
                    <div className="flex items-center gap-2 bg-red-50 p-1 rounded-md border border-red-100">
                      <span className="text-sm font-medium text-red-600 px-2">Yakin hapus?</span>
                      <button 
                        type="button"
                        className="btn btn-outline border-red-300 text-white bg-red-600 hover:bg-red-700 px-3 py-1"
                        onClick={() => handleDelete(draft.id)}
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
                    <button 
                      type="button"
                      className="btn btn-outline border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setConfirmDeleteId(draft.id)}
                      title="Hapus Draft"
                    >
                      <Trash2 size={16} /> Hapus
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
