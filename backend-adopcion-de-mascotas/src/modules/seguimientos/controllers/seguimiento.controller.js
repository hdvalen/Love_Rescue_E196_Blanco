const seguimientoService = require('../services/seguimiento.service');

const create = async (req, res) => {
    try {
        const { id_solicitud, tipo, tipo_visita, descripcion, proximo_contacto } = req.body;

        if (!id_solicitud || !tipo || !descripcion) {
            return res.status(400).json({
                ok: false,
                message: 'La solicitud, tipo y descripción son requeridos'
            });
        }

        const payload = {
            id_solicitud,
            id_usuario: req.user.id_usuario,
            tipo,
            descripcion,
            proximo_contacto: proximo_contacto || null
        };
        if (tipo === 'VISITA' && tipo_visita) {
            payload.tipo_visita = tipo_visita;
        }

        const seguimiento = await seguimientoService.createSeguimiento(payload);

        res.status(201).json({
            ok: true,
            seguimiento
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
        const filters = {};

        if (req.query.id_solicitud) {
            filters.id_solicitud = req.query.id_solicitud;
        }

        if (req.query.estado_seguimiento) {
            filters.estado_seguimiento = req.query.estado_seguimiento;
        }

        const seguimientos = await seguimientoService.getSeguimientos(filters);

        res.json({
            ok: true,
            seguimientos
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
        const seguimiento = await seguimientoService.getSeguimientoById(
            req.params.id
        );

        res.json({
            ok: true,
            seguimiento
        });
    } catch (error) {
        res.status(404).json({
            ok: false,
            message: error.message
        });
    }
};

const update = async (req, res) => {
    try {
        const seguimiento = await seguimientoService.updateSeguimiento(
            req.params.id,
            req.body
        );

        res.json({
            ok: true,
            seguimiento
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};

const complete = async (req, res) => {
    try {
        const { observaciones } = req.body;

        const seguimiento = await seguimientoService.completeSeguimiento(
            req.params.id,
            observaciones
        );

        res.json({
            ok: true,
            message: 'Seguimiento completado',
            seguimiento
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
        await seguimientoService.deleteSeguimiento(req.params.id);

        res.json({
            ok: true,
            message: 'Seguimiento eliminado correctamente'
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};

const getMisSeguimientos = async (req, res) => {
    try {
        const seguimientos = await seguimientoService.getSeguimientosByUserId(req.user.id_usuario);
        res.json({ ok: true, seguimientos });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    complete,
    remove,
    getMisSeguimientos
};
