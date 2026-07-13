import React from 'react';
import { BarChart3, Download, TrendingUp, Users, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function Laporan({ db }) {
  const totalKontrak = db?.kontrak?.length || 0;
  const totalArtis = db?.artis?.length || 0;
  const totalPencipta = db?.pencipta?.length || 0;
  const totalLagu = db?.lagu?.length || 0;
  const handleExportPDF = () => {
    const element = document.getElementById('report-content');
    if (element) {
      const opt = {
        margin:       0.5,
        filename:     'laporan-musiora.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <div className="page-container p-6">
      <div className="page-header flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Laporan & Analitik</h2>
          <p style={{ color: 'var(--text-muted)' }}>Statistik dan performa data kontrak perusahaan.</p>
        </div>
        <button className="btn btn-outline" onClick={handleExportPDF} style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
          <Download size={18} /> Export PDF
        </button>
      </div>

      <div id="report-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <FileText size={24} />
            </div>
          </div>
          <p className="text-white/80 font-medium mb-1">Total Kontrak Tahun Ini</p>
          <h3 className="text-4xl font-bold">{totalKontrak}</h3>
        </div>
        
        <div className="card p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <p className="text-white/80 font-medium mb-1">Total Artis Aktif</p>
          <h3 className="text-4xl font-bold">{totalArtis}</h3>
        </div>

        <div className="card p-5 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <p className="text-white/80 font-medium mb-1">Total Pencipta Aktif</p>
          <h3 className="text-4xl font-bold">{totalPencipta}</h3>
        </div>

        <div className="card p-5 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <BarChart3 size={24} />
            </div>
          </div>
          <p className="text-white/80 font-medium mb-1">Total Aset Lagu</p>
          <h3 className="text-4xl font-bold">{totalLagu}</h3>
        </div>
      </div>

      <div 
        className="card p-8 text-center min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 shadow-none"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(128,128,128,0.1)', color: 'var(--text-muted)' }}
        >
          <BarChart3 size={40} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Modul Grafik Sedang Disiapkan</h3>
        <p className="max-w-md" style={{ color: 'var(--text-muted)' }}>Fitur visualisasi grafik pertumbuhan kontrak akan segera hadir pada pembaruan sistem berikutnya.</p>
      </div>
      </div>
    </div>
  );
}
