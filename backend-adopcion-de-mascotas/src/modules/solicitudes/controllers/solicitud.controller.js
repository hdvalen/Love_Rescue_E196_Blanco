const solicitudService = require('../services/solicitud.service');

const create = async (req, res) => {
    try {
        const { id_mascota, motivo, datos_adoptante } = req.body;

        const solicitud = await solicitudService.createSolicitud({
            id_usuario: req.user.id_usuario,
            id_mascota,
            motivo,
            datos_adoptante: datos_adoptante ? JSON.stringify(datos_adoptante) : null,
            nombre_adoptante: req.user.nombre
        });

        res.status(201).json({ ok: true, solicitud });
    } catch (error) {
        res.status(400).json({ ok: false, message: error.message });
    }
};

const getAll = async (req, res) => {
    try {
        const filters = { ...req.query };

        if (req.user.id_rol === 3) {
            filters.id_usuario = req.user.id_usuario;
        }

        if (req.user.id_rol === 2) {
            const id_fundacion = await solicitudService.getFundacionIdByUserId(req.user.id_usuario);
            if (id_fundacion) {
                filters.id_fundacion = id_fundacion;
            } else {
                return res.json({ ok: true, solicitudes: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
            }
        }

        const result = await solicitudService.getSolicitudes(filters);
        res.json({ ok: true, solicitudes: result.solicitudes, pagination: result.pagination });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const solicitud = await solicitudService.getSolicitudById(req.params.id);
        res.json({ ok: true, solicitud });
    } catch (error) {
        const status = error.message === 'Solicitud no encontrada' ? 404 : 400;
        res.status(status).json({ ok: false, message: error.message });
    }
};

const ponerEnEvaluacion = async (req, res) => {
    try {
        const solicitud = await solicitudService.ponerEnEvaluacion(
            req.params.id,
            req.user.id_usuario
        );

        res.json({ ok: true, message: 'Solicitud en evaluación', solicitud });
    } catch (error) {
        res.status(400).json({ ok: false, message: error.message });
    }
};

const ponerEnSeguimiento = async (req, res) => {
    try {
        const solicitud = await solicitudService.ponerEnSeguimiento(
            req.params.id,
            req.user.id_usuario
        );

        res.json({ ok: true, message: 'Solicitud en seguimiento', solicitud });
    } catch (error) {
        res.status(400).json({ ok: false, message: error.message });
    }
};

const finalizar = async (req, res) => {
    try {
        const result = await solicitudService.finalizarAdopcion(
            req.params.id,
            req.user.id_usuario
        );

        res.json({ ok: true, message: 'Adopción finalizada exitosamente', ...result });
    } catch (error) {
        res.status(400).json({ ok: false, message: error.message });
    }
};

const cancelar = async (req, res) => {
    try {
        const { motivo } = req.body;
        const solicitud = await solicitudService.cancelarSolicitud(
            req.params.id,
            req.user.id_usuario,
            motivo
        );
        res.json({ ok: true, message: 'Solicitud cancelada correctamente', solicitud });
    } catch (error) {
        const status = error.message === 'Solicitud no encontrada' ? 404 : 403;
        res.status(status).json({ ok: false, message: error.message });
    }
};

const aprobar = async (req, res) => {
    try {
        const { respuesta, cambiar_estado_mascota } = req.body;

        const solicitud = await solicitudService.aprobarSolicitud(
            req.params.id,
            respuesta,
            cambiar_estado_mascota === true,
            req.user.id_usuario
        );

        res.json({ ok: true, message: 'Solicitud aprobada', solicitud });
    } catch (error) {
        res.status(400).json({ ok: false, message: error.message });
    }
};

const rechazar = async (req, res) => {
    try {
        const { respuesta } = req.body;

        const solicitud = await solicitudService.rechazarSolicitud(
            req.params.id,
            respuesta,
            req.user.id_usuario
        );

        res.json({ ok: true, message: 'Solicitud rechazada', solicitud });
    } catch (error) {
        res.status(400).json({ ok: false, message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        await solicitudService.deleteSolicitud(req.params.id);
        res.json({ ok: true, message: 'Solicitud eliminada correctamente' });
    } catch (error) {
        res.status(400).json({ ok: false, message: error.message });
    }
};

module.exports = {
    create,
    getAll,
    getById,
    ponerEnEvaluacion,
    ponerEnSeguimiento,
    aprobar,
    rechazar,
    finalizar,
    cancelar,
    remove
};
