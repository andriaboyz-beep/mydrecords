const { execSync } = require('child_process');
const fs = require('fs');

// We need to find the image file!
// But wait, the image is passed via req.file, which is a temporary buffer or file.
// The server deletes it after scanning: if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
// So I don't have the image file on disk!
