const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { getUploadPath } = require('./pathResolver');

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf', '.doc', '.docx',
]);

function detectTipo(req) {
    const p = req.baseUrl + req.path;
    if (p.includes('/mascotas/') && p.includes('/fotos')) return 'foto_mascota';
    if (p.includes('/fundaciones/') && p.includes('/logo')) return 'logo_fundacion';
    if (p.includes('/usuarios/') && p.includes('/foto')) return 'foto_perfil';
    if (p.includes('/solicitudes/') && p.includes('/documentos')) return 'doc_solicitud';
    return null;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tipo = detectTipo(req);
        const dir = getUploadPath(tipo);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const randomName = crypto.randomBytes(16).toString('hex');
        cb(null, `${Date.now()}-${randomName}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const extOk = ALLOWED_EXTENSIONS.has(ext);
    const mimeOk = ALLOWED_MIME_TYPES.has(file.mimetype);

    if (extOk && mimeOk) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP) y documentos (PDF, DOC, DOCX)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
