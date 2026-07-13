import React, { useState } from 'react';
import { LayoutTemplate, Plus, Search, FileEdit } from 'lucide-react';

export default function TemplateKontrak({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua Kategori');

  const templates = [
    { id: 1, title: 'Kontrak Artis Solo (Eksklusif)', category: 'Artis', used: 45, lastUpdated: '12 Mei 2024' },
    { id: 2, title: 'Kontrak Artis Band / Grup', category: 'Artis', used: 12, lastUpdated: '01 Apr 2024' },
    { id: 3, title: 'Kontrak Pencipta Lagu', category: 'Pencipta', used: 89, lastUpdated: '20 Jun 2024' },
    { id: 4, title: 'Kontrak Endorsement (Sosmed)', category: 'Komersial', used: 34, lastUpdated: '15 Jan 2024' },
  ];

  const filteredTemplates = templates.filter(tpl => {
    const matchSearch = tpl.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'Semua Kategori' || tpl.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="page-container p-6">
      <div className="page-header flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Template Kontrak</h2>
          <p style={{ color: 'var(--text-muted)' }}>Kelola kerangka dasar untuk setiap jenis kontrak.</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate && onNavigate('kontrak')}>
          <Plus size={18} /> Buat Template Baru
        </button>
      </div>

      <div className="card mb-6 p-4 flex gap-4">
        <div className="input-icon-left flex-1">
          <Search size={18} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Cari nama template..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="form-control w-48"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option>Semua Kategori</option>
          <option>Artis</option>
          <option>Pencipta</option>
          <option>Komersial</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map(tpl => (
          <div 
            key={tpl.id} 
            className="card p-4 md:p-5 flex gap-4 md:gap-5 items-center hover:border-primary cursor-pointer transition-colors"
            onClick={() => onNavigate && onNavigate('kontrak')}
          >
            <div 
              className="rounded-lg flex items-center justify-center shrink-0 mobile-icon-64" 
              style={{ width: '64px', height: '64px', minWidth: '64px', backgroundColor: 'rgba(79, 70, 229, 0.15)', color: '#818cf8' }}
            >
              <LayoutTemplate size={28} className="icon-shrink" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] md:text-xs font-bold px-2 py-1 rounded mb-1 md:mb-2 inline-block" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)' }}>{tpl.category}</span>
              <h3 className="font-bold text-base md:text-lg mb-1 leading-tight" style={{ color: 'var(--text-main)' }}>{tpl.title}</h3>
              <p className="text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>Digunakan {tpl.used} kali • Diperbarui {tpl.lastUpdated}</p>
            </div>
            <button className="btn-icon">
              <FileEdit size={20} className="text-gray-400 hover:text-primary" />
            </button>
          </div>
        ))}
        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-8" style={{ color: 'var(--text-muted)' }}>
            Template tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
