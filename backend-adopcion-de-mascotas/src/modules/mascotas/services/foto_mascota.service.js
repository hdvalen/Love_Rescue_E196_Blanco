const path = require('path');
const fs = require('fs');

const FotoMascota = require('../models/foto_mascota.model');
const { resolveFilePath, getUploadPath } = require('../../../utils/pathResolver');

const createFoto = async (idMascota, file) => {
    if (!file) {
        throw new Error('No se ha proporcionado un archivo');
    }

    const foto = await FotoMascota.create({
        id_mascota: idMascota,
        nombre_archivo: file.filename
    });

    return foto;
};

const getFotosByMascota = async (idMascota) => {
    return await FotoMascota.findAll({
        where: { id_mascota: idMascota, estado: 1 }
    });
};

const deleteFoto = async (id) => {
    const foto = await FotoMascota.findByPk(id);

    if (!foto) {
        throw new Error('Foto no encontrada');
    }

    const resolved = resolveFilePath(foto.nombre_archivo);
    if (resolved) {
        fs.unlinkSync(resolved);
    }

    await foto.update({ estado: 0 });

    return foto;
};

module.exports = {
    createFoto,
    getFotosByMascota,
    deleteFoto
};
