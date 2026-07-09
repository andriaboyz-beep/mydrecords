import React, { useRef, useEffect } from 'react';
import { ArrowLeft, Printer, Download, CheckCircle2, Save, Pen } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const Pasal = ({ num, title }) => (
  <div className="mb-6 mt-8 break-before-auto" style={{ textAlign: 'center' }}>
    <h2 className="font-bold text-[11pt]">PASAL {num}</h2>
    <h2 className="font-bold text-[11pt]">{title}</h2>
  </div>
);

const LItem = ({ num, children }) => (
  <div className="flex gap-2 mb-3 items-start">
    <div className="font-bold shrink-0 w-6">{num})</div>
    <div className="text-justify leading-relaxed flex-1">{children}</div>
  </div>
);

const SubItem = ({ letter, children }) => (
  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', paddingLeft: '16px' }}>
    <div style={{ width: '20px', flexShrink: 0 }}>{letter}.</div>
    <div>{children}</div>
  </div>
);

const SignHint = () => (
  <div style={{ 
    height: '64px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: 'rgba(255, 0, 0, 0.4)', 
    userSelect: 'none'
  }}>
    <Pen size={20} />
  </div>
);

export default function PreviewKontrak({ onBack, contractData = {}, db, setDb, user, isModal = false }) {
  const documentRef = useRef();

  useEffect(() => {
    if (contractData?.autoDownload) {
      setTimeout(() => {
        handleDownloadPDF();
      }, 500);
    }
  }, [contractData?.autoDownload]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = documentRef.current;
    
    const getBase64Image = async (url) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error('Failed to load image', e);
        return null;
      }
    };
    
    const logoBase64 = await getBase64Image('/logo.png');

    const opt = {
      margin:       [0, 0, 0, 0],
      filename:     `Kontrak_${contractData?.jenisKontrak === 'pencipta' ? 'Pencipta' : 'Artis'}_${contractData?.pihak2_nama || 'Draft'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        if (i === 1) {
          pdf.setFont(undefined, 'italic');
          pdf.setFontSize(7);
          pdf.setTextColor(200);
          const headerText = contractData?.jenisKontrak === 'pencipta' 
            ? `kontrak pencipta lagu ${contractData?.pihak1_perusahaan || 'MYD RECORDS INDONESIA'}`
            : `kontrak artis/penyanyi ${contractData?.pihak1_perusahaan || 'MYD RECORDS INDONESIA'}`;
          pdf.text(headerText.toUpperCase(), 190, 15, { align: 'right' });
          pdf.setFont(undefined, 'normal');
        }

      }
    }).save();
  };

  const handleSimpanKontrak = () => {
    const contractId = contractData.id || Date.now().toString();
    const newContract = {
      ...contractData,
      id: contractId,
      createdBy: contractData.createdBy || user?.id,
      status: 'Aktif',
      createdAt: contractData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setDb(prev => {
      const exists = prev.kontrak.find(k => k.id === contractId);
      if (exists) {
        return {
          ...prev,
          kontrak: prev.kontrak.map(k => k.id === contractId ? newContract : k)
        };
      }
      return {
        ...prev,
        kontrak: [...prev.kontrak, newContract]
      };
    });
    alert('Kontrak berhasil disimpan dan diaktifkan!');
    if (onBack) onBack('dashboard'); // Optional: navigate to dashboard after saving
  };

  return (
    <div className={isModal ? "" : "preview-layout"}>
      {/* Top Toolbar (Hidden during print) */}
      {!isModal && (
        <div className="preview-toolbar no-print">
          <div className="flex items-center gap-4">
            <button className="btn-ghost" onClick={onBack}>
              <ArrowLeft size={20} />
              <span className="font-medium">Kembali Edit</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium">Draft Kontrak: {contractData?.nomorKontrak || 'KONTRAK/ARTIS/2024/0007'}</span>
            <span className="px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-700 flex items-center gap-1">
              <CheckCircle2 size={12} /> Siap Dicetak
            </span>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-outline flex items-center gap-2" onClick={handleDownloadPDF}>
              <Download size={16} /> Download PDF
            </button>
            <button className="btn btn-outline flex items-center gap-2" onClick={handlePrint}>
              <Printer size={16} /> Cetak
            </button>
            <button className="btn btn-primary flex items-center gap-2" onClick={handleSimpanKontrak}>
              <Save size={16} /> Simpan Kontrak
            </button>
          </div>
        </div>
      )}

      {/* Document Area */}
      <div className={isModal ? "preview-workspace modal-preview-workspace" : "preview-workspace"} style={isModal ? { padding: '0', backgroundColor: 'transparent' } : { padding: '20px', backgroundColor: 'var(--bg-sidebar-hover)' }}>
        <div 
          className="document-a4 bg-white shadow-xl mx-auto relative" 
          style={{ width: '210mm', minHeight: '297mm', padding: '30mm 20mm 30mm 20mm', boxSizing: 'border-box', position: 'relative' }}
        >
          {/* Fake Visual Header for Web View only (Ignored in PDF because we inject it via jsPDF) */}
          <div data-html2canvas-ignore="true" style={{ position: 'absolute', top: '15mm', right: '20mm', fontSize: '7pt', color: '#ccc', fontStyle: 'italic' }}>
            {contractData?.jenisKontrak === 'pencipta' 
              ? `KONTRAK PENCIPTA LAGU ${contractData?.pihak1_perusahaan || 'MYD RECORDS INDONESIA'}`.toUpperCase()
              : `KONTRAK ARTIS/PENYANYI ${contractData?.pihak1_perusahaan || 'MYD RECORDS INDONESIA'}`.toUpperCase()
            }
          </div>

          <div ref={documentRef} className="doc-content text-[11pt] font-sans text-black">
            {contractData?.jenisKontrak === 'pencipta' ? (
              <>
                <h1 
                  className="text-center font-black mb-2 leading-tight" 
                  style={{ textAlign: 'center', fontSize: '20pt', fontWeight: 900 }}
                >
                  PERJANJIAN KERJA SAMA PENCIPTA LAGU
                </h1>
                <h2 
                  className="text-center font-bold mb-2 leading-tight text-[12pt]" 
                  style={{ textAlign: 'center', fontWeight: 700 }}
                >
                  {contractData?.pihak1_perusahaan || 'MUSIORA'}
                </h2>
                
                <div className="text-center mb-8" style={{ textAlign: 'center' }}>
                  <span className="font-bold text-[11pt]" style={{ fontWeight: 700 }}>
                    Nomor : {contractData?.nomorKontrak || '____/PKS-MYD/____/20__'}
                  </span>
                </div>

                <p className="text-justify leading-relaxed mb-4">
                  Pada hari ini <strong>{contractData?.hariTerbilang || '__________'}</strong> tanggal <strong>{contractData?.tanggalTerbilang || '____'}</strong> bulan <strong>{contractData?.bulanTerbilang || '__________'}</strong> tahun <strong>{contractData?.tahunTerbilang || '________'}</strong>, bertempat di <strong>{contractData?.tempatTtd || 'Tasikmalaya'}</strong>, telah dibuat dan disepakati Perjanjian Kerja Sama Pencipta Lagu antara:
                </p>

                <h3 className="font-bold text-[12pt] mt-6 mb-2">PIHAK PERTAMA</h3>
                <p className="font-bold mb-2">{contractData?.pihak1_perusahaan || 'MUSIORA'}</p>
                <table className="mb-4" style={{ width: '100%', lineHeight: '1.6' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '120px', verticalAlign: 'top' }}>Alamat</td>
                      <td style={{ width: '15px', verticalAlign: 'top' }}>:</td>
                      <td style={{ verticalAlign: 'top' }}>{contractData?.pihak1_alamat || '__________________________________________'}</td>
                    </tr>
                    <tr>
                      <td style={{ verticalAlign: 'top' }}>Diwakili oleh</td>
                      <td style={{ verticalAlign: 'top' }}>:</td>
                      <td style={{ verticalAlign: 'top' }}><strong>{contractData?.pihak1_wakil || '_____________________________________'}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ verticalAlign: 'top' }}>Jabatan</td>
                      <td style={{ verticalAlign: 'top' }}>:</td>
                      <td style={{ verticalAlign: 'top' }}><strong>{contractData?.pihak1_jabatan || '__________________________________________'}</strong></td>
                    </tr>
                  </tbody>
                </table>
                <p className="mb-6">Selanjutnya disebut <strong>"LABEL"</strong> atau <strong>PIHAK PERTAMA</strong>.</p>

                <h3 className="font-bold text-[12pt] mt-6 mb-2">PIHAK KEDUA</h3>
                <table className="mb-4" style={{ width: '100%', lineHeight: '1.6' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '120px', verticalAlign: 'top' }}>Nama</td>
                      <td style={{ width: '15px', verticalAlign: 'top' }}>:</td>
                      <td style={{ verticalAlign: 'top' }}><strong>{contractData?.pihak2_nama || '____________________________________________'}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ verticalAlign: 'top' }}>NIK</td>
                      <td style={{ verticalAlign: 'top' }}>:</td>
                      <td style={{ verticalAlign: 'top' }}>{contractData?.pihak2_ktp || '______________________________________________'}</td>
                    </tr>
                    <tr>
                      <td style={{ verticalAlign: 'top' }}>Alamat</td>
                      <td style={{ verticalAlign: 'top' }}>:</td>
                      <td style={{ verticalAlign: 'top' }}>{contractData?.pihak2_alamat || '___________________________________________'}</td>
                    </tr>
                    <tr>
                      <td style={{ verticalAlign: 'top' }}>No. HP</td>
                      <td style={{ verticalAlign: 'top' }}>:</td>
                      <td style={{ verticalAlign: 'top' }}>{contractData?.pihak2_hp || '___________________________________________'}</td>
                    </tr>
                    <tr>
                      <td style={{ verticalAlign: 'top' }}>Email</td>
                      <td style={{ verticalAlign: 'top' }}>:</td>
                      <td style={{ verticalAlign: 'top' }}>{contractData?.pihak2_email || '____________________________________________'}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="mb-6">Selanjutnya disebut <strong>"PENCIPTA LAGU"</strong> atau <strong>PIHAK KEDUA</strong>.</p>

                <p className="text-justify leading-relaxed mb-6">
                  Kedua belah pihak sepakat mengikatkan diri dalam perjanjian dengan ketentuan sebagai berikut.
                </p>

                <div className="doc-clauses">
                  <Pasal num="1" title="DEFINISI" />
                  <p className="mb-3">Yang dimaksud dengan:</p>
                  <LItem num="1">Lagu adalah seluruh karya musik beserta lirik maupun instrumental.</LItem>
                  <LItem num="2">Master Recording adalah hasil rekaman final.</LItem>
                  <LItem num="3">Royalti adalah pendapatan bersih (Net Revenue) yang diterima LABEL setelah dikurangi biaya yang diperjanjikan.</LItem>
                  <LItem num="4">Platform Digital meliputi seluruh layanan streaming, download, media sosial, UGC (User Generated Content), RBT, dan media distribusi lainnya.</LItem>

                  <Pasal num="2" title="OBJEK PERJANJIAN" />
                  <p className="mb-3">PIHAK KEDUA menyerahkan lagu berjudul:</p>
                  <table className="mb-4 ml-6" style={{ width: '100%', lineHeight: '1.6' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '150px' }}>Judul</td>
                        <td style={{ width: '15px' }}>:</td>
                        <td><strong>{contractData?.lagu_judul || '__________________________'}</strong></td>
                      </tr>
                      <tr>
                        <td>Genre</td>
                        <td>:</td>
                        <td>{contractData?.lagu_genre || '__________________________'}</td>
                      </tr>
                      <tr>
                        <td>Durasi</td>
                        <td>:</td>
                        <td>{contractData?.lagu_durasi || '_________________________'}</td>
                      </tr>
                      <tr>
                        <td>Tanggal Penyerahan</td>
                        <td>:</td>
                        <td>{contractData?.lagu_tanggalPenyerahan || '_______________'}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-justify leading-relaxed mb-4">Lagu tersebut dinyatakan sebagai karya asli milik PIHAK KEDUA.</p>

                  <Pasal num="3" title="PEMBERIAN LISENSI EKSKLUSIF" />
                  <p className="text-justify leading-relaxed mb-3">
                    PIHAK KEDUA memberikan kepada LABEL hak eksklusif untuk:
                  </p>
                  <ul className="list-disc ml-8 mb-4 space-y-1">
                    <li>Produksi.</li>
                    <li>Rekaman.</li>
                    <li>Mixing.</li>
                    <li>Mastering.</li>
                    <li>Distribusi.</li>
                    <li>Penjualan.</li>
                    <li>Promosi.</li>
                    <li>Publikasi.</li>
                    <li>Sinkronisasi.</li>
                    <li>Digitalisasi.</li>
                    <li>Monetisasi.</li>
                    <li>Lisensi kepada pihak ketiga.</li>
                  </ul>
                  <p className="text-justify leading-relaxed mb-4">Hak tersebut berlaku di seluruh dunia selama masa perjanjian.</p>

                  <Pasal num="4" title="HAK LABEL" />
                  <p className="mb-3">LABEL berhak:</p>
                  <LItem num="1">Menentukan tanggal rilis.</LItem>
                  <LItem num="2">Menentukan distributor.</LItem>
                  <LItem num="3">Menentukan artwork.</LItem>
                  <LItem num="4">Menentukan harga.</LItem>
                  <LItem num="5">Mengedit metadata.</LItem>
                  <LItem num="6">Menentukan strategi promosi.</LItem>
                  <LItem num="7">Menggunakan lagu sebagai materi iklan.</LItem>
                  <LItem num="8">Mengunggah ke seluruh platform digital.</LItem>
                  <LItem num="9">Memberikan lisensi kepada pihak ketiga.</LItem>
                  <LItem num="10">Membuat versi edit, radio edit, karaoke, instrumental, live version, remix, Dolby Atmos, dan format lainnya.</LItem>

                  <Pasal num="5" title="BIAYA PRODUKSI" />
                  <p className="text-justify leading-relaxed mb-3">
                    Seluruh biaya yang dikeluarkan LABEL meliputi:
                  </p>
                  <ul className="list-disc ml-8 mb-4 space-y-1">
                    <li>Recording</li>
                    <li>Studio</li>
                    <li>Mixing</li>
                    <li>Mastering</li>
                    <li>Video Klip</li>
                    <li>Foto</li>
                    <li>Artwork</li>
                    <li>Iklan</li>
                    <li>Digital Marketing</li>
                    <li>Distribusi</li>
                    <li>Pajak</li>
                    <li>Administrasi</li>
                    <li>Honor Session Player</li>
                    <li>Transportasi</li>
                    <li>Konsumsi</li>
                    <li>Biaya lain yang berhubungan dengan proyek</li>
                  </ul>
                  <p className="text-justify leading-relaxed mb-4">menjadi biaya produksi yang dapat diperhitungkan sebelum pembagian royalti.</p>

                  <Pasal num="6" title="PEMBAGIAN ROYALTI" />
                  <LItem num="1">Seluruh pendapatan yang diterima LABEL terlebih dahulu digunakan untuk menutup seluruh biaya produksi.</LItem>
                  <LItem num="2">
                    Setelah seluruh biaya tertutup, pembagian pendapatan bersih adalah:
                    <div className="font-bold my-2 ml-4">
                      <p>MUSIORA : {contractData?.persentaseLabel || 90}%</p>
                      <p>PENCIPTA LAGU : {contractData?.persentasePihakKedua || 10}%</p>
                    </div>
                  </LItem>
                  <LItem num="3">Pembayaran dilakukan setiap 6 bulan apabila saldo royalti minimal Rp500.000.</LItem>

                  <Pasal num="7" title="HAK PRIORITAS" />
                  <LItem num="1">Selama kontrak berlangsung dan 2 (dua) tahun setelah berakhirnya kontrak, setiap karya baru PIHAK KEDUA wajib ditawarkan terlebih dahulu kepada LABEL.</LItem>
                  <LItem num="2">LABEL mempunyai waktu 30 hari kerja untuk menerima atau menolak.</LItem>

                  <Pasal num="8" title="LARANGAN" />
                  <p className="mb-3">PIHAK KEDUA dilarang:</p>
                  <ul className="list-disc ml-8 mb-4 space-y-1">
                    <li>Menjual lagu kepada pihak lain.</li>
                    <li>Mengunggah sendiri ke platform digital.</li>
                    <li>Memberikan lisensi kepada pihak lain.</li>
                    <li>Menghapus distribusi tanpa izin LABEL.</li>
                    <li>Mengubah metadata tanpa persetujuan LABEL.</li>
                    <li>Menyerahkan karya yang sama kepada label lain.</li>
                  </ul>

                  <Pasal num="9" title="JAMINAN" />
                  <p className="mb-3">PIHAK KEDUA menjamin bahwa:</p>
                  <ul className="list-disc ml-8 mb-4 space-y-1">
                    <li>Lagu merupakan karya asli.</li>
                    <li>Tidak sedang disengketakan.</li>
                    <li>Tidak melanggar Hak Kekayaan Intelektual pihak lain.</li>
                  </ul>
                  <p className="text-justify leading-relaxed mb-4">Apabila di kemudian hari muncul gugatan, PIHAK KEDUA bertanggung jawab sepenuhnya dan membebaskan LABEL dari segala tuntutan.</p>

                  <Pasal num="10" title="KERAHASIAAN" />
                  <LItem num="1">Seluruh isi kontrak, data keuangan, strategi promosi, laporan royalti, maupun dokumen LABEL bersifat rahasia.</LItem>
                  <LItem num="2">Larangan ini tetap berlaku selama 5 (lima) tahun setelah kontrak berakhir.</LItem>

                  <Pasal num="11" title="FORCE MAJEURE" />
                  <p className="text-justify leading-relaxed mb-4">Keadaan kahar meliputi bencana alam, perang, pandemi, kebijakan pemerintah, gangguan sistem digital, maupun keadaan lain di luar kemampuan para pihak.</p>

                  <Pasal num="12" title="PEMUTUSAN" />
                  <p className="mb-3">LABEL dapat mengakhiri kontrak apabila:</p>
                  <ul className="list-disc ml-8 mb-4 space-y-1">
                    <li>PIHAK KEDUA melanggar isi kontrak.</li>
                    <li>Memberikan data palsu.</li>
                    <li>Lagu terbukti hasil plagiarisme.</li>
                    <li>Melakukan tindakan yang merugikan nama baik LABEL.</li>
                  </ul>

                  <Pasal num="13" title="GANTI RUGI" />
                  <p className="text-justify leading-relaxed mb-4">Apabila PIHAK KEDUA melanggar kontrak sehingga menimbulkan kerugian bagi LABEL, maka PIHAK KEDUA wajib mengganti seluruh kerugian yang nyata dialami LABEL, termasuk biaya produksi yang belum kembali, biaya promosi, biaya hukum, dan kerugian lain yang dapat dibuktikan sesuai ketentuan hukum yang berlaku.</p>

                  <Pasal num="14" title="HAK ATAS MASTER RECORDING" />
                  <LItem num="1">Selama masa perjanjian, seluruh hak pengelolaan dan pemanfaatan komersial atas Master Recording berada pada LABEL.</LItem>
                  <LItem num="2">Apabila kontrak berakhir, hak atas Master Recording mengikuti ketentuan yang disepakati para pihak dalam perjanjian ini atau perjanjian tambahan.</LItem>

                  <Pasal num="15" title="HAK SINKRONISASI" />
                  <p className="mb-3">LABEL berhak memberikan izin penggunaan lagu untuk:</p>
                  <ul className="list-disc ml-8 mb-4 space-y-1">
                    <li>Film</li>
                    <li>Sinetron</li>
                    <li>Web Series</li>
                    <li>Iklan</li>
                    <li>Game</li>
                    <li>TikTok</li>
                    <li>YouTube</li>
                    <li>Meta</li>
                    <li>Spotify Canvas</li>
                    <li>Platform AI</li>
                    <li>Media digital lainnya.</li>
                  </ul>

                  <Pasal num="16" title="MASA BERLAKU" />
                  <LItem num="1">Perjanjian berlaku selama <strong>10 (sepuluh) tahun</strong> sejak tanggal ditandatangani.</LItem>
                  <LItem num="2">LABEL memiliki hak untuk menawarkan perpanjangan terlebih dahulu sebelum PIHAK KEDUA bekerja sama dengan pihak lain.</LItem>

                  <Pasal num="17" title="PENYELESAIAN PERSELISIHAN" />
                  <LItem num="1">Setiap perselisihan diselesaikan terlebih dahulu melalui musyawarah.</LItem>
                  <LItem num="2">Apabila tidak tercapai kesepakatan, penyelesaian dilakukan melalui Pengadilan Negeri yang disepakati para pihak sesuai domisili hukum MUSIORA.</LItem>

                  <Pasal num="18" title="PENUTUP" />
                  <LItem num="1">Perjanjian ini dibuat dalam keadaan sadar, tanpa paksaan, dan mempunyai kekuatan hukum yang sama bagi kedua belah pihak.</LItem>
                  <LItem num="2">Dibuat rangkap dua, masing-masing bermaterai cukup dan mempunyai kekuatan hukum yang sama.</LItem>
                </div>

                <div className="mt-12 text-[11pt] break-inside-avoid">
                  <p className="uppercase" style={{ marginBottom: '40px' }}>{contractData?.tempatTtd || 'TASIKMALAYA'}, {contractData?.tanggalCetak || '12 September 2025'}</p>

                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '64px' }}>
                      <div style={{ width: '45%', textAlign: 'center' }}>
                        <p style={{ fontWeight: 'bold' }}>PIHAK PERTAMA</p>
                        <p style={{ fontWeight: 'bold' }}>{contractData?.pihak1_perusahaan || 'MUSIORA'}</p>
                        <p style={{ fontSize: '9pt', color: '#666', marginTop: '16px', marginBottom: '0px' }}>Materai Rp10.000</p>
                        <SignHint />
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{contractData?.pihak1_wakil || 'Yadi Supriyadi'}</p>
                        <p>Jabatan: {contractData?.pihak1_jabatan || 'Direktur Utama'}</p>
                      </div>
                      <div style={{ width: '45%', textAlign: 'center' }}>
                        <p style={{ fontWeight: 'bold' }}>PIHAK KEDUA</p>
                        <p style={{ fontWeight: 'bold' }}>PENCIPTA LAGU</p>
                        <p style={{ fontSize: '9pt', color: '#666', marginTop: '16px', marginBottom: '0px' }}>Materai Rp10.000</p>
                        <SignHint />
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{contractData?.pihak2_nama || 'AGUNG GUMILAR'}</p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '32px' }}>SAKSI MENGETAHUI,</p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 60px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <SignHint />
                          <p style={{ fontWeight: 'bold' }}>({contractData?.saksi1 || 'Adi Dwi Haryanto'})</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <SignHint />
                          <p style={{ fontWeight: 'bold' }}>({contractData?.saksi2 || 'Andri Melandi'})</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 
                  className="text-center font-black mb-2 leading-tight" 
                  style={{ textAlign: 'center', fontSize: '20pt', fontWeight: 900 }}
                >
                  PERJANJIAN KERJA SAMA REKAMAN SUARA ARTIS
                </h1>
                
                <div className="text-center mb-8" style={{ textAlign: 'center' }}>
                  <span className="font-bold" style={{ fontSize: '13pt', fontWeight: 700 }}>
                    No: {contractData?.nomorKontrak || '0021/PKS/RSA/MYDR/VII/2025'}
                  </span>
                </div>

                <p className="text-justify leading-relaxed mb-4">
                  Perjanjian ini dibuat dan ditandatangani di Bandung pada hari <strong>{contractData?.hariTerbilang || 'JUMAT'}</strong> tanggal <strong>{contractData?.tanggalTerbilang || '04'}</strong> bulan <strong>{contractData?.bulanTerbilang || 'JULI'}</strong> tahun <strong>{contractData?.tahunTerbilang || '2025'}</strong> (selanjutnya disebut <strong>PERJANJIAN</strong>)
                </p>

                <p style={{ textAlign: 'center', margin: '24px 0 16px 0' }}>Oleh dan antara</p>

                {/* Pihak Pertama Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '16px', fontSize: '11pt' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '50%', verticalAlign: 'top', padding: '8px', borderRight: '1px solid black', borderBottom: '1px solid black' }}>
                        Perusahaan<br/>
                        {contractData?.pihak1_perusahaan || 'MYD RECORDS INDONESIA'}<br/>
                        (<strong>{contractData?.pihak1_alias === 'MYD R' || contractData?.pihak1_alias === 'MUSIORA' ? 'MYD RECORDS' : (contractData?.pihak1_alias || 'MYD RECORDS')}</strong>), beralamat di {contractData?.pihak1_alamat || 'jalan SL Tobing No.38 - Tasikmalaya'}<br/>
                      </td>
                      <td style={{ width: '50%', verticalAlign: 'top', padding: '8px', borderBottom: '1px solid black' }}>
                        <div style={{ marginBottom: '2px' }}>Diwakili oleh</div>
                        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>{contractData?.pihak1_wakil || 'Yadi Supriyadi'}</div>
                        <div style={{ marginBottom: '2px' }}>Jabatan</div>
                        <div style={{ fontWeight: 'bold' }}>{contractData?.pihak1_jabatan || 'Direktur Utama'}</div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid black', lineHeight: '1.5' }}>
                        dalam perbuatan hukum ini secara sah bertindak untuk dan <span style={{ color: 'blue', textDecoration: 'underline' }}>atas nama</span> perusahaan<br/>
                        <strong>{contractData?.pihak1_perusahaan || 'MUSIORA'}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        Selanjutnya disebut sebagai PRODUSER EKSEKUTIF
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '32px 0 16px 0' }}>Dengan</p>

                {/* Pihak Kedua Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '24px', fontSize: '11pt' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '50%', verticalAlign: 'top', padding: '8px', borderRight: '1px solid black', borderBottom: '1px solid black', lineHeight: '1.5' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ width: '60px', verticalAlign: 'top' }}>Nama</td>
                              <td style={{ width: '10px', verticalAlign: 'top', color: 'blue', textDecoration: 'underline' }}>:</td>
                              <td style={{ verticalAlign: 'top' }}><strong>{contractData?.pihak2_nama || 'AGUNG GUMILAR'}</strong></td>
                            </tr>
                            <tr>
                              <td style={{ verticalAlign: 'top' }}>No KTP</td>
                              <td style={{ verticalAlign: 'top', color: 'blue', textDecoration: 'underline' }}>:</td>
                              <td style={{ verticalAlign: 'top' }}><strong>{contractData?.pihak2_ktp || '3213202303970001'}</strong></td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td style={{ width: '50%', verticalAlign: 'top', padding: '8px', borderBottom: '1px solid black', lineHeight: '1.5' }}>
                        <span style={{ color: 'blue', textDecoration: 'underline' }}>Alamat :</span> <strong>{(contractData?.pihak2_alamat || 'KP MARENGMANG III RT 011\nRW 003 KEC KALIJATI SUBANG').replace(/\\n/g, '\n')}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" style={{ padding: '16px 8px', textAlign: 'justify', lineHeight: '1.6' }}>
                        Yang merupakan pribadi-pribadi yang secara sendiri-sendiri maupun bersama-sama terikat pada <strong>PERJANJIAN</strong> ini sebagai para musisi dan pencipta <strong>LAGU</strong> yang tergabung dalam kelompok atau perseorangan atas nama <strong>{contractData?.pihak2_nama || 'AGUNG GUMILAR'}</strong> atau nama lain yang akan ditentukan kemudian untuk selanjutnya disebut sebagai <strong>{contractData?.pihak2_alias || 'ARTIS'}</strong>.
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-justify leading-relaxed font-bold mb-4">
                  PRODUSER dan ARTIS secara bersama-sama dalam PERJANJIAN ini disebut PARA PIHAL / PARA PIHAK.
                </p>
                
                <p className="text-justify leading-relaxed mb-8">
                  <strong>PARA PIHAK</strong> sepakat untuk melakukan perikatan dalam <strong>PERJANJIAN</strong> pembuatan dan peredaran karya rekaman suara dengan ketentuan sebagaimana tercantum dalam pasal-pasal berikut ini:
                </p>
                
                <div className="doc-clauses">
                  
                  {/* PASAL 1 */}
                  <Pasal num="1" title="Ketentuan Umum/Definisi" />
                  <p className="text-justify leading-relaxed mb-4">
                    <strong>PARA PIHAK</strong> sepakat bahwa dalam pengaturan dan pelaksanaan aturan <strong>PERJANJIAN</strong> ini, pengertian untuk kata tertentu dibatasi pada definisi sebagai berikut:
                  </p>
                  
                  <LItem num="1"><strong>ALBUM</strong> Adalah suatu karya rekaman suara maupun gambar yang didalamnya terdapat sekurang-kurangnya 10 (sekurang-kurangnya sepuluh) komposisi musik yang berbeda satu sama lainnya, dengan masa putar sekurang-kurangnya 45 (empat puluh lima) menit, kecuali ditentukan lain oleh <strong>PRODUSER EKSEKUTIF</strong>.</LItem>
                  <LItem num="2"><strong>SINGLE</strong> Adalah suatu karya rekaman suara maupun gambar yang didalamnya terdapat 1-3 komposisi musik yang berbeda satu sama lainnya dengan masa putar 3-10 menit.</LItem>
                  <LItem num="3"><strong>HAK OPSI</strong> Adalah setiap single/album tambahan yang diterima oleh <strong>PRODUSER EKSEKUTIF</strong> atau dipertimbangkan untuk diterima sesuai dengan ketentuan opsi yang diatur dalam pasal 11 <strong>PERJANJIAN</strong> ini.</LItem>
                  <LItem num="4"><strong>ARTIS</strong> Adalah orang yang suaranya atau atas kemampuannya dapat menimbulkan bunyi sehingga dapat menghasilkan suara, seperti penyanyi, pemain musik, penceramah, dalang, pelawak, deklamator, narator, dalam hal ini <strong>ARTIS</strong> atau yang dikenal dengan nama <strong>{contractData?.pihak2_panggung || 'AGUNG RUHAY'}</strong>, atau nama lain yang akan ditentukan oleh <strong>PRODUSER EKSEKUTIF</strong> sebagai nama produk untuk single maupun album.</LItem>
                  <LItem num="5"><strong>PENCIPTA</strong> Adalah <strong>ARTIS</strong> (seorang atau beberapa orang yang secara bersama-sama) atas inspirasinya lahir suatu ciptaan berdasarkan kemampuan pikiran, imajinasi, kecekatan, keterampilan atau keahlian yang dituangkan dalam bentuk yang khas dan bersifat pribadi.</LItem>
                  <LItem num="6"><strong>CIPTAAN</strong> Adalah hasil setiap karya pencipta dalam bentuk yang khas apapun juga dalam lapangan ilmu seni dan sastra.</LItem>
                  <LItem num="7"><strong>HAK CIPTA</strong> Adalah khusus bagi pencipta maupun penerima hak untuk mengumumkan atau memperbanyak ciptaannya maupun memberi izin untuk itu dan tidak mengurangi pembatasan-pembatasan menurut perundang-undangan yang berlaku.</LItem>
                  <LItem num="8"><strong>LAGU</strong> Adalah setiap komposisi musik yang menunjukkan keasliannya baik yang dibuat dengan lirik ataupun tanpa lirik yang dalam <strong>PERJANJIAN</strong> ini <strong>LAGU</strong> merupakan karya cipta dari <strong>ARTIS</strong>.</LItem>
                  <LItem num="9"><strong>EKSKLUSIF</strong> Adalah khusus, tunggal dan tidak terbagi-bagi kepada pihak manapun sebagaimana termaktub <strong>PERJANJIAN</strong> ini.</LItem>
                  <LItem num="10"><strong>ARTWORK</strong> Adalah keseluruhan hasil kerja kreatif yang digunakan untuk pembuatan sampul kemasan, tatahan, sisipan serta etiket nama (label) yang digunakan untuk rekaman suara maupun video, termasuk di dalamnya potret dan seluruh materi promosi yang dibuat untuk kepentingan <strong>PARA PIHAK</strong> sesuai dengan <strong>PERJANJIAN</strong> ini.</LItem>
                  <LItem num="11"><strong>JANGKA WAKTU</strong> Adalah masa berlaku <strong>PERJANJIAN</strong> sebagaimana diatur dalam pasal 3 <strong>PERJANJIAN</strong> ini.</LItem>
                  <LItem num="12"><strong>MASTER REKAMAN</strong> Adalah media penghantar suara yang pertama kali memuat suara/karya rekaman atau bunyi, yang dapat digandakan dalam berbagai bentuk produk rekaman. Hak atas karya rekaman suara sebagaimana dimaksud di atas merupakan milik orang atau badan hukum yang pertama kali merekam atau memprakarsai biaya perekaman suara atau bunyi dimaksud sebagaimana diatur dalam UU Hak Cipta.</LItem>
                  <LItem num="13">
                    <strong>PENJUALAN BERSIH</strong> adalah seluruh unit album yang terjual, dikurangi jumlah pengembalian (retur) unit album tersebut kepada <strong>PRODUSER EKSEKUTIF</strong> dengan alasan apapun.<br/>
                    (Khusus untuk produk rekaman yang diedarkan melalui Distribusi Digital (transmisi elektronik/New Media), penjualan bersih dihitung berdasarkan jumlah pembayaran yang diterima <strong>PRODUSER EKSEKUTIF</strong> dari MITRA KERJA penyelenggara layanan Digital Distribusi (transmisi elektronik/New Media), secara aktual di Indonesia (baik berupa penerimaan dari penjualan maupun lisensi) dari setiap peredaran melalui transmisi atau komunikasi yang dilakukan melalui Digital Distribusi (transmisi elektronik/New Media) yang didasarkan pada perhitungan pro rata pada tiap-tiap <strong>LAGU</strong> baik yang digunakan pelanggan melalui streaming atau download (tidak termasuk penerimaan atas hak mengumumkan / performing right atas master rekaman). Penjualan bersih untuk transmisi elektronik akan dikurangi terlebih dahulu atas semua biaya yang dikeluarkan oleh <strong>PRODUSER EKSEKUTIF</strong> atau MITRA KERJA penerima lisensi serta agen yang berhubungan dengan penyelenggaraan transmisi (jika ada).
                    <div className="mt-2">
                      <SubItem letter="a"><strong>PRODUSER EKSEKUTIF</strong> Adalah Pengguna <strong>LAGU</strong> yang bertindak sebagai Eksekutif Produser dalam Album/Single yang menggunakan <strong>LAGU</strong> Karya Pencipta, serta pemegang hak cipta atas Master Rekaman (Soundrecording Rights, Mechanical Right dan Synchronization Right) yang atas prakarsa dan pembiayaannya pertama kali merekam atau mengkordinir kegiatan perekaman suara atau bunyi dalam bentuk album rekaman sehingga oleh karenanya PRODUSER adalah pihak yang berkewajiban membiayai keseluruhan pembiayaan yang timbul berkaitan dengan kegiatan pengerjaan album rekaman, Promosi album rekaman dan secara sendiri atau bekerjasama dengan pihak lain melakukan kegiatan peredaran (distribusi) album rekaman, dengan ketentuan pembiayaan tersebut termasuk tapi tidak terbatas meliputi: pembiayaan atau pemberian kompensasi kepada pencipta <strong>LAGU</strong>, <strong>ARTIS</strong>, Penyanyi, Arranger, musisi pendukung dari Album rekaman, keseluruhan pembiayaan yang timbul berkaitan dengan kegiatan produksi Album rekaman yang meliputi penyewaan Studio rekaman untuk keseluruhan kegiatan perekaman materi Album, termasuk kegiatan Mixing and Mastering, Duplicating, pembuatan cover dan artwork serta seluruh kegiatan promosi yang meliputi pembuatan video klip serta keseluruhan pembiayaan penunjang kegiatan promosi serta seluruh pembiayaan yang timbul berkaitan dengan pelaksanaan distribusi/peredaran Album/Single rekaman.</SubItem>
                      <SubItem letter="b"><strong>PRODUK REKAMAN</strong> Adalah rekaman dalam berbagai bentuk media penghantar suara seperti kaset atau pita magnetik, plat gramophone dan compact disc, termasuk di dalamnya semua rekaman dalam piringan dimana sinyal dari piringan tersebut dapat dibaca dan diterjemahkan oleh sinar laser, seperti laser disc, mini disk, cd rom, vcd, super vcd dan dvd, serta semua bentuk format teknologi yang baru atau berbagai penerapan lain yang memungkinkan untuk memuat suara (baik yang dikenal sekarang atau yang tengah dikembangkan atau akan ditemukan dikemudian hari). Serta semua bentuk penggandaan karya rekaman yang dibuat sesuai <strong>PERJANJIAN</strong>, baik yang memuat citra visual secara langsung maupun yang dalam penerapannya kemudian dapat ditambahkan citra visual.</SubItem>
                      <SubItem letter="c"><strong>ROYALTI</strong> Adalah kompensasi/honorarium dalam bentuk royalty dalam jumlah persentase tertentu yang diambil dari keuntungan bersih penjualan Phonograms (setelah terlebih dahulu dikurangi dengan antara lain, pengeluaran kewajiban pajak, biaya replikasi, kemasan artwork, discount agent), yang akan dibayarkan oleh <strong>PRODUSER EKSEKUTIF</strong> sebagai Pengguna <strong>LAGU</strong> kepada <strong>ARTIS</strong> atau orang atau Badan Hukum yang dikuasakan/diberi kuasa resmi oleh nya, baik dengan cara memberikan uang muka (advance) royalty dan pembayaran royalty kelanjutannya baik yang diatur dalam <strong>PERJANJIAN</strong> ini maupun sesuai dengan <strong>PERJANJIAN</strong> lain (terpisah) yang merupakan kesatuan dan bagian yang tidak terpisahkan dengan <strong>PERJANJIAN</strong> ini.</SubItem>
                      <SubItem letter="d"><strong>SHARE</strong> Adalah perhitungan presentase jumlah <strong>LAGU</strong> karya <strong>ARTIS</strong> yang digunakan dalam album dibagi jumlah keseluruhan <strong>LAGU</strong> yang ada dalam album tersebut secara pro rata.</SubItem>
                      <SubItem letter="e"><strong>VIDEO</strong> Adalah hasil rekaman gambar dalam berbagai bentuk media penghantar gambar seperti, kaset video atau pita magnetic, termasuk di dalamnya semua rekaman dalam piringan dimana sinyal dari piringan tersebut dapat dibaca dan diterjemahkan oleh sinar laser, seperti laser disc, mini disk, cd rom, vcd, super vcd dan dvd dan berbagai media magnetik elektronik yang lain atau berbagai peralatan yang bisa menampakkan gambar serta memuat suara, serta semua bentuk format teknologi yang dapat diterapkan untuk kepentingan tersebut (baik yang dikenal sekarang atau yang tengah dikembangkan atau yang akan ditemukan di kemudian hari), dimana citra visual baik dengan atau tanpa suara dapat digandakan, digunakan langsung, baik dengan bantuan mesin atau alat lain yang khusus, yang memuat semua bentuk penampilan dan atau rekaman suara dan gambar. Segala sesuatu yang dapat dilakukan dan diterapkan ke dalam pengertian rekaman dengan sendirinya dapat digunakan untuk video.</SubItem>
                      <SubItem letter="f"><strong>DISTRIBUSI DIGITAL</strong> (transmisi elektronik/New Media) Berarti setiap pengiriman, distribusi, penyebaran atau penyediaan Rekaman suara, Video, musik, Metadata, dan/atau Sampul album (atau konten digitalnya) termasuk DSP (digital Store Platform) dengan berbagai cara yang diketahui sekarang atau ditemukan pada masa akan datang termasuk tapi tidak terbatas pada, telepon,satelit, penyiaran, nir kabel, kabel dan/atau internet dan, broad band, narrow band serta jenis bandwidth lainnya, satelit, serat optik, jaringan telepon, dengan atau tanpa kabel, dari satu lokasi ke lokasi lainnya di mana produk rekaman dapat diterima secara permanen, digandakan atau segala bentuk komunikasi yang mempunyai periode yang memadai untuk suatu penyiaran tanpa membedakan bentuk penyiaran yang terus menerus or not, serta jenis perangkat pemutar termasuk semua bentuk transmisi produk rekaman melalui webcast atau jenis lainnya seperti streaming audio baik dengan atau tanpa video, tanpa ada pembatasan baik yang memuat citra visual secara langsung maupun yang dalam penerapannya kemudian dapat ditambahkan citra visual /VideoMusik termasuk format yang digunakan dalam rangka penggunaan rekaman suara (<strong>LAGU</strong>) dalam Iklan produk tertentu, Metadata dan/atau Sampul album pada aplikasi mobile dan manufaktur, distribusi serta penjualan Disk secara Pesanan (on demand) tapi tidak termasuk manufaktur, distribusi dan penjualan rekaman (selain Disc on Demand) dalam format fisik.</SubItem>
                      <SubItem letter="g"><strong>MITRA KERJA</strong> adalah agregator, operator penyelenggara kegiatan layanan distribusi digital termasuk DSP (Digital Store Platform), RBT (Ring Back Tone) or other format yang menjadi mitra kerja/partner <strong>PRODUSER EKSEKUTIF</strong> dalam melaksanakan peredaran/distribusi Karya Cipta <strong>LAGU-LAGU</strong> secara digital.</SubItem>
                      <SubItem letter="h"><strong>WILAYAH DISTRIBUSI</strong> adalah wilayah penyebaran hasil produk yang dihasilkan dalam <strong>PERJANJIAN</strong> ini.</SubItem>
                    </div>
                  </LItem>
    
                  {/* PASAL 2 */}
                  <Pasal num="2" title="Ruang Lingkup" />
                  <LItem num="1">
                    Ruang lingkup <strong>PERJANJIAN</strong> ini meliputi kesepakatan <strong>PRODUSER EKSEKUTIF</strong> untuk menunjuk <strong>ARTIS</strong> untuk melaksanakan kegiatan rekaman suara untuk pembuatan master rekaman <strong>ARTIS</strong>, sebagaimana <strong>ARTIS</strong> berdasarkan <strong>PERJANJIAN</strong> ini sepakat atas penunjukan dari <strong>PRODUSER EKSEKUTIF</strong> untuk melaksanakan kegiatan perekaman suara dengan ketentuan sebagai berikut:
                    <div className="mt-2">
                      <SubItem letter="a">
                        <strong>ARTIS</strong> Wajib untuk melaksanakan kegiatan rekaman suara untuk pembuatan master rekaman suara sekurang kurangnya sebanyak 1 (satu) <strong>ALBUM</strong> atau dalam jumlah lain yang akan ditentukan oleh <strong>PRODUSER EKSEKUTIF</strong>.
                      </SubItem>
                      <SubItem letter="b"><strong>ARTIS</strong> berdasarkan <strong>PERJANJIAN</strong> ini menyatakan sepakat untuk menyerahkan ijin penggunaan dan pengelolaan 1 (satu) <strong>ALBUM</strong> Karya Cipta dari <strong>ARTIS/PENCIPTA LAGU</strong> (selanjutnya disebut <strong>LAGU</strong>), secara eksklusif tidak terbagi-bagi selama <strong>JANGKA WAKTU PERJANJIAN</strong> ini kepada <strong>PRODUSER EKSEKUTIF</strong> dengan judul-judul <strong>LAGU</strong> adalah sebagaimana yang tercantum dalam LAMPIRAN PERJANJIAN yang merupakan kesatuan dan bagian yang tidak terpisahkan dengan <strong>PERJANJIAN</strong> ini. Disepakati oleh <strong>PARA PIHAK</strong> bahwa <strong>LAGU</strong> adalah materi rekaman suara untuk pembuatan master rekaman <strong>ARTIS</strong> dan selanjutnya oleh <strong>PRODUSER EKSEKUTIF</strong> materi rekaman suara atas <strong>LAGU</strong> yang terdapat dalam master tersebut akan diedarkan secara komersial baik dalam bentuk Single atau Album atau dalam bentuk lainnya dan diedarkan melalui cara distribusi konvensional maupun melalui teknologi distribusi digital untuk lingkup peredaran seluruh dunia yang pelaksanaannya akan diatur berdasarkan ketentuan yang disepakati <strong>PARA PIHAK</strong> dalam <strong>PERJANJIAN</strong> ini.</SubItem>
                    </div>
                  </LItem>
                  <LItem num="2"><strong>PARA PIHAK</strong> sepakat bahwa apabila dalam kegiatan pembuatan master rekaman sebagaimana dimaksud ketentuan pasal 2 ayat a, terdapat penggunaan materi <strong>LAGU</strong> karya pencipta lain selain karya cipta <strong>LAGU</strong> dari <strong>ARTIS</strong>, maka <strong>PRODUSER EKSEKUTIF</strong> menjamin untuk mengurus Izin penggunaan <strong>LAGU</strong> tersebut kepada para Pencipta.</LItem>
                  <LItem num="3">Sehubungan dengan pelaksanaan ketentuan pasal 2 point b, di atas <strong>ARTIS</strong> sepakat bahwa Izin Penggunaan "<strong>LAGU</strong>" yang diberikan kepada <strong>PRODUSER EKSEKUTIF</strong> adalah Izin penggunaan <strong>LAGU</strong> dalam arti luas, termasuk tapi tidak terbatas selama <strong>JANGKA WAKTU PERJANJIAN</strong> meliputi seluruh kegiatan yang berhubungan dengan kegiatan produksi, Rekaman Suara (dalam berbagai media rekam yang dikenal luas), penggandaan, pengedaran dan penjualan serta promosi atas Rekaman Suara yang dikelola <strong>PRODUSER EKSEKUTIF</strong> (atau pihak lain yang ditunjuknya sebagai MITRA KERJA), termasuk Karya rekaman dalam berbagai bentuk Phonograms seperti kaset, CD, DVD, vinyl, karaoke, video klip, atau dalam dengan lingkup peredaran bentuk distribusi digital (transmisi elektronik/New Media) dengan menggunakan teknologi yang dikenal sekarang maupun teknologi lainnya yang dikenal atau digunakan pada waktu yang akan datang (Mechanical Right), Ring backtone, ringtone, truetone, full track download, video download, DSP (Digital Streaming Platform) atau bentuk lainnya, atau apapun juga, mengedarkan kembali <strong>LAGU</strong> tersebut secara utuh dalam bentuk dan kemasan berbeda, izin untuk mengumumkan dalam arti luas membacakan, menyuarakan/memutar,menyiarkan, mempromosikan, menyebarkan dan menampilkannya dipanggung <strong>LAGU</strong> tersebut (Performing Right), izin untuk menggabungkan hasil REKAMAN menjadi suatu karya audio visual termasuk memperbanyaknya dan menyebarkannya semata-mata untuk kepentingan promosi dari Karya rekaman atau Album yang dibuat (Synchronization Right), Izin untuk mencetak, memperbanyak dan menyebarkan secara tertulis lirik <strong>LAGU</strong> untuk dicantumkan di dalam cover dari Karya rekaman atau Album yang dibuat (Printing Reproduction Right), seluruhnya dalam arti seluas-luasnya dengan lingkup kegiatan dan peredaran seluruh dunia.</LItem>
                  <LItem num="4"><strong>ARTIS</strong> tidak dapat melakukan pembatalan komitmen dalam memproduksi atau merilis Master Rekaman <strong>ARTIS</strong> sebagaimana disebutkan dalam poin 1 pasal ini secara sepihak, dan pelanggaran atas ketentuan ini akan mengakibatkan <strong>ARTIS</strong> wajib membayar ganti rugi kepada Pihak Pertama 10 (sepuluh) kali lipat dari besarnya biaya yang telah dikeluarkan <strong>PRODUSER EKSEKUTIF</strong>.</LItem>
                  <LItem num="5"><strong>PERJANJIAN</strong> ini dibuat secara EKSKLUSIF, tidak terbagi-bagi selama <strong>JANGKA WAKTU PERJANJIAN</strong> sebagaimana diatur dan disepakati <strong>PARA PIHAK</strong> dalam ketentuan pasal 3 <strong>PERJANJIAN</strong> ini. Dengan demikian, <strong>ARTIS</strong> secara pribadi terikat penuh dari apa yang diperjanjikan atas rekaman suara <strong>ARTIS</strong> dan video penampilannya dalam berbagai bahasa untuk digandakan dalam berbagai bentuk media penghantar suara, media penghantar gambar dan suara (multimedia) dari berbagai penggandaan yang dimungkinkan atas hasil rekaman dimaksud sesuai dengan perkembangan teknologi yang diketahui sekarang ini, yang tengah dikembangkan atau ditemukan dikemudian hari berdasarkan kesepakatan yang diatur dalam <strong>PERJANJIAN</strong> ini, termasuk tetapi tidak terbatas format multi media digital/transmisi elektronik dan new media (ringbacktone, ringtone, truetone, full track download, video download, dan lainnya).</LItem>
    
                  {/* PASAL 3 */}
                  <Pasal num="3" title="Jangka Waktu dan Wilayah Distribusi" />
                  <LItem num="1"><strong>PERJANJIAN</strong> ini berlaku sejak ditandatanganinya perjanjian ini dan berakhir {contractData?.durasiKontrakArtis || '2 (dua) tahun'} dan/atau setelah sekurang-kurangnya memproduksi 1 (satu) <strong>ALBUM</strong> sebagaimana yang dimaksud dalam pasal 2 ayat 1 poin b tersebut diatas, (untuk selanjutnya disebut "<strong>JANGKA WAKTU PERJANJIAN</strong>")</LItem>
                  <LItem num="2"><strong>PRODUSER EKSEKUTIF</strong> mempunyai hak untuk menggandakan dan mengedarkan berbagai produk rekaman di wilayah Negara Kesatuan Republik Indonesia dan di wilayah manapun di seluruh dunia.</LItem>
    
                  {/* PASAL 4 */}
                  <Pasal num="4" title="Produksi" />
                  <LItem num="1">Semua kegiatan rekaman akan diatur dan ditentukan <strong>PRODUSER EKSEKUTIF</strong> termasuk pemilihan studio rekaman, pelaksanaan rekaman, penentuan <strong>ARTIS</strong> lain sebagai bintang tamu yang akan berkolaborasi dengan <strong>ARTIS</strong>, serta segala unsur dan materi yang akan direkam. <strong>ARTIS</strong> berkewajiban untuk memenuhi jadwal sesuai dengan waktu dan tempat yang telah ditentukan <strong>PRODUSER EKSEKUTIF</strong> selama proses rekaman berlangsung, baik sendiri maupun bersama-sama para <strong>ARTIS</strong> lain sesuai dengan penentuan dan penunjukkan yang telah dilakukan <strong>PRODUSER EKSEKUTIF</strong> untuk pembuatan rekaman suara berdasarkan <strong>PERJANJIAN</strong> ini.</LItem>
                  <LItem num="2">Selama <strong>PERJANJIAN</strong> ini berlaku, <strong>ARTIS</strong> terikat untuk melakukan rekaman tambahan secara sendiri dalam berbagai bahasa yang ditentukan oleh <strong>PRODUSER EKSEKUTIF</strong> baik untuk salah satu album atau paket-paket album lainnya.</LItem>
    
                  {/* PASAL 5 */}
                  <Pasal num="5" title="Kepemilikan" />
                  <LItem num="1"><strong>PARA PIHAK</strong> sepakat bahwa <strong>PRODUSER EKSEKUTIF</strong> merupakan pemilik tunggal atas karya master rekaman suara yang dibuat berdasarkan <strong>PERJANJIAN</strong> ini secara eksklusif di seluruh dunia dan untuk {contractData?.durasiLaguMaster || 'selamanya'}, termasuk di dalamnya tetapi tidak terbatas pada seluruh hak cipta dan hak-hak yang berkaitan dengan hak cipta yang timbul dari kepentingan penggandaan dan peredaran karya rekaman suara dimaksud, seperti penampilan <strong>ARTIS</strong> dalam video, disain cover, poster, potret.</LItem>
                  <LItem num="2"><strong>PRODUSER EKSEKUTIF</strong> sebagai pemilik Hak Cipta atas master rekaman berhak untuk tetap mengedarkan memasarkan <strong>LAGU-LAGU</strong> yang terdapat dalam Master rekaman dalam berbagai bentuk meskipun <strong>JANGKA WAKTU PERJANJIAN</strong> telah berakhir dengan tetap membenarkan kewajiban Royalti kepada <strong>ARTIS</strong> dengan besaran Royalti sebagaimana yang telah disepakati <strong>PARA PIHAK</strong> berdasarkan <strong>PERJANJIAN</strong> ini maupun berdasarkan kesepakatan perjanjian lain (perjanjian tambahan) yang telah disepakati secara tertulis oleh <strong>PARA PIHAK</strong> (apabila ada).</LItem>
                  <LItem num="3"><strong>PRODUSER EKSEKUTIF</strong> sekaligus merupakan pemegang lisensi untuk menggunakan dan menerbitkan nama <strong>ARTIS</strong> dan nama profesi, potret, diri khas maupun biografi <strong>ARTIS</strong> dengan berbagai cara dan dalam berbagai media untuk tujuan pembuatan etiket nama (label), pembuatan katalog, pemasaran, dan eksploitasi rekaman suara serta video yang dibuat sesuai dengan ketentuan <strong>PERJANJIAN</strong> ini.</LItem>
                  <LItem num="4"><strong>PRODUSER EKSEKUTIF</strong> mempunyai hak untuk menentukan susunan <strong>LAGU</strong> pada masing-masing album rekaman atau single dengan mempertimbangkan situasi pasar dan kondisi-kondisi tertentu untuk kepentingan pemasaran album atau single tanpa meminta persetujuan terlebih dahulu dari <strong>ARTIS</strong>.</LItem>
                  <LItem num="5"><strong>PRODUSER EKSEKUTIF</strong> mempunyai hak sepenuhnya untuk menentukan sistem produksi secara keseluruhan termasuk didalamnya tetapi tidak terbatas pada penggandaan dan jenis media penghantar suara, cover serta harga eceran tertinggi.</LItem>
    
                  {/* PASAL 6 (Promosi) */}
                  <Pasal num="6" title="Promosi & Tour Promosi" />
                  <LItem num="1"><strong>ARTIS</strong> akan melaksanakan promosi atas single/album <strong>ARTIS</strong> di media cetak dan elektronik berdasarkan kebijakan <strong>PRODUSER EKSEKUTIF</strong>. Untuk itu <strong>ARTIS</strong> wajib mengikuti semua rangkaian kegiatan promosi selama masa promo atau enam bulan apabila promo itu dianggap masih diperlukan, oleh <strong>PRODUSER EKSEKUTIF</strong> di media cetak maupun elektronik antara lain: wawancara dengan media cetak, radio dan televisi, pemotretan, konferensi pers, jumpa fans dan pertunjukan (live show) dan lain-lain, di mana <strong>ARTIS</strong> tidak mendapat pembayaran apapun dari <strong>PRODUSER EKSEKUTIF</strong>. <strong>PRODUSER EKSEKUTIF</strong> akan menanggung semua biaya kegiatan promo tersebut dengan waktu dan tempat yang disetujui oleh <strong>PARA PIHAK</strong>.</LItem>
                  <LItem num="2">Keputusan pengadaan tour promosi merupakan hak mutlak <strong>PRODUSER EKSEKUTIF</strong> yang tidak dapat di ganggu gugat oleh <strong>ARTIS</strong>.</LItem>
                  <LItem num="3">Dalam hal <strong>PRODUSER EKSEKUTIF</strong> memutuskan untuk mengadakan tour promosi, maka <strong>ARTIS</strong> berkewajiban untuk mengikuti jadwal serta aturan-aturan pelaksanaan yang ditetapkan oleh <strong>PRODUSER EKSEKUTIF</strong>.</LItem>
                  <LItem num="4">Untuk pengadaan tour promosi <strong>PRODUSER EKSEKUTIF</strong> berhak untuk menggandeng pihak ketiga, yaitu sponsor, guna membantu <strong>PRODUSER EKSEKUTIF</strong> dalam pembiayaan dan pelaksanaan tour promosi, di mana biaya yang akan ditanggung oleh sponsor tidak akan meliputi pembayaran fee dalam bentuk apapun kepada <strong>ARTIS</strong>.</LItem>
                  <LItem num="5">Setelah masa promosi selesai, <strong>ARTIS</strong> berkewajiban mengikuti event-event atau kegiatan untuk live performance yang telah ditetapkan oleh <strong>PRODUSER EKSEKUTIF</strong>, yang diatur dalam <strong>PERJANJIAN</strong> tersendiri antara label dengan <strong>ARTIS</strong>, yaitu <strong>PERJANJIAN management ARTIS</strong>.</LItem>
    
                  {/* PASAL 6 (Video) */}
                  <Pasal num="6" title="Video" />
                  <LItem num="1">Dalam hal <strong>PRODUSER EKSEKUTIF</strong> memutuskan untuk membuat video, baik untuk kepentingan promosi maupun kepentingan komersial, maka <strong>ARTIS</strong> diwajibkan untuk memenuhi pembuatan rekaman dan pengambilan gambar (shooting) dimaksud.</LItem>
                  <LItem num="2">Selain penggunaan video untuk berbagai kepentingan promosi, <strong>PRODUSER EKSEKUTIF</strong> mempunyai hak sepenuhnya untuk menggunakan dan mengeksploitasi video dimaksud secara komersial, hak kepemilikan atas MASTER VIDEO merupakan hak milik <strong>PRODUSER EKSEKUTIF</strong>.</LItem>
    
                  {/* PASAL 7 */}
                  <Pasal num="7" title="Royalti" />
                  <p className="text-justify leading-relaxed mb-4">
                    Dalam hubungannya dengan kepemilikan hak atas karya rekaman suara sebagaimana diatur dalam pasal 4 <strong>PERJANJIAN</strong> ini, serta berbagai kewajiban <strong>ARTIS</strong> yang timbul sebagai akibat dari <strong>PERJANJIAN</strong> ini, <strong>PRODUSER EKSEKUTIF</strong> mempunyai kewajiban untuk memberikan kompensasi pembayaran royalti kepada <strong>ARTIS</strong> berdasarkan ketentuan berikut ini:
                  </p>
                  <LItem num="1">
                    <strong>Pembayaran Royalti</strong><br/>
                    Royalti dari Distribusi Digital (transmisi elektronik/New Media)
                    <div className="mt-2">
                      <SubItem letter="a"><strong>ARTIS</strong> berhak mendapatkan royalti sebesar {contractData?.persentasePihakKedua || 20}% dari total yang diterima record label untuk peredaran rekaman audio serta Audio visual yang diedarkan secara distribusi digital (transmisi elektronik/New Media) yang dilakukan sendiri oleh <strong>PRODUSER EKSEKUTIF</strong> or dengan menunjuk MITRA KERJA untuk itu maupun atas lisensi yang diberikan oleh <strong>PRODUSER EKSEKUTIF</strong> sehubungan dengan peredaran Album atau single <strong>ARTIS</strong> dalam berbagai bentuk untuk kepentingan komersial.</SubItem>
                      <SubItem letter="b">Pembayaran royalty new media/media digital dilakukan berdasarkan penjualan bersih yang diterima <strong>PRODUSER EKSEKUTIF</strong> dari MITRA KERJA dari tiap-tiap penjualan setelah dikurangi terlebih dahulu dengan biaya-biaya distribusi yang dikeluarkan untuk itu baik di Indonesia maupun diluar wilayah hukum Indonesia.</SubItem>
                      <SubItem letter="c">Dalam hal <strong>ARTIS</strong> berkolaborasi dengan <strong>ARTIS</strong> lain dalam suatu single/album, maka dengan sendirinya royalti yang dibayarkan kepada <strong>ARTIS</strong> dari single/album rekaman dimaksud dibagi secara pro rata berdasarkan share.</SubItem>
                      <SubItem letter="d">Untuk peredaran single/album di luar wilayah hukum Republik Indonesia, royalti akan dibayarkan berdasarkan perhitungan harga dasar setiap negara selama jangka waktu perlindungan hak cipta yang ditetapkan oleh masing-masing Negara.</SubItem>
                    </div>
                  </LItem>
                  <LItem num="2">
                    <strong>PRODUSER EKSEKUTIF</strong> tidak mempunyai kewajiban membayar royalti atas peredaran produk rekaman dalam bentuk berikut ini:
                    <div className="mt-2">
                      <SubItem letter="a">Dibagikan secara cuma-cuma untuk tujuan promosi serta untuk memenuhi ketentuan perundang-undangan yang berlaku.</SubItem>
                      <SubItem letter="b">Distribusi produk rekaman untuk digunakan di alat transportasi, ditempat umum dan lain-lainnya untuk tujuan promosi.</SubItem>
                      <SubItem letter="c">Penjualan untuk cuci gudang atau untuk didaur ulang.</SubItem>
                    </div>
                  </LItem>
                  <LItem num="3">
                    <strong>Ketentuan Perpajakan</strong>
                    <div className="mt-2">
                      <SubItem letter="a">Semua pembayaran royalti kepada <strong>ARTIS</strong> harus dikurangi pajak penghasilan sesuai dengan peraturan yang berlaku. Pajak penghasilan atas royalti yang ditetapkan pemerintah Indonesia pada saat surat <strong>PERJANJIAN</strong> ini.</SubItem>
                      <SubItem letter="b">Semua pembayaran royalti yang diterima <strong>ARTIS</strong> atas penjualan produk rekaman di luar wilayah hukum Republik Indonesia dengan sendirinya dikurangi pajak penghasilan yang besarnya berdasarkan peraturan pemerintah pada masing-masing negara.</SubItem>
                    </div>
                  </LItem>
    
                  {/* PASAL 8 */}
                  <Pasal num="8" title="Royalty Statement" />
                  <LItem num="1"><strong>PRODUSER EKSEKUTIF</strong> terikat untuk memberikan laporan penjualan dan melakukan pembayaran royalti kepada <strong>ARTIS</strong> setiap 4 (empat) bulan terhitung dari tanggal pertama kali album/single rekaman diedarkan secara komersial.</LItem>
                  <LItem num="2">Untuk peredaran album rekaman di wilayah hukum Republik Indonesia, <strong>PRODUSER EKSEKUTIF</strong> terikat untuk membayarkan royalti berdasarkan setiap album atau single rekaman yang terjual dalam berbagai media penghantar suara.</LItem>
    
                  {/* PASAL 9 */}
                  <Pasal num="9" title="Penyelenggaraan Kegiatan On Air dan Off air" />
                  <LItem num="1">Pelaksanaan Ketentuan mengenai kegiatan Off Air dan On Air termasuk pengelolaan Merchandise dari icon <strong>ARTIS</strong> termasuk hal-hal lain yang menyangkut sisi keartisan dari pada <strong>ARTIS</strong>, akan diatur lebih lanjut oleh <strong>PARA PIHAK</strong> secara terpisah dalam <strong>PERJANJIAN</strong> pengelolaan Manajemen <strong>ARTIS</strong>. Selanjutnya disepakati oleh <strong>PARA PIHAK</strong> bahwa pelaksanaan perjanjian kerjasama Artis Management tersebut merupakan kesatuan kesepakatan kerjasama diantara <strong>PARA PIHAK</strong> dan bagian yang tidak terpisahkan dengan <strong>PERJANJIAN</strong> ini.</LItem>
    
                  {/* PASAL 10 */}
                  <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <Pasal num="10" title="Pembayaran" />
                    <p className="text-justify leading-relaxed mb-4">
                      Dengan ini <strong>ARTIS</strong> meminta <strong>PRODUSER EKSEKUTIF</strong> untuk melakukan pembayaran royalti melalui rekening berikut ini:
                    </p>
                    <div style={{ border: '1px solid black', padding: '12px 16px', margin: '16px 0', width: 'fit-content' }}>
                      <div style={{ marginBottom: '4px' }}><strong>Nama: {contractData?.rekening_nama || 'AGUNG GUMILAR'}</strong></div>
                      <div style={{ marginBottom: '4px' }}><strong>Nomor rekening: {contractData?.rekening_nomor || '173-00-1407954-6'}</strong></div>
                      <div><strong>Nama bank: {contractData?.rekening_bank || 'MANDIRI'}</strong></div>
                    </div>
                  </div>
                  <p className="text-justify leading-relaxed mb-4">
                    Dengan demikian <strong>PRODUSER EKSEKUTIF</strong> mempunyai hak untuk menolak semua kewajiban pembayaran tunai maupun pembayaran pada pihak lain dalam bentuk apapun selain kepada rekening tersebut di atas.
                  </p>
    
                  {/* PASAL 11 */}
                  <Pasal num="11" title="Hak Opsi" />
                  <LItem num="1"><strong>PERJANJIAN</strong> ini mengatur bahwa <strong>PRODUSER EKSEKUTIF</strong> memiliki hak opsi atas pembuatan single tambahan minimal 1 (satu) Album atau single setelah berakhirnya <strong>PERJANJIAN</strong> ini, dengan ketentuan yang sama dengan yang diatur dalam <strong>PERJANJIAN</strong> ini. Dengan demikian <strong>ARTIS</strong> terikat untuk memberikan prioritas untuk membuat perjanjian berikutnya dengan <strong>PRODUSER EKSEKUTIF</strong>.</LItem>
                  <LItem num="2">Sepanjang dibutuhkan oleh <strong>PRODUSER EKSEKUTIF</strong>, selain ketentuan mengenai hak opsi sebagaimana dimaksud dalam ketentuan Pasal 11 ayat 1 diatas, <strong>ARTIS</strong> dapat memberikan tambahan jangka waktu <strong>PERJANJIAN</strong> kepada <strong>PRODUSER EKSEKUTIF</strong> apabila pilihan hak opsi sebagaimana dimaksud dalam ketentuan Pasal 11 ayat 1 diatas tidak diambil atau dimanfaatkan oleh <strong>PRODUSER EKSEKUTIF</strong>.</LItem>
                  <LItem num="3">Pengaturan mengenai hak opsi dalam <strong>PERJANJIAN</strong> ini tidak mengurangi hak <strong>PRODUSER EKSEKUTIF</strong> untuk mengedarkan album kompilasi lain yang seluruhnya terdiri dari <strong>LAGU-LAGU</strong> yang pernah direkam <strong>ARTIS</strong> dalam album/single rekaman sebagaimana dimaksud dalam <strong>PERJANJIAN</strong> ini tanpa kewajiban untuk memberitahukan terlebih dahulu dan memberikan pembayaran dimuka kepada <strong>ARTIS</strong>.</LItem>
    
                  {/* PASAL 12 */}
                  <Pasal num="12" title="Jaminan ARTIS" />
                  <p className="text-justify leading-relaxed mb-4">
                    <strong>ARTIS</strong> dengan ini memberikan jaminan kepada <strong>PRODUSER EKSEKUTIF</strong> baik atas nama group band maupun atas nama sendiri (pribadi) sebagai berikut:
                  </p>
                  <LItem num="1"><strong>ARTIS</strong> memberikan jaminan bahwa pada saat membuat <strong>PERJANJIAN</strong> ini sedang tidak terikat dengan <strong>PERJANJIAN</strong> lain maupun kesepakatan-kesepakatan lain yang dapat mempengaruhi berbagai kewajiban yang timbul dari <strong>PERJANJIAN</strong> ini yang harus dipenuhi <strong>ARTIS</strong>. <strong>ARTIS</strong> memberikan jaminan bahwa <strong>PRODUSER EKSEKUTIF</strong> memiliki wewenang sepenuhnya untuk melakukan berbagai hak-hak yang timbul karena <strong>PERJANJIAN</strong> ini yang menjadi kewajiban <strong>ARTIS</strong> kepada <strong>PRODUSER EKSEKUTIF</strong>.</LItem>
                  <LItem num="2"><strong>ARTIS</strong> memberikan jaminan bahwa tidak akan memberi izin kepada pihak lain atau membuat kesepakatan dengan pihak lain mengenai hal-hal dan kepentingan-kepentingan <strong>ARTIS</strong> yang dapat mempengaruhi, menghambat, atau bertentangan dengan hak-hak yang dimiliki <strong>PRODUSER EKSEKUTIF</strong> berdasarkan <strong>PERJANJIAN</strong> ini. Dengan demikian <strong>ARTIS</strong> terikat untuk meminta persetujuan tertulis dari <strong>PRODUSER EKSEKUTIF</strong> atas setiap penampilan <strong>ARTIS</strong> dimuka umum maupun melalui media elektronik serta media cetak dan media lain yang dimungkinkan oleh teknologi.</LItem>
                  <LItem num="3"><strong>ARTIS</strong> menjamin <strong>PRODUSER EKSEKUTIF</strong> memiliki hak eksklusif atas nama profesi yang digunakan <strong>ARTIS</strong> dan memberikan kuasa mutlak yang tidak dapat dicabut kembali sepenuhnya kepada <strong>PRODUSER EKSEKUTIF</strong>, untuk menggunakan nama tersebut tanpa adanya tuntutan apapun dari pihak lain.</LItem>
                  <LItem num="4"><strong>ARTIS</strong> menjamin tidak akan ada tuntutan dari pihak ketiga dan membebaskan <strong>PRODUSER EKSEKUTIF</strong> dari segala tuntutan hukum atas <strong>LAGU-LAGU</strong> yang digunakan <strong>ARTIS</strong> dalam album rekaman sebagaimana yang dimaksud dalam <strong>PERJANJIAN</strong> ini.</LItem>
                  <LItem num="5">
                    <strong>ARTIS</strong> menjamin seluruh <strong>LAGU</strong> single dan/atau album rekaman bebas dari hal-hal berikut ini:
                    <div className="mt-2 mb-2">
                      <SubItem letter="a">Mendiskreditkan pemerintah</SubItem>
                      <SubItem letter="b">Memfitnah pihak-pihak lain</SubItem>
                      <SubItem letter="c">Terdapat unsur-unsur pornografi</SubItem>
                      <SubItem letter="d">Menyinggung keyakinan/perasaan pihak-pihak lain (SARA = Suku, Agama, Ras, Antar Golongan)</SubItem>
                      <SubItem letter="e">Dan lain-lain hal yang bertentangan dengan moral dan nilai-nilai normatif.</SubItem>
                    </div>
                    Dengan demikian <strong>ARTIS</strong> terikat untuk merevisi lirik <strong>LAGU</strong>, apabila terdapat salah satu atau beberapa hal tersebut diatas.
                  </LItem>
                  <LItem num="6"><strong>ARTIS</strong> memberikan jaminan untuk tidak akan melakukan kerjasama rekaman suara dengan pihak lain dalam jangka waktu 25 (dua puluh lima) tahun sejak tanggal awal peredaran Single/album yang diatur dalam <strong>PERJANJIAN</strong> ini dengan materi rekaman yang sama dengan album dimaksud. Termasuk di dalamnya menyanyikan <strong>LAGU</strong> yang sama, memainkan alat musik untuk <strong>LAGU</strong> yang sama, naskah pidato, naskah pewayangan, naskah komedi, naskah cerita maupun narasi yang sama.</LItem>
                  <LItem num="7"><strong>ARTIS</strong> memberikan jaminan akan sungguh-sungguh memenuhi kewajibannya sebagaimana diatur dalam <strong>PERJANJIAN</strong> ini dengan seluruh kemampuan yang dimilikinya secara maksimal, profesional dan kooperatif dalam mencapai tujuan <strong>PERJANJIAN</strong> ini, termasuk di dalamnya mendukung usaha pemasaran yang dilakukan oleh <strong>PRODUSER EKSEKUTIF</strong>, promosi serta kegiatan-kegiatan publikasi lainnya. <strong>ARTIS</strong> untuk itu berkewajiban memenuhi setiap jadwal yang ditetapkan <strong>PRODUSER EKSEKUTIF</strong> untuk kepentingan dimaksud serta secara terus menerus memberitahu <strong>PRODUSER EKSEKUTIF</strong> mengenai keberadaannya dan memberikan nomor telepon serta alamat yang dapat dihubungi. Selanjutnya <strong>ARTIS</strong> memberikan jaminan bahwa tidak akan melakukan kegiatan-kegiatan yang sifatnya melanggar hukum atau melanggar hak orang lain di negara manapun diseluruh dunia.</LItem>
                  <LItem num="8"><strong>ARTIS</strong> memberikan jaminan untuk tidak akan melakukan penampilan atau memberikan materi yang dapat digunakan untuk kerja kreatif (artwork) dan lain-lain yang dapat melibatkan <strong>PRODUSER EKSEKUTIF</strong> atau pihak lain yang berafiliasi dengan <strong>PRODUSER EKSEKUTIF</strong> atau pemegang lisensinya, pada kasus pidana, perdata serta pelanggaran-pelanggaran lain, serta menjamin untuk tidak melakukan hal-hal yang dapat menimbulkan citra negatif atau merusak reputasi <strong>PRODUSER EKSEKUTIF</strong>.</LItem>
                  <LItem num="9"><strong>ARTIS</strong> memberikan jaminan akan melalukan segala sesuatu yang dibutuhkan (secara maksimal) untuk memenuhi berbagai kewajiban yang timbul dari <strong>PERJANJIAN</strong> ini.</LItem>
                  <LItem num="10">Dengan ini <strong>ARTIS</strong> menyatakan telah mengizinkan <strong>PRODUSER EKSEKUTIF</strong> untuk menggunakan segala bentuk hak moral yang dimilikinya.</LItem>
                  <LItem num="11"><strong>ARTIS</strong> memberikan jaminan bahwa tidak pernah membuat rekaman suara maupun video untuk pihak ketiga yang belum diedarkan hingga <strong>PERJANJIAN</strong> ini dibuat, yang dapat diedarkan dikemudian hari.</LItem>
                  <LItem num="12"><strong>ARTIS</strong> memberikan jaminan untuk tidak akan memberitahukan kepada siapapun setiap rencana bisnis <strong>PRODUSER EKSEKUTIF</strong>, permasalahan keuangan atau informasi lain yang berhubungan dengan bisnis <strong>PRODUSER EKSEKUTIF</strong> serta tidak akan memberikan keterangan dan pemberitahuan mengenai ketentuan-ketentuan yang terdapat dalam <strong>PERJANJIAN</strong> ini tanpa izin tertulis dari <strong>PRODUSER EKSEKUTIF</strong>.</LItem>
                  <LItem num="13"><strong>ARTIS</strong> dengan ini menjamin untuk menghindarkan dan membebaskan <strong>PRODUSER EKSEKUTIF</strong> dari segala bentuk tuntutan dan akibat-akibat yang timbul karena perbuatan <strong>ARTIS</strong> baik berupa perusakan, kehilangan serta kerugian-kerugian yang timbul akibat adanya pelanggaran, tanggungan, jaminan yang ditandatangani atau dilakukan <strong>ARTIS</strong>. <strong>ARTIS</strong> dengan ini membebaskan <strong>PRODUSER EKSEKUTIF</strong> dari segala bentuk kerugian serta pengeluaran biaya-biaya (termasuk biaya-biaya hukum) yang timbul karena adanya tuntutan-tuntutan dimaksud.</LItem>
                  <LItem num="14"><strong>ARTIS</strong> telah cakap hukum dan tidak berada di bawah perwalian serta telah berusia melebihi 21 (dua puluh satu) tahun (notes jika berusia di bawah 21 tahun maka pasal ini dicabut dan yang menandatangani PERJANJIAN harus ayah atau pengampu ya).</LItem>
    
                  {/* PASAL 13 */}
                  <Pasal num="13" title="Penangguhan dan sangsi" />
                  <LItem num="1">Jika terjadi perselisihan/sengketa atas kepemilikan <strong>LAGU</strong> ciptaan dari <strong>ARTIS</strong> oleh pihak ketiga, maka <strong>PRODUSER EKSEKUTIF</strong> berhak sepenuhnya untuk menangguhkan seluruh kewajiban pembayaran yang diatur dalam <strong>PERJANJIAN</strong> ini baik pembayaran royalti dan lain-lain pembayaran sejenisnya, di mana penangguhan ini dilakukan hingga adanya penyelesaian sengketa kepemilikan tersebut secara tuntas baik melalui musyawarah maupun ketetapan hukum Pengadilan yang berkekuatan hukum tetap.</LItem>
                  <LItem num="2">Selain ketentuan dimaksud pasal 13 ayat 1 diatas, <strong>ARTIS</strong> dianggap telah melakukan pelanggaran terhadap <strong>PERJANJIAN</strong> ini apabila melalaikan salah satu saja dari pernyataan-pernyataan dan jaminannya, kewajiban-kewajiban dan hak eksklusif yang sudah diberikan kepada <strong>PRODUSER EKSEKUTIF</strong> sesuai didalam <strong>PERJANJIAN</strong> ini. Karenanya tanpa diperlukan ketetapan atau keputusan dari pengadilan, <strong>PRODUSER EKSEKUTIF</strong> berhak untuk menentukan sangsi-sangsi dan ganti rugi dan meminta pengembalian pembayaran-pembayaran yang sudah dilakukan kepada <strong>ARTIS</strong>, yang kesemuanya dapat dilakukan tanpa adanya somasi terlebih dahulu.</LItem>
                  <LItem num="3">Jika kemampuan <strong>ARTIS</strong> dalam melakukan penampilan mengalami penurunan secara jasmani maupun rohani, atau <strong>ARTIS</strong> dengan sengaja mengabaikan, menolak, serta menggagalkan semua bentuk kewajiban <strong>ARTIS</strong> sebagaimana yang dimaksud dalam <strong>PERJANJIAN</strong> ini, termasuk didalamnya jika terjadi pengunduran diri satu orang atau beberapa anggota atau pembubaran grup band yang diwakili <strong>ARTIS</strong> dalam <strong>PERJANJIAN</strong> ini, maka <strong>PRODUSER EKSEKUTIF</strong> disamping memiliki hak-hak untuk melakukan penangguhan dan lain-lain penyelesaian, mempunyai hak sepenuhnya untuk membatalkan <strong>PERJANJIAN</strong> ini secara tertulis. Dalam hal terjadi pembubaran group Band maka dengan sendirinya <strong>PRODUSER EKSEKUTIF</strong> memiliki hak sepenuhnya atas penggunaan nama <strong>ARTIS</strong> untuk album rekaman yang dibuat berdasarkan <strong>PERJANJIAN</strong> ini, dan mempunyai hak opsi untuk membuat <strong>PERJANJIAN</strong> baru dengan <strong>ARTIS</strong> yang mengikat nama baru dan perubahan personil yang dilakukan <strong>ARTIS</strong> setelah pembubaran group, sebagaimana diatur dalam ketentuan mengenai hak opsi dalam pasal 10 <strong>PERJANJIAN</strong> ini.</LItem>
                  <LItem num="4">Disepakati oleh <strong>PARA PIHAK</strong> bahwa <strong>PRODUSER EKSEKUTIF</strong> tidak memiliki kewajiban dalam bentuk apapun kepada <strong>ARTIS</strong> apabila album/single rekaman suara yang dihasilkan berdasarkan kerjasama dalam <strong>PERJANJIAN</strong> ini tidak berhasil di pasaran / tidak laku.</LItem>
                  <LItem num="5"><strong>PRODUSER EKSEKUTIF</strong> mempunyai hak untuk mengakhiri atau membatalkan <strong>PERJANJIAN</strong> ini atas alasan apapun dengan jangka waktu 1 (satu) bulan untuk menyampaikan pembatalan secara tertulis kepada <strong>ARTIS</strong>. Atas pembatalan tersebut <strong>PRODUSER EKSEKUTIF</strong> tidak lagi mempunyai berbagai kewajiban sebagaimana diatur dalam <strong>PERJANJIAN</strong> ini, kecuali kewajiban untuk membayar semua bentuk royalti kepada <strong>ARTIS</strong> sebagaimana diatur dalam pasal 7 <strong>PERJANJIAN</strong> ini atas setiap single/album yang diedarkan MUSIORA.</LItem>
                  <LItem num="6">Pembatalan <strong>PERJANJIAN</strong> sebagaimana yang dimaksud dalam ayat 5 diatas tidak mengurangi kepemilikan hak <strong>PRODUSER EKSEKUTIF</strong> atas Master rekaman suara yang dibuat berdasarkan <strong>PERJANJIAN</strong> ini yang telah selesai dikerjakan.</LItem>
                  <LItem num="7">Untuk maksud pelaksanaan ketentuan ayat 5 dan 6 diatas <strong>PARA PIHAK</strong> sepakat untuk mengesampingkan pelaksanaan ketentuan pasal 1266 dan 1267 KUH Perdata sepanjang diperlukannya putusan pengadilan untuk pengakhiran suatu <strong>PERJANJIAN</strong>.</LItem>
    
                  {/* PASAL 14 */}
                  <Pasal num="14" title="Ketentuan Tambahan" />
                  <LItem num="1">Setiap pemberitahuan, permohonan yang diajukan salah satu pihak harus diajukan secara tertulis dan dikirimkan secara langsung melalui jasa pengiriman surat (kurir), pos tercatat, facsimile ke alamat masing-masing pihak sebagaimana diatur dalam <strong>PERJANJIAN</strong> ini.</LItem>
                  <LItem num="2">Segala perubahan atas ketentuan yang terdapat dalam <strong>PERJANJIAN</strong> ini harus disepakati secara tertulis oleh <strong>PARA PIHAK</strong> dan dituangkan dalam suatu Adendum/Perjanjian Tambahan yang merupakan kesatuan dan bagian yang tidak terpisahkan dari <strong>PERJANJIAN</strong> ini.</LItem>
                  <LItem num="3">Apabila salah satu pihak membiarkan pihak lain melakukan pelanggaran atas salah satu ketentuan <strong>PERJANJIAN</strong> ini, tindakan pembiaran tersebut tidak dapat diartikan sebagai pelepasan hak dari pihak yang dirugikan untuk menuntut dipenuhinya ketentuan tersebut di kemudian hari.</LItem>
    
                  {/* PASAL 15 */}
                  <Pasal num="15" title="Keadaan Memaksa/Force Majeure" />
                  <LItem num="1">Yang dimaksud dengan Keadaan Memaksa adalah suatu keadaan di luar batas kekuasaan dan kemampuan <strong>PARA PIHAK</strong>, seperti bencana alam (gempa bumi, banjir, tanah longsor, angin topan), wabah penyakit/pandemi, huru-hara, pemogokan umum, perang, kebakaran, sabotase, kebijakan pemerintah di bidang moneter/ekonomi, yang menghambat atau menghalangi pelaksanaan kewajiban salah satu pihak berdasarkan <strong>PERJANJIAN</strong> ini.</LItem>
                  <LItem num="2">Pihak yang mengalami Keadaan Memaksa harus memberitahukan secara tertulis kepada pihak lainnya dalam jangka waktu paling lambat 7 (tujuh) hari kerja sejak terjadinya Keadaan Memaksa tersebut, disertai bukti-bukti yang sah dari pihak yang berwenang.</LItem>
                  <LItem num="3">Keterlambatan atau kelalaian dalam menyampaikan pemberitahuan sebagaimana dimaksud ayat 2 di atas mengakibatkan tidak diakuinya keadaan tersebut sebagai Keadaan Memaksa, dan pihak yang bersangkutan tetap bertanggung jawab atas pelaksanaan kewajibannya.</LItem>
    
                  {/* PASAL 16 */}
                  <Pasal num="16" title="Penyelesaian Perselisihan" />
                  <LItem num="1"><strong>PERJANJIAN</strong> ini diatur dan tunduk pada hukum dan peraturan perundang-undangan Negara Republik Indonesia.</LItem>
                  <LItem num="2">Semua perselisihan yang mungkin terjadi akan diselesaikan secara musyawarah untuk mencapai mufakat oleh <strong>PARA PIHAK</strong>.</LItem>
                  <LItem num="3">Apabila jalan musyawarah tidak tercapai maka akan diselesaikan secara hukum di Pengadilan Negeri Bandung.</LItem>
    
                  {/* PASAL 17 */}
                  <Pasal num="17" title="KUASA" />
                  <p className="text-justify leading-relaxed mb-4">
                    Untuk kepentingan pendaftaran <strong>LAGU</strong>, pembuatan kontrak, penyiaran sehubungan dengan komersialisasi melalui digital distribution (Transmisi elektronik/New Media) DSP (Digital Store Platform) Ring BackTone atau perangkat lainnya dalam bentuk apapun maka dengan ini <strong>ARTIS</strong> memberikan kuasa penuh yang tidak dapat dicabut kembali kepada <strong>PRODUSER EKSEKUTIF</strong> untuk mengambil manfaat dan hak ekonomis atas <strong>LAGU</strong>.
                  </p>
    
                  {/* PASAL 18 */}
                  <Pasal num="18" title="Penutup" />
                  <LItem num="1"><strong>PERJANJIAN</strong> ini dibuat rangkap dua, masing-masing bermaterai cukup dan memiliki kekuatan hukum yang sama.</LItem>
    
                </div>
    
                {/* Signature Area strictly following the reference image layout */}
                <div className="mt-12 text-[11pt] break-inside-avoid">
                  <p className="uppercase" style={{ marginBottom: '40px' }}>{contractData?.tempatTtd || 'TASIKMALAYA'}, {contractData?.tanggalCetak || '12 September 2025'}</p>

                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '64px' }}>
                      <div style={{ width: '45%', textAlign: 'center' }}>
                        <p style={{ fontWeight: 'bold' }}>PIHAK PERTAMA</p>
                        <p style={{ fontWeight: 'bold' }}>{contractData?.pihak1_perusahaan || 'MYD RECORDS INDONESIA'}</p>
                        <p style={{ fontSize: '9pt', color: '#666', marginTop: '16px', marginBottom: '0px' }}>Materai Rp10.000</p>
                        <SignHint />
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{contractData?.pihak1_wakil || 'Yadi Supriyadi'}</p>
                        <p>Jabatan: {contractData?.pihak1_jabatan || 'Direktur Utama'}</p>
                      </div>
                      <div style={{ width: '45%', textAlign: 'center' }}>
                        <p style={{ fontWeight: 'bold' }}>PIHAK KEDUA</p>
                        <p style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{contractData?.pihak2_alias || 'ARTIS'}</p>
                        <p style={{ fontSize: '9pt', color: '#666', marginTop: '16px', marginBottom: '0px' }}>Materai Rp10.000</p>
                        <SignHint />
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{contractData?.pihak2_nama || 'AGUNG GUMILAR'}</p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '32px' }}>SAKSI MENGETAHUI,</p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 60px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <SignHint />
                          <p style={{ fontWeight: 'bold' }}>({contractData?.saksi1 || 'Adi Dwi Haryanto'})</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <SignHint />
                          <p style={{ fontWeight: 'bold' }}>({contractData?.saksi2 || 'Andri Melandi'})</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}</div>
      </div>
    </div>
    </div>
  );
}
