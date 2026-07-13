import React from 'react';
import { Bell, Calendar, Clock, AlertTriangle } from 'lucide-react';

export default function Pengingat({ db }) {
  const dummyReminders = [
    { id: 'd1', title: 'Jadwal Pembayaran Royalti Q2', date: 'Minggu Depan', desc: 'Siapkan laporan dan pembayaran royalti untuk 45 artis.', status: 'warning' },
    { id: 'd2', title: 'Perpanjangan Kontrak Publisher', date: 'Dalam 60 Hari', desc: 'Kontrak dengan PT. Nada Nusantara perlu dinegosiasikan ulang.', status: 'info' },
  ];

  const dynamicReminders = (db?.kontrak || []).map((k, idx) => ({
    id: `dyn-${idx}`,
    title: `Kontrak Baru: ${k.pihak2_panggung || k.pihak2_nama}`,
    date: 'Baru Saja',
    desc: `Kontrak ${k.nomorKontrak} berhasil dibuat dan disimpan.`,
    status: 'info'
  }));

  const reminders = [...dynamicReminders, ...dummyReminders];

  return (
    <div className="page-container p-6">
      <div className="page-header flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pengingat (Reminders)</h2>
          <p className="text-gray-500">Jangan lewatkan tenggat waktu dan perpanjangan kontrak.</p>
        </div>
        <button className="btn btn-primary">
          <Bell size={18} /> Buat Pengingat Manual
        </button>
      </div>

      <div className="card max-w-4xl mx-auto p-0 overflow-hidden">
        <div className="border-b p-4 font-semibold flex items-center gap-2" style={{ borderColor: 'var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)', color: 'var(--text-main)' }}>
          <Calendar size={18} className="text-indigo-500" /> Agenda Mendatang
        </div>
        
        <div className="p-2">
          {reminders.map(rem => (
            <div key={rem.id} className="flex gap-4 p-4 transition-colors border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
              <div className="shrink-0 mt-1">
                {rem.status === 'urgent' && <AlertTriangle size={24} className="text-red-500" />}
                {rem.status === 'warning' && <Clock size={24} className="text-amber-500" />}
                {rem.status === 'info' && <Bell size={24} className="text-blue-500" />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold" style={{ color: 'var(--text-main)' }}>{rem.title}</h4>
                  <span 
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: rem.status === 'urgent' ? 'rgba(239, 68, 68, 0.15)' :
                                       rem.status === 'warning' ? 'rgba(245, 158, 11, 0.15)' :
                                       'rgba(59, 130, 246, 0.15)',
                      color: rem.status === 'urgent' ? '#f87171' :
                             rem.status === 'warning' ? '#fbbf24' :
                             '#60a5fa'
                    }}
                  >
                    {rem.date}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{rem.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
