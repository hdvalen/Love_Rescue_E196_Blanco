const notificacionService = require('../services/notificacion.service');

const create = async (req, res) => {
    try {
        const { id_usuario, titulo, mensaje, tipo, id_solicitud } = req.body;

        if (!id_usuario || !titulo || !mensaje) {
            return res.status(400).json({
                ok: false,
                message: 'Usuario, título y mensaje son requeridos'
            });
        }

        const notificacion = await notificacionService.createNotificacion({
            id_usuario,
            titulo,
            mensaje,
            tipo: tipo || 'SISTEMA',
            id_solicitud
        });

        res.status(201).json({
            ok: true,
            notificacion
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
        const result = await notificacionService.getNotificaciones(
            req.user.id_usuario,
            req.query
        );

        res.json({
            ok: true,
            notificaciones: result.notificaciones,
            pagination: result.pagination
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
        const notificacion = await notificacionService.getNotificacionById(
            req.params.id,
            req.user.id_usuario
        );

        res.json({
            ok: true,
            notificacion
        });
    } catch (error) {
        res.status(404).json({
            ok: false,
            message: error.message
        });
    }
};

const marcarLeida = async (req, res) => {
    try {
        const notificacion = await notificacionService.marcarLeida(
            req.params.id,
            req.user.id_usuario
        );

        res.json({
            ok: true,
            notificacion
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};

const marcarTodasLeidas = async (req, res) => {
    try {
        const result = await notificacionService.marcarTodasLeidas(
            req.user.id_usuario
        );

        res.json({
            ok: true,
            message: result.message
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

const remove = async (req, res) => {
    try {
        await notificacionService.deleteNotificacion(
            req.params.id,
            req.user.id_usuario
        );

        res.json({
            ok: true,
            message: 'Notificación eliminada'
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
    marcarLeida,
    marcarTodasLeidas,
    remove
};
