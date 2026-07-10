const fs = require('fs');

const rawLog = fs.readFileSync('/tmp/ocr_log.txt', 'utf8');

const blocks = rawLog.split('--- OCR RAW LOG');
for (const block of blocks) {
  if (!block.trim()) continue;
  const match = block.match(/Text:\n([\s\S]*?)---/);
  if (!match) continue;
  const text = match[1];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let parsedNik = '';
  const digitsLine = lines.map(l => l.replace(/\D/g, '')).find(d => d.length >= 14);
  if (digitsLine) {
    parsedNik = digitsLine.substring(0, 16);
  }
  
  let parsedNama = '';
  const namaIdx = lines.findIndex(l => l.toUpperCase().replace(/\s/g, '').includes('NAMA'));
  if (namaIdx !== -1) {
    let line = lines[namaIdx];
    let afterNama = '';
    if (line.includes(':')) {
      afterNama = line.split(':').slice(1).join(':').trim();
    } else {
      afterNama = line.replace(/.*N\s*A\s*M\s*A/i, '').replace(/^[^A-Za-z]*/, '').trim();
    }
    
    if (afterNama.length > 2) {
      parsedNama = afterNama.replace(/[^A-Za-z .\-']/g, '').trim().toUpperCase();
    } else if (namaIdx + 1 < lines.length) {
      parsedNama = lines[namaIdx+1].replace(/[^A-Za-z .\-']/g, '').trim().toUpperCase();
    }
  }

  if (!parsedNama && parsedNik) {
    const nikIdxForNama = lines.findIndex(l => l.replace(/\D/g, '').includes(parsedNik));
    if (nikIdxForNama !== -1 && nikIdxForNama + 1 < lines.length) {
      let possibleNama = lines[nikIdxForNama + 1];
      if (!possibleNama.toUpperCase().includes('LAHIR') && !possibleNama.toUpperCase().includes('TEMPAT')) {
         parsedNama = possibleNama.replace(/[^A-Za-z .\-']/g, '').trim().toUpperCase();
      }
    }
  }

  if (parsedNama) {
     parsedNama = parsedNama.replace(/^N\s*A\s*M\s*A\s*/i, '').trim();
     parsedNama = parsedNama.replace(/^:\s*/, '').trim();
  }
  
  console.log("File block parsed:");
  console.log("NIK:", parsedNik);
  console.log("NAMA:", parsedNama);
  console.log("------------");
}
