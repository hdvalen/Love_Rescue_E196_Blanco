const path = require('path');
const fs = require('fs');

const BASE_UPLOADS = path.join(__dirname, '../../uploads');

const SUBDIRS = {
    foto_mascota:   'mascotas/fotos',
    foto_perfil:    'usuarios/perfiles',
    logo_fundacion: 'fundaciones/logos',
    doc_solicitud:  'solicitudes/documentos',
    contrato:       'contratos',
};

const ALL_SUBDIRS = Object.values(SUBDIRS);

function getUploadPath(tipo) {
    const sub = SUBDIRS[tipo];
    if (!sub) {
        return BASE_UPLOADS;
    }
    const dir = path.join(BASE_UPLOADS, sub);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

function resolveFilePath(filename) {
    const basename = path.basename(filename);

    for (const sub of ALL_SUBDIRS) {
        const fullPath = path.join(BASE_UPLOADS, sub, basename);
        if (fs.existsSync(fullPath)) return fullPath;
    }

    const legacyPath = path.join(BASE_UPLOADS, basename);
    if (fs.existsSync(legacyPath)) return legacyPath;

    return null;
}

function deleteFile(filename) {
    const resolved = resolveFilePath(filename);
    if (resolved) {
        fs.unlinkSync(resolved);
        return true;
    }
    return false;
}

module.exports = { getUploadPath, resolveFilePath, deleteFile, SUBDIRS, BASE_UPLOADS };
