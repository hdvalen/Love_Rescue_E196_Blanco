const fotoMascotaService = require('../services/foto_mascota.service');
const { resizeImage } = require('../../../utils/imageResizer');

const uploadFotos = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'No se han proporcionado archivos'
            });
        }

        const fotos = [];
        for (const file of req.files) {
            await resizeImage(file.path, 'pet');
            const foto = await fotoMascotaService.createFoto(id, file);
            fotos.push(foto);
        }

        res.status(201).json({
            ok: true,
            fotos
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};

const remove = async (req, res) => {
    try {
        await fotoMascotaService.deleteFoto(req.params.fotoId);

        res.json({
            ok: true,
            message: 'Foto eliminada correctamente'
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};

module.exports = {
    uploadFotos,
    remove
};
