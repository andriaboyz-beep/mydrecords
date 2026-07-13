import React, { useState } from 'react';
import { 
  ChevronRight, 
  MoreHorizontal, 
  Search, 
  Star, 
  Play, 
  ArrowUp,
  Info,
  CheckCircle2,
  Music,
  RadioTower,
  ChevronDown
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import './Lagu.css';

const dataGrowth = [
  { name: 'Jan \'26', spotify: 200000, youtube: 1500000, tiktok: 10000, apple: 15000, lainnya: 5000 },
  { name: 'Feb \'26', spotify: 350000, youtube: 2200000, tiktok: 12000, apple: 22000, lainnya: 6500 },
  { name: 'Mar \'26', spotify: 450000, youtube: 2800000, tiktok: 14000, apple: 30000, lainnya: 8000 },
  { name: 'Apr \'26', spotify: 600000, youtube: 3500000, tiktok: 16000, apple: 45000, lainnya: 12000 },
  { name: 'Mei \'26', spotify: 850000, youtube: 4200000, tiktok: 18000, apple: 60000, lainnya: 18000 },
  { name: 'Jun \'26', spotify: 1000000, youtube: 4900000, tiktok: 20000, apple: 75000, lainnya: 25000 },
  { name: 'Jul \'26', spotify: 1245890, youtube: 5780430, tiktok: 21563, apple: 82300, lainnya: 31623 },
];

const sourceData = [
  { name: 'Spotify', value: 48, color: '#1DB954' },
  { name: 'YouTube', value: 32, color: '#FF0000' },
  { name: 'TikTok', value: 12, color: '#0F172A' },
  { name: 'Apple Music', value: 5, color: '#FA243C' },
  { name: 'Lainnya', value: 3, color: '#94A3B8' },
];

const ageData = [
  { name: '18 - 24 Tahun', value: 55, color: '#6366F1' },
  { name: '25 - 34 Tahun', value: 30, color: '#A855F7' },
  { name: '35+ Tahun', value: 15, color: '#F43F5E' },
];

const sparklineData = (base) => Array.from({length: 10}, () => ({ value: base + Math.random() * (base * 0.5) }));

export default function Lagu({ db }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredArtists = db?.artis?.filter(a => 
    (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.alias || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="lagu-container">
      
      {/* Top Breadcrumb & Actions */}
      <div className="lagu-breadcrumb-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="lagu-breadcrumb" style={{ margin: 0 }}>
            <span>Hasil Pencarian</span>
          </div>
          
          {/* Input Pencarian Artis */}
          <div style={{ position: 'relative' }}>
            <div className="lagu-btn-outline" style={{ display: 'flex', alignItems: 'center', height: '32px', backgroundColor: '#FFFFFF', padding: '0 12px', color: '#475569', borderColor: '#E2E8F0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', gap: '8px' }}>
              <Search size={14} style={{ color: '#94A3B8' }} />
              <input 
                type="text" 
                placeholder="Cari Artis" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '12px', fontWeight: '500', color: '#475569', width: '120px' }} 
              />
            </div>
            
            {/* Dropdown Hasil */}
            {isDropdownOpen && searchQuery && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', width: '250px', zIndex: 50, maxHeight: '200px', overflowY: 'auto' }}>
                {filteredArtists.length > 0 ? (
                  filteredArtists.map(art => (
                    <div 
                      key={art.id} 
                      style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9' }}
                      onClick={() => {
                        setSelectedArtist(art);
                        setSearchQuery('');
                        setIsDropdownOpen(false);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <img src={art.fotoProfile || `https://ui-avatars.com/api/?name=${art.alias || art.name}&background=fce7f3&color=db2777`} alt={art.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{art.name}</span>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>{art.alias || 'Artis'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>Tidak ada artis ditemukan</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div></div>
      </div>

      {/* Header Profile Section */}
      <div className="lagu-card lagu-header">
        <img 
          src={selectedArtist?.fotoProfile || "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=250&auto=format&fit=crop"} 
          alt="Barang Bere Cover" 
          className="lagu-header-img"
        />
        <div className="lagu-header-info">
          <div className="lagu-header-top">
            <div>
              <div className="lagu-title-wrapper">
                <h1 className="lagu-title">Barang Bere</h1>
              </div>
              <p className="lagu-subtitle">
                {selectedArtist ? (selectedArtist.alias || selectedArtist.name) : 'Adi Bewok'} 
                <span className="lagu-badge-active">Active</span>
              </p>
              
              <div className="lagu-tags">
                <span className="lagu-tag">Dangdut Sunda</span>
                <span className="lagu-tag">MYD Records</span>
              </div>
            </div>
            
            <div className="lagu-header-actions">
              <button className="lagu-btn-outline">
                Lihat Detail
              </button>
              <button className="lagu-btn-primary">
                + Tambah ke List
              </button>
            </div>
          </div>
          
          <div className="lagu-header-meta">
            <div className="lagu-meta-item">
              <p className="lagu-meta-label">ISRC</p>
              <p className="lagu-meta-val">ID-MYD-26-00123</p>
            </div>
            <div className="lagu-meta-item">
              <p className="lagu-meta-label">Tanggal Rilis</p>
              <p className="lagu-meta-val">1 Juli 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="lagu-metrics-grid">
        {[
          { platform: 'Spotify', iconOnly: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', label: 'Streams', value: '1.24M', growth: '235%', color: '#1DB954', iconBg: '#1DB954', invert: false },
          { platform: 'YouTube', iconOnly: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg', label: 'Views', value: '5.78M', growth: '187%', color: '#10B981', iconBg: '#FF0000', invert: true },
          { platform: 'TikTok', iconOnly: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg', label: 'Videos', value: '21.6K', growth: '312%', color: '#10B981', iconBg: '#000000', invert: true },
          { platform: 'Apple Music', iconOnly: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', label: 'Streams', value: '82.3K', growth: '98%', color: '#10B981', iconBg: '#FA243C', invert: true },
          { platform: 'Joox', iconOnly: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Joox_logo.svg/512px-Joox_logo.svg.png', label: 'Streams', value: '31.2K', growth: '76%', color: '#10B981', iconBg: '#1EC942', invert: true },
          { platform: 'Radio', isLucide: true, label: 'Plays', value: '423', growth: '45%', color: '#10B981', iconBg: '#F8FAFC' }
        ].map((metric, i) => (
          <div key={i} className="lagu-metric-card">
            <div className="lagu-metric-header">
              <div className="lagu-metric-icon" style={{ backgroundColor: metric.iconBg }}>
                 {metric.isLucide ? 
                   <RadioTower size={16} className="text-indigo-500" style={{ color: '#6366F1' }} /> :
                   <img src={metric.iconOnly} alt={metric.platform} className={metric.invert ? 'invert brightness-0' : ''} style={metric.invert ? { filter: 'brightness(0) invert(1)' } : {}} />
                 }
              </div>
              <div>
                <p className="lagu-metric-name">{metric.platform}</p>
                <p className="lagu-metric-sub">{metric.label}</p>
              </div>
            </div>
            <div>
              <h3 className="lagu-metric-val">{metric.value}</h3>
              <p className="lagu-metric-growth positive">
                <ArrowUp size={12} strokeWidth={3} /> {metric.growth}
              </p>
              <p className="lagu-metric-vs">vs 30 hari lalu</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Insights */}
      <div className="lagu-middle-layout">
        
        {/* Line Chart */}
        <div className="lagu-card">
          <div className="lagu-chart-header">
            <h3 className="lagu-section-title">
              Grafik Pertumbuhan
              <Info className="lagu-info-icon" />
            </h3>
            <select className="lagu-select">
              <option>6 Bulan Terakhir</option>
            </select>
          </div>
          
          <div className="lagu-legend">
            <span className="lagu-legend-item"><div className="lagu-legend-dot" style={{ background: '#6366F1' }}></div> Total Streams</span>
            <span className="lagu-legend-item"><div className="lagu-legend-dot" style={{ background: '#EF4444' }}></div> YouTube Views</span>
            <span className="lagu-legend-item"><div className="lagu-legend-dot" style={{ background: '#0F172A' }}></div> TikTok Videos</span>
            <span className="lagu-legend-item"><div className="lagu-legend-dot" style={{ background: '#F43F5E' }}></div> Apple Music</span>
            <span className="lagu-legend-item"><div className="lagu-legend-dot" style={{ background: '#94A3B8' }}></div> Lainnya</span>
          </div>

          <div className="lagu-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataGrowth} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${value / 1000}K`} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#1E293B', fontSize: '11px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '500', padding: '2px 0' }}
                  labelStyle={{ color: '#64748B', marginBottom: '8px', fontSize: '11px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}
                />
                <Line type="monotone" dataKey="youtube" name="YouTube Views" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#EF4444', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="spotify" name="Total Streams" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#6366F1', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="tiktok" name="TikTok Videos" stroke="#0F172A" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="apple" name="Apple Music" stroke="#F43F5E" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="lainnya" name="Lainnya" stroke="#94A3B8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insight Panel */}
        <div className="lagu-card lagu-insight-panel">
          <h3 className="lagu-section-title">Ringkasan</h3>

          {/* Trending Score */}
          <div className="lagu-score-container">
            <div className="lagu-score-circle">
              <div className="lagu-score-inner">
                <span className="lagu-score-val">92</span>
                <span className="lagu-score-sub">/100</span>
              </div>
            </div>
            <div className="lagu-score-details">
              <p className="lagu-score-label">Trending Score</p>
              <p className="lagu-score-status">Sangat Tinggi 🔥</p>
              <p className="lagu-score-growth"><ArrowUp size={14} strokeWidth={3}/> +235%</p>
              <p className="lagu-score-desc">Pertumbuhan<br/>vs 30 hari lalu</p>
            </div>
          </div>

          <div className="lagu-divider"></div>

          {/* Top Countries */}
          <div>
            <h4 className="lagu-section-title" style={{ fontSize: '13px', marginBottom: '12px' }}>Negara Teratas</h4>
            <div className="lagu-countries-layout">
              <div className="lagu-list">
                <div className="lagu-list-item"><span className="lagu-list-name">1. Indonesia</span> <span className="lagu-list-val">68%</span></div>
                <div className="lagu-list-item"><span className="lagu-list-name">2. Malaysia</span> <span className="lagu-list-val">12%</span></div>
                <div className="lagu-list-item"><span className="lagu-list-name">3. Taiwan</span> <span className="lagu-list-val">6%</span></div>
                <div className="lagu-list-item"><span className="lagu-list-name">4. Singapura</span> <span className="lagu-list-val">4%</span></div>
                <div className="lagu-list-item"><span className="lagu-list-name">5. Lainnya</span> <span className="lagu-list-val">10%</span></div>
              </div>
              <div className="lagu-map-placeholder">
                 <svg viewBox="0 0 100 100" className="w-full h-full fill-[#38BDF8]">
                    <path d="M40,50 Q45,45 50,55 T60,60 T70,50 Q75,45 80,55 T85,65 T75,70 Q70,75 60,65 T50,70 T40,60 Q35,55 40,50 Z" opacity="0.6" fill="#38BDF8" />
                    <circle cx="45" cy="52" r="2.5" fill="#FFFFFF" />
                    <circle cx="55" cy="58" r="2" fill="#FFFFFF" />
                    <circle cx="65" cy="55" r="1.5" fill="#FFFFFF" />
                 </svg>
              </div>
            </div>
          </div>
          
          <div className="lagu-divider"></div>

          {/* Age Demographics */}
          <div>
            <h4 className="lagu-section-title" style={{ fontSize: '13px', marginBottom: '12px' }}>Usia Pendengar</h4>
            <div className="lagu-age-layout">
              <div className="lagu-donut-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ageData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} stroke="none" dataKey="value">
                      {ageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="lagu-list">
                {ageData.map((item, i) => (
                   <div key={i} className="lagu-list-item">
                     <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }}></span> {item.name}</span>
                     <span className="lagu-list-val">{item.value}%</span>
                   </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="lagu-bottom-layout">
        
        {/* Source Breakdown */}
        <div className="lagu-card">
          <h3 className="lagu-section-title" style={{ marginBottom: '24px' }}>Sumber Streams</h3>
          <div className="lagu-source-layout">
            <div className="lagu-source-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} stroke="none" dataKey="value">
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="lagu-donut-inner">
                <span className="lagu-donut-val">2.35M</span>
                <span className="lagu-donut-lbl">Total</span>
              </div>
            </div>
            <div className="lagu-list" style={{ flex: 1, width: '100%' }}>
              {sourceData.map((item, i) => (
                 <div key={i} className="lagu-list-item">
                   <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                     <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }}></span> {item.name}
                   </span>
                   <span className="lagu-list-val">{item.value}%</span>
                 </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Playlists */}
        <div className="lagu-card">
          <div className="lagu-chart-header" style={{ marginBottom: '16px' }}>
            <h3 className="lagu-section-title">Top Playlist (Spotify)</h3>
            <button className="lagu-header-link">Lihat Semua</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'Dangdut Viral Indonesia', followers: '1.245.890', img: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=150&auto=format&fit=crop' },
              { name: 'Koplo Hits 2026', followers: '892.300', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=150&auto=format&fit=crop' },
              { name: 'Sunda Populer', followers: '456.780', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=150&auto=format&fit=crop' },
              { name: 'FYP Dangdut Mix', followers: '335.210', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=150&auto=format&fit=crop' }
            ].map((pl, i) => (
              <div key={i} className="lagu-playlist-item">
                <div className="lagu-playlist-info">
                  <img src={pl.img} alt={pl.name} className="lagu-playlist-img" />
                  <div className="lagu-playlist-text">
                    <p className="lagu-playlist-name">{pl.name}</p>
                    <p className="lagu-playlist-followers">{pl.followers} followers</p>
                  </div>
                </div>
                <button className="lagu-play-btn">
                  <Play size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lagu-card">
           <div className="lagu-chart-header" style={{ marginBottom: '16px' }}>
            <h3 className="lagu-section-title">Aktivitas Terbaru</h3>
            <button className="lagu-header-link">Lihat Semua ❯</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="lagu-activity-item">
              <div className="lagu-activity-icon" style={{ backgroundColor: '#DCFCE7' }}>
                 <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="s" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(58%) sepia(85%) saturate(3015%) hue-rotate(113deg) brightness(97%) contrast(92%)' }} />
              </div>
              <div className="lagu-activity-text">
                <p className="lagu-activity-time">10 Jul 2026 • 10:30</p>
                <p className="lagu-activity-title" style={{ color: '#10B981' }}>+125.000 Spotify Streams</p>
                <p className="lagu-activity-desc">Total harian tertinggi baru</p>
              </div>
            </div>
            
            <div className="lagu-activity-item">
              <div className="lagu-activity-icon" style={{ backgroundColor: '#FEE2E2' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="y" className="w-5 h-5" />
              </div>
              <div className="lagu-activity-text">
                <p className="lagu-activity-time">09 Jul 2026 • 18:45</p>
                <p className="lagu-activity-title" style={{ color: '#0F172A' }}>YouTube mencapai 5 juta views</p>
                <p className="lagu-activity-desc">Terima kasih untuk semua support!</p>
              </div>
            </div>

            <div className="lagu-activity-item">
              <div className="lagu-activity-icon" style={{ backgroundColor: '#F1F5F9' }}>
                 <img src="https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg" alt="t" className="w-5 h-5" />
              </div>
              <div className="lagu-activity-text">
                <p className="lagu-activity-time">08 Jul 2026 • 16:20</p>
                <p className="lagu-activity-title" style={{ color: '#10B981' }}>+1.200 video TikTok baru</p>
                <p className="lagu-activity-desc">Menggunakan lagu ini</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Platform Detail Table */}
      <div className="lagu-card">
        <h3 className="lagu-section-title" style={{ marginBottom: '24px' }}>
          Performa per Platform
          <Info className="lagu-info-icon" />
        </h3>
        
        <div className="lagu-table-container">
          <table className="lagu-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Total</th>
                <th>Perubahan (30 Hari)</th>
                <th>Grafik</th>
                <th>Negara Teratas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[
                { platform: 'Spotify', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', color: '#6366F1', total: '1.245.890', change: '+235%', flags: ['🇮🇩 68%', '🇲🇾 12%', '🇹🇼 6%'], filter: 'brightness(0) saturate(100%) invert(58%) sepia(85%) saturate(3015%) hue-rotate(113deg) brightness(97%) contrast(92%)' },
                { platform: 'YouTube', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg', color: '#EF4444', total: '5.780.430', change: '+187%', flags: ['🇮🇩 70%', '🇲🇾 11%', '🇸🇬 5%'], filter: 'none' },
                { platform: 'TikTok', icon: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg', color: '#0F172A', total: '21.563', change: '+312%', flags: ['🇮🇩 65%', '🇲🇾 10%', '🇵🇭 6%'], filter: 'none' },
                { platform: 'Apple Music', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', color: '#F43F5E', total: '82.300', change: '+98%', flags: ['🇮🇩 60%', '🇺🇸 10%', '🇯🇵 7%'], filter: 'none' },
                { platform: 'Joox', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Joox_logo.svg/512px-Joox_logo.svg.png', color: '#10B981', total: '31.200', change: '+76%', flags: ['🇮🇩 72%', '🇲🇾 9%', '🇸🇬 6%'], filter: 'none' },
              ].map((row, i) => (
                <tr key={i}>
                  <td>
                    <div className="lagu-platform-cell">
                      <div className="lagu-platform-icon">
                         <img src={row.icon} alt={row.platform} style={{ filter: row.filter }} />
                      </div>
                      <span className="lagu-platform-name">{row.platform}</span>
                    </div>
                  </td>
                  <td><span className="lagu-table-total">{row.total}</span></td>
                  <td>
                     <span className="lagu-table-change">
                        <ArrowUp size={14} strokeWidth={3} /> {row.change}
                     </span>
                  </td>
                  <td>
                    <div style={{ width: '80px', height: '24px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={sparklineData(i * 10 + 10)}>
                           <Line type="monotone" dataKey="value" stroke={row.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                         </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                  <td>
                    <div className="lagu-table-flags">
                      {row.flags.map((f, j) => <span key={j}>{f}</span>)}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <ChevronRight size={16} className="lagu-table-chevron" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lagu-footer-btn">
          <button>Lihat Semua Platform ∨</button>
        </div>
      </div>
      
    </div>
  );
}
