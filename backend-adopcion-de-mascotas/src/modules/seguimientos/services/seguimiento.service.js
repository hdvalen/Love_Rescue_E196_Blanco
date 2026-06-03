const Seguimiento = require('../models/seguimiento.model');
const Solicitud = require('../../solicitudes/models/solicitud.model');
const User = require('../../users/models/user.model');
const Notificacion = require('../../notificaciones/models/notificacion.model');

const createSeguimiento = async (data) => {
    const solicitud = await Solicitud.findByPk(data.id_solicitud);

    if (!solicitud || solicitud.estado === 0) {
        throw new Error('Solicitud no encontrada');
    }

    if (!['APROBADA', 'EN_SEGUIMIENTO', 'ADOPTADA'].includes(solicitud.estado_solicitud)) {
        throw new Error('Solo se pueden hacer seguimientos a solicitudes aprobadas');
    }

    const seguimiento = await Seguimiento.create(data);

    // Notificar al adoptante sobre el nuevo seguimiento
    try {
        const tipoLabel = { CONTACTO: 'contacto', VISITA: 'visita', LLAMADA: 'llamada', CUESTIONARIO: 'cuestionario' };
        await Notificacion.create({
            id_usuario: solicitud.id_usuario,
            id_solicitud: data.id_solicitud,
            titulo: 'Nuevo seguimiento programado',
            mensaje: `La fundación ha programado un ${tipoLabel[data.tipo] || 'seguimiento'}${data.proximo_contacto ? ' para el ' + new Date(data.proximo_contacto).toLocaleDateString('es-CO') : ''}. ${data.descripcion ? 'Motivo: ' + data.descripcion.substring(0, 100) : ''}`,
            tipo: 'SEGUIMIENTO'
        });
        const emailUtil = require('../../utils/email');
        emailUtil.sendEventEmail(solicitud.id_usuario, 'Nuevo seguimiento programado', [
            `La fundación ha programado un ${tipoLabel[data.tipo] || 'seguimiento'} para tu solicitud.`,
            data.proximo_contacto ? `Fecha estimada: ${new Date(data.proximo_contacto).toLocaleDateString('es-CO')}` : '',
            `Descripción: ${data.descripcion || 'No especificada'}`
        ]);
    } catch (_) {}

    return seguimiento;
};

const getSeguimientos = async (filters) => {
    const where = { estado: 1 };

    if (filters.id_solicitud) {
        where.id_solicitud = filters.id_solicitud;
    }

    if (filters.estado_seguimiento) {
        where.estado_seguimiento = filters.estado_seguimiento;
    }

    return await Seguimiento.findAll({
        where,
        include: [
            {
                model: Solicitud,
                attributes: ['id_solicitud', 'estado_solicitud', 'fecha_solicitud']
            },
            {
                model: User,
                attributes: ['id_usuario', 'nombre', 'email']
            }
        ],
        order: [['fecha_seguimiento', 'DESC']]
    });
};

const getSeguimientoById = async (id) => {
    const seguimiento = await Seguimiento.findByPk(id, {
        include: [
            {
                model: Solicitud,
                attributes: ['id_solicitud', 'estado_solicitud', 'fecha_solicitud']
            },
            {
                model: User,
                attributes: ['id_usuario', 'nombre', 'email']
            }
        ]
    });

    if (!seguimiento || seguimiento.estado === 0) {
        throw new Error('Seguimiento no encontrado');
    }

    return seguimiento;
};

const updateSeguimiento = async (id, data) => {
    const seguimiento = await Seguimiento.findByPk(id);

    if (!seguimiento || seguimiento.estado === 0) {
        throw new Error('Seguimiento no encontrado');
    }

    await seguimiento.update(data);

    return seguimiento;
};

const completeSeguimiento = async (id, observaciones) => {
    const seguimiento = await Seguimiento.findByPk(id);

    if (!seguimiento || seguimiento.estado === 0) {
        throw new Error('Seguimiento no encontrado');
    }

    await seguimiento.update({
        estado_seguimiento: 'REALIZADO',
        observaciones: observaciones || null
    });

    return seguimiento;
};

const getSeguimientosByUserId = async (userId) => {
    const solicitudes = await Solicitud.findAll({
        where: { id_usuario: userId, estado: 1 },
        attributes: ['id_solicitud']
    });
    const ids = solicitudes.map(s => s.id_solicitud);
    if (ids.length === 0) return [];

    return await Seguimiento.findAll({
        where: { id_solicitud: ids, estado: 1 },
        attributes: ['id_seguimiento', 'id_solicitud', 'tipo', 'tipo_visita', 'fecha_seguimiento', 'estado_seguimiento', 'proximo_contacto'],
        include: [
            { model: Solicitud, attributes: ['id_solicitud'], required: true }
        ],
        order: [['fecha_seguimiento', 'DESC']]
    });
};

const deleteSeguimiento = async (id) => {
    const seguimiento = await Seguimiento.findByPk(id);

    if (!seguimiento) {
        throw new Error('Seguimiento no encontrado');
    }

    await seguimiento.update({ estado: 0 });

    return seguimiento;
};

module.exports = {
    createSeguimiento,
    getSeguimientos,
    getSeguimientoById,
    updateSeguimiento,
    completeSeguimiento,
    deleteSeguimiento
};
