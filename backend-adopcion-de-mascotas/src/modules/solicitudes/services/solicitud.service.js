const { Op } = require('sequelize');
const sequelize = require('../../../config/db');

const Solicitud = require('../models/solicitud.model');
const Mascota = require('../../mascotas/models/mascota.model');
const User = require('../../users/models/user.model');
const Fundacion = require('../../fundaciones/models/fundacion.model');
const PerfilAdoptante = require('../../users/models/perfil_adoptante.model');
const Notificacion = require('../../notificaciones/models/notificacion.model');
const Seguimiento = require('../../seguimientos/models/seguimiento.model');
const SolicitudHistorial = require('../models/solicitud_historial.model');
const { getPagination, getPaginationResponse } = require('../../../utils/pagination');

async function registrarHistorial(idSolicitud, estadoAnterior, estadoNuevo, usuarioResponsable, motivo = null, transaction = null) {
  const options = transaction ? { transaction } : {};
  await SolicitudHistorial.create({
    id_solicitud: idSolicitud,
    estado_anterior: estadoAnterior,
    estado_nuevo: estadoNuevo,
    usuario_responsable: usuarioResponsable,
    fecha: new Date(),
    motivo
  }, options);
}

const VALID_TRANSITIONS = {
    'PENDIENTE': ['EN_EVALUACION', 'RECHAZADA'],
    'EN_EVALUACION': ['APROBADA', 'RECHAZADA'],
    'APROBADA': ['EN_SEGUIMIENTO', 'ADOPTADA'],
    'EN_SEGUIMIENTO': ['ADOPTADA'],
};

const SOLICITUD_INCLUDES = [
    {
        model: User,
        attributes: ['id_usuario', 'nombre', 'email', 'telefono', 'foto_url'],
        include: [{
            model: PerfilAdoptante,
            attributes: ['housing_type', 'has_patio', 'hours_alone', 'experience', 'family_composition']
        }]
    },
    {
        model: Mascota,
        attributes: ['id_mascota', 'nombre', 'especie', 'raza', 'edad', 'sexo']
    },
    {
        model: Fundacion,
        attributes: ['id_fundacion', 'nombre_fundacion', 'ciudad', 'telefono']
    }
];

const getFundacionIdByUserId = async (id_usuario) => {
    const fundacion = await Fundacion.findOne({
        where: { id_usuario, estado: 1 }
    });
    return fundacion ? fundacion.id_fundacion : null;
};

