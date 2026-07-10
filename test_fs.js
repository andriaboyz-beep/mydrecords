const fs = require('fs');
const { execSync } = require('child_process');

const imgPath = '/tmp/ocr/test.jpg';
if (!fs.existsSync('/tmp/ocr')) fs.mkdirSync('/tmp/ocr', { recursive: true });
fs.writeFileSync(imgPath, 'test', 'utf8');

console.log("Exists after write?", fs.existsSync(imgPath));

try {
  execSync(`tesseract "${imgPath}" stdout -l ind --psm 6 2>/dev/null`);
} catch(e) {
  console.log("Tess failed:", e.message);
}

console.log("Exists after tess?", fs.existsSync(imgPath));
