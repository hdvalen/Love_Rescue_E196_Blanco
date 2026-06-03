const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SIZES = {
    pet: { width: 800, height: 800 },
    logo: { width: 300, height: 300 },
    profile: { width: 400, height: 400 },
    documento: { width: 1200, height: 1200 }
};

async function resizeImage(filePath, sizeKey) {
    const size = SIZES[sizeKey];
    if (!size) return;

    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) return;

    const tmpPath = filePath + '.tmp';

    await sharp(filePath)
        .resize(size.width, size.height, { fit: 'inside', withoutEnlargement: true })
        .toFile(tmpPath);

    fs.unlinkSync(filePath);
    fs.renameSync(tmpPath, filePath);
}

module.exports = { resizeImage, SIZES };
