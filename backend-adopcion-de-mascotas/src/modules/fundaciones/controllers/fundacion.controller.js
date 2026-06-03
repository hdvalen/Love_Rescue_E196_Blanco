const fundacionService = require('../services/fundacion.service');
const Fundacion = require('../models/fundacion.model');
const { resizeImage } = require('../../../utils/imageResizer');
const { deleteFile } = require('../../../utils/pathResolver');

const create = async (req, res) => {

    try {

        const data = {
            ...req.body,
            id_usuario: req.user.id_usuario
        };

        const fundacion = await fundacionService.createFundacion(data);

        res.status(201).json({
            ok: true,
            fundacion
        });

    } catch (error) {

        res.status(400).json({
            ok: false,
            message: error.message
        });

    }

};

const getAll = async (req, res) => {

    try {

        const fundaciones = await fundacionService.getFundaciones(req.query);

        res.json({
            ok: true,
            fundaciones
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        });

    }

};

const getById = async (req, res) => {

    try {

        const fundacion = await fundacionService.getFundacionById(
            req.params.id,
            req.query.publico === 'true'
        );

        if (!fundacion) {
            return res.status(404).json({
                ok: false,
                message: 'Fundación no encontrada'
            });
        }

        res.json({
            ok: true,
            fundacion
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        });

    }

};

const update = async (req, res) => {

    try {

        const fundacion = await fundacionService.updateFundacion(
            req.params.id,
            req.body
        );

        res.json({
            ok: true,
            fundacion
        });

    } catch (error) {

        res.status(400).json({
            ok: false,
            message: error.message
        });

    }

};

const aprobar = async (req, res) => {

    try {

        const { motivo_rechazo } = req.body;

        const fundacion = await fundacionService.aprobarFundacion(
            req.params.id,
            motivo_rechazo
        );

        const message = motivo_rechazo ? 'Fundación rechazada' : 'Fundación aprobada';

        res.json({
            ok: true,
            message,
            fundacion
        });

    } catch (error) {

        res.status(400).json({
            ok: false,
            message: error.message
        });

    }

};

const uploadLogo = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                ok: false,
                message: 'No se ha proporcionado un archivo'
            });
        }

        const current = await Fundacion.findByPk(req.params.id, { attributes: ['logo_url'] });
        if (current?.logo_url) {
            deleteFile(current.logo_url);
        }

        await resizeImage(req.file.path, 'logo');

        const fundacion = await fundacionService.updateFundacion(
            req.params.id,
            { logo_url: req.file.filename }
        );

        res.json({
            ok: true,
            message: 'Logo subido correctamente',
            fundacion
        });

    } catch (error) {

        res.status(400).json({
            ok: false,
            message: error.message
        });

    }
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    aprobar,
    uploadLogo
};