const createSolicitud = async (data) => {
    const mascota = await Mascota.findByPk(data.id_mascota);

    if (!mascota || mascota.estado === 0) {
        throw new Error('Mascota no encontrada');
    }

    if (mascota.estado_mascota !== 'DISPONIBLE') {
        throw new Error('La mascota no está disponible para adopción');
    }

    const existing = await Solicitud.findOne({
        where: {
            id_usuario: data.id_usuario,
            id_mascota: data.id_mascota,
            estado_solicitud: ['PENDIENTE', 'EN_EVALUACION'],
            estado: 1
        }
    });

    if (existing) {
        throw new Error('Ya tienes una solicitud activa para esta mascota');
    }

    const transaction = await sequelize.transaction();

    try {
        const solicitud = await Solicitud.create({
            id_usuario: data.id_usuario,
            id_mascota: data.id_mascota,
            id_fundacion: mascota.id_fundacion,
            motivo: data.motivo,
            datos_adoptante: data.datos_adoptante || null
        }, { transaction });

        const fundacion = await Fundacion.findByPk(mascota.id_fundacion, { transaction });
        const notificacionUserId = fundacion?.id_usuario || null;

        if (notificacionUserId) {
            await Notificacion.create({
                id_usuario: notificacionUserId,
                id_solicitud: solicitud.id_solicitud,
                titulo: 'Nueva solicitud de adopción',
                mensaje: `${data.nombre_adoptante || 'Un usuario'} ha solicitado adoptar a ${mascota.nombre}`,
                tipo: 'SOLICITUD'
            }, { transaction });
        }

        await registrarHistorial(solicitud.id_solicitud, null, 'PENDIENTE', data.id_usuario, data.motivo, transaction);
        await transaction.commit();
        return solicitud;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getSolicitudes = async (filters) => {
    const where = { estado: 1 };

    if (filters.estado_solicitud) {
        where.estado_solicitud = filters.estado_solicitud;
    } else if (filters.estado) {
        where.estado_solicitud = filters.estado;
    }

    if (filters.id_usuario) {
        where.id_usuario = filters.id_usuario;
    }

    if (filters.id_fundacion) {
        where.id_fundacion = filters.id_fundacion;
    }

    if (filters.fecha) {
        where.fecha_solicitud = {
            [Op.startsWith]: filters.fecha
        };
    }

    if (filters.fecha_desde) {
        where.fecha_solicitud = {
            ...where.fecha_solicitud,
            [Op.gte]: new Date(filters.fecha_desde)
        };
    }

    if (filters.fecha_hasta) {
        where.fecha_solicitud = {
            ...where.fecha_solicitud,
            [Op.lte]: new Date(filters.fecha_hasta + 'T23:59:59')
        };
    }

    const includes = [...SOLICITUD_INCLUDES];

    if (filters.search) {
        includes[0] = {
            ...includes[0],
            where: {
                nombre: { [Op.like]: `%${filters.search}%` }
            }
        };
    }

    const { page, limit, offset } = getPagination(filters);

    const { count, rows } = await Solicitud.findAndCountAll({
        where,
        include: includes,
        offset,
        limit,
        distinct: true
    });

    return {
        solicitudes: rows,
        pagination: getPaginationResponse(count, page, limit)
    };
};

const getSolicitudById = async (id) => {
    const solicitud = await Solicitud.findByPk(id, {
        include: SOLICITUD_INCLUDES
    });

    if (!solicitud || solicitud.estado === 0) {
        throw new Error('Solicitud no encontrada');
    }

    return solicitud;
};

const ponerEnEvaluacion = async (id, respondidoPor) => {
    const solicitud = await Solicitud.findByPk(id, {
        include: [{ model: Mascota, attributes: ['nombre'] }]
    });

    if (!solicitud || solicitud.estado === 0) {
        throw new Error('Solicitud no encontrada');
    }

    if (!VALID_TRANSITIONS[solicitud.estado_solicitud]?.includes('EN_EVALUACION')) {
        throw new Error('No se puede mover a Evaluación desde el estado actual');
    }

    const transaction = await sequelize.transaction();

    try {
        await solicitud.update({
            estado_solicitud: 'EN_EVALUACION',
            fecha_respuesta: new Date(),
            respondido_por: respondidoPor || null
        }, { transaction });

        await Notificacion.create({
            id_usuario: solicitud.id_usuario,
            id_solicitud: solicitud.id_solicitud,
            titulo: 'Solicitud en evaluación',
            mensaje: `Tu solicitud para ${solicitud.Mascota?.nombre || 'la mascota'} ha pasado a evaluación`,
            tipo: 'SOLICITUD'
        }, { transaction });

        await registrarHistorial(id, solicitud.estado_solicitud, 'EN_EVALUACION', respondidoPor, null, transaction);
        await transaction.commit();

        try {
            const emailUtil = require('../../utils/email');
            emailUtil.sendEventEmail(solicitud.id_usuario, 'Solicitud en evaluación', [
                `Tu solicitud para adoptar a ${solicitud.Mascota?.nombre || 'la mascota'} ha pasado a etapa de evaluación.`,
                'La fundación revisará tu información y te contactará pronto.'
            ]);
        } catch (_) {}

        return solicitud;
    } catch (error) {
        try { await transaction.rollback(); } catch {}
        throw error;
    }
};

const ponerEnSeguimiento = async (id, respondidoPor) => {
    const solicitud = await Solicitud.findByPk(id, {
        include: [{ model: Mascota, attributes: ['nombre'] }]
    });

    if (!solicitud || solicitud.estado === 0) {
        throw new Error('Solicitud no encontrada');
    }

    if (!VALID_TRANSITIONS[solicitud.estado_solicitud]?.includes('EN_SEGUIMIENTO')) {
        throw new Error('No se puede mover a Seguimiento desde el estado actual');
    }

    const transaction = await sequelize.transaction();

    try {
        await solicitud.update({
            estado_solicitud: 'EN_SEGUIMIENTO',
            fecha_respuesta: new Date(),
            respondido_por: respondidoPor || null
        }, { transaction });

        await Notificacion.create({
            id_usuario: solicitud.id_usuario,
            id_solicitud: solicitud.id_solicitud,
            titulo: 'Solicitud en seguimiento',
            mensaje: `Tu solicitud para ${solicitud.Mascota?.nombre || 'la mascota'} ha pasado a seguimiento post-adopción`,
            tipo: 'SEGUIMIENTO'
        }, { transaction });

        await registrarHistorial(id, solicitud.estado_solicitud, 'EN_SEGUIMIENTO', respondidoPor, null, transaction);
        await transaction.commit();

        try {
            const emailUtil = require('../../utils/email');
            emailUtil.sendEventEmail(solicitud.id_usuario, 'Solicitud en seguimiento', [
                `Tu solicitud para adoptar a ${solicitud.Mascota?.nombre || 'la mascota'} ha pasado a seguimiento post-adopción.`,
                'La fundación realizará seguimientos periódicos para verificar el bienestar de la mascota.'
            ]);
        } catch (_) {}

        return solicitud;
    } catch (error) {
        try { await transaction.rollback(); } catch {}
        throw error;
    }
};

const aprobarSolicitud = async (id, respuesta, cambiarEstadoMascota = false, respondidoPor) => {
    const solicitud = await Solicitud.findByPk(id, {
        include: [{ model: Mascota, attributes: ['nombre', 'id_mascota', 'estado_mascota'] }]
    });
    if (!solicitud || solicitud.estado === 0) throw new Error('Solicitud no encontrada');
    if (!VALID_TRANSITIONS[solicitud.estado_solicitud]?.includes('APROBADA')) throw new Error('No se puede aprobar desde el estado actual');
    const transaction = await sequelize.transaction();
    try {
        await solicitud.update({ estado_solicitud: 'APROBADA', respuesta: respuesta || null, fecha_respuesta: new Date(), respondido_por: respondidoPor || null }, { transaction });
        if (cambiarEstadoMascota) await Mascota.update({ estado_mascota: 'EN_PROCESO' }, { where: { id_mascota: solicitud.id_mascota }, transaction });
        await Notificacion.create({ id_usuario: solicitud.id_usuario, id_solicitud: solicitud.id_solicitud, titulo: '¡Solicitud aprobada!', mensaje: `¡Felicidades! Tu solicitud para ${solicitud.Mascota?.nombre || 'la mascota'} ha sido aprobada`, tipo: 'APROBACION' }, { transaction });
        await registrarHistorial(id, solicitud.estado_solicitud, 'APROBADA', respondidoPor, respuesta, transaction);
        await transaction.commit();
        try { const emailUtil = require('../../utils/email'); emailUtil.sendEventEmail(solicitud.id_usuario, 'Solicitud aprobada', [`¡Felicidades! Tu solicitud para adoptar a ${solicitud.Mascota?.nombre || 'la mascota'} ha sido aprobada.`, 'La fundación se comunicará contigo para coordinar los siguientes pasos.']); } catch (_) {}
        return solicitud;
    } catch (error) { try { await transaction.rollback(); } catch {} throw error; }
};

const rechazarSolicitud = async (id, respuesta, respondidoPor) => {
    const solicitud = await Solicitud.findByPk(id, { include: [{ model: Mascota, attributes: ['nombre'] }] });
    if (!solicitud || solicitud.estado === 0) throw new Error('Solicitud no encontrada');
    if (!VALID_TRANSITIONS[solicitud.estado_solicitud]?.includes('RECHAZADA')) throw new Error('No se puede rechazar desde el estado actual');
    const transaction = await sequelize.transaction();
    try {
        await solicitud.update({ estado_solicitud: 'RECHAZADA', respuesta: respuesta || null, fecha_respuesta: new Date(), respondido_por: respondidoPor || null }, { transaction });
        await Notificacion.create({ id_usuario: solicitud.id_usuario, id_solicitud: solicitud.id_solicitud, titulo: 'Solicitud rechazada', mensaje: `Tu solicitud para ${solicitud.Mascota?.nombre || 'la mascota'} ha sido rechazada. Motivo: ${respuesta || 'No especificado'}`, tipo: 'RECHAZO' }, { transaction });
        await registrarHistorial(id, solicitud.estado_solicitud, 'RECHAZADA', respondidoPor, respuesta, transaction);
        await transaction.commit();
        try { const emailUtil = require('../../utils/email'); emailUtil.sendEventEmail(solicitud.id_usuario, 'Solicitud rechazada', [`Tu solicitud para adoptar a ${solicitud.Mascota?.nombre || 'la mascota'} ha sido rechazada.`, `Motivo: ${respuesta || 'No especificado'}`, 'Puedes intentar aplicar a otra mascota disponible en la plataforma.']); } catch (_) {}
        return solicitud;
    } catch (error) { try { await transaction.rollback(); } catch {} throw error; }
};

const finalizarAdopcion = async (id, respondidoPor) => {
    const solicitud = await Solicitud.findByPk(id, {
        include: [{ model: Mascota, attributes: ['nombre', 'id_mascota'] }]
    });

    if (!solicitud || solicitud.estado === 0) {
        throw new Error('Solicitud no encontrada');
    }

    if (!VALID_TRANSITIONS[solicitud.estado_solicitud]?.includes('ADOPTADA')) {
        throw new Error('No se puede finalizar desde el estado actual');
    }

    const transaction = await sequelize.transaction();

    try {
        await Mascota.update(
            { estado_mascota: 'ADOPTADO' },
            { where: { id_mascota: solicitud.id_mascota }, transaction }
        );

        await solicitud.update({
            estado_solicitud: 'ADOPTADA',
            fecha_respuesta: new Date(),
            respondido_por: respondidoPor || null
        }, { transaction });

        await Notificacion.create({
            id_usuario: solicitud.id_usuario,
            id_solicitud: solicitud.id_solicitud,
            titulo: 'Adopción finalizada',
            mensaje: `La adopción de ${solicitud.Mascota?.nombre || 'la mascota'} ha sido finalizada. Bienvenido a la familia.`,
            tipo: 'APROBACION'
        }, { transaction });

        await registrarHistorial(id, solicitud.estado_solicitud, 'ADOPTADA', respondidoPor, null, transaction);
        await transaction.commit();

        // Email fire-and-forget (no debe romper el flujo si falla)
        try {
            const emailUtil = require('../../utils/email');
            emailUtil.sendEventEmail(solicitud.id_usuario, 'Adopción finalizada', [
                `La adopción de ${solicitud.Mascota?.nombre || 'la mascota'} ha sido finalizada exitosamente.`,
                '¡Bienvenido a la familia! La fundación realizará seguimiento para asegurar el bienestar de la mascota.'
            ]);
        } catch (_) {}

        return {
            solicitud: {
                id_solicitud: solicitud.id_solicitud,
                estado_solicitud: 'ADOPTADA'
            },
            mascota: {
                id_mascota: solicitud.id_mascota,
                estado_mascota: 'ADOPTADO'
            }
        };
    } catch (error) {
        try { await transaction.rollback(); } catch {}
        throw error;
    }
};

const cancelarSolicitud = async (id, usuarioId, motivo) => {
    const solicitud = await Solicitud.findByPk(id, {
        include: [{ model: Mascota, attributes: ['nombre'] }]
    });

    if (!solicitud || solicitud.estado === 0) {
        throw new Error('Solicitud no encontrada');
    }

    if (solicitud.id_usuario !== usuarioId) {
        throw new Error('No puedes cancelar una solicitud que no te pertenece');
    }

    if (!['PENDIENTE', 'EN_EVALUACION'].includes(solicitud.estado_solicitud)) {
        throw new Error('Solo se puede cancelar solicitudes pendientes o en evaluación');
    }

    const transaction = await sequelize.transaction();

    try {
        await solicitud.update({
            estado_solicitud: 'CANCELADA',
            respuesta: motivo || 'Cancelada por el adoptante',
            fecha_respuesta: new Date(),
            respondido_por: usuarioId
        }, { transaction });

        const fundacion = await Fundacion.findByPk(solicitud.id_fundacion, { transaction });
        const notificacionUserId = fundacion?.id_usuario || null;
        if (notificacionUserId) {
            await Notificacion.create({
                id_usuario: notificacionUserId,
                id_solicitud: solicitud.id_solicitud,
                titulo: 'Solicitud cancelada',
                mensaje: `El adoptante ha cancelado la solicitud para ${solicitud.Mascota?.nombre || 'la mascota'}. Motivo: ${motivo || 'No especificado'}`,
                tipo: 'SOLICITUD'
            }, { transaction });
        }

        await registrarHistorial(id, solicitud.estado_solicitud, 'CANCELADA', usuarioId, motivo, transaction);
        await transaction.commit();

        try {
            const emailUtil = require('../../utils/email');
            const notifUserId = fundacion?.id_usuario;
            if (notifUserId) {
                emailUtil.sendEventEmail(notifUserId, 'Solicitud cancelada', [
                    `El adoptante ha cancelado la solicitud para ${solicitud.Mascota?.nombre || 'la mascota'}.`,
                    `Motivo: ${motivo || 'No especificado'}`
                ]);
            }
        } catch (_) {}

        return solicitud;
    } catch (error) {
        try { await transaction.rollback(); } catch {}
        throw error;
    }
};

const deleteSolicitud = async (id) => {
    const solicitud = await Solicitud.findByPk(id);

    if (!solicitud) {
        throw new Error('Solicitud no encontrada');
    }

    await solicitud.update({ estado: 0 });

    return solicitud;
};

module.exports = {
    createSolicitud,
    getSolicitudes,
    getSolicitudById,
    getFundacionIdByUserId,
    ponerEnEvaluacion,
    ponerEnSeguimiento,
    aprobarSolicitud,
    rechazarSolicitud,
    finalizarAdopcion,
    cancelarSolicitud,
    deleteSolicitud
};
