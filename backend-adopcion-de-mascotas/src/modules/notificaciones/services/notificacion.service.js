const Notificacion = require('../models/notificacion.model');
const { getPagination, getPaginationResponse } = require('../../../utils/pagination');

const createNotificacion = async (data) => {
    const notificacion = await Notificacion.create(data);

    return notificacion;
};

const getNotificaciones = async (id_usuario, filters) => {
    const where = {
        id_usuario,
        estado: 1
    };

    if (filters.leido !== undefined) {
        where.leido = filters.leido === 'true' || filters.leido === true;
    }

    if (filters.tipo) {
        where.tipo = filters.tipo;
    }

    const { page, limit, offset } = getPagination(filters);

    const { count, rows } = await Notificacion.findAndCountAll({
        where,
        order: [['fecha_creacion', 'DESC']],
        offset,
        limit
    });

    return {
        notificaciones: rows,
        pagination: getPaginationResponse(count, page, limit)
    };
};

const getNotificacionById = async (id, id_usuario) => {
    const notificacion = await Notificacion.findOne({
        where: {
            id_notificacion: id,
            id_usuario,
            estado: 1
        }
    });

    if (!notificacion) {
        throw new Error('Notificación no encontrada');
    }

    return notificacion;
};

const marcarLeida = async (id, id_usuario) => {
    const notificacion = await Notificacion.findOne({
        where: {
            id_notificacion: id,
            id_usuario,
            estado: 1
        }
    });

    if (!notificacion) {
        throw new Error('Notificación no encontrada');
    }

    await notificacion.update({ leido: true });

    return notificacion;
};

const marcarTodasLeidas = async (id_usuario) => {
    await Notificacion.update(
        { leido: true },
        {
            where: {
                id_usuario,
                leido: false,
                estado: 1
            }
        }
    );

    return { message: 'Todas las notificaciones marcadas como leídas' };
};

const deleteNotificacion = async (id, id_usuario) => {
    const notificacion = await Notificacion.findOne({
        where: {
            id_notificacion: id,
            id_usuario,
            estado: 1
        }
    });

    if (!notificacion) {
        throw new Error('Notificación no encontrada');
    }

    await notificacion.update({ estado: 0 });

    return notificacion;
};

module.exports = {
    createNotificacion,
    getNotificaciones,
    getNotificacionById,
    marcarLeida,
    marcarTodasLeidas,
    deleteNotificacion
};
