const Fundacion = require('../models/fundacion.model');
const User = require('../../users/models/user.model');

const createFundacion = async (data) => {

    const fundacion = await Fundacion.create(data);

    return fundacion;
};

function addEmail(f) {
    const json = f.toJSON();
    json.email = json.User?.email || '';
    delete json.User;
    return json;
}

const getFundaciones = async (filters = {}) => {
    const where = {};

    if (filters.id_usuario) {
        where.id_usuario = filters.id_usuario;
    }

    const fundaciones = await Fundacion.findAll({
        where,
        include: [{
            model: User,
            attributes: ['email']
        }]
    });

    return fundaciones.map(addEmail);
};

const getFundacionById = async (id, soloPublico = false) => {

    const fundacion = await Fundacion.findByPk(id, {
        include: [{
            model: User,
            attributes: ['email']
        }]
    });

    if (!fundacion) return null;
    if (soloPublico && fundacion.estado_aprobacion !== 'APROBADA') return null;

    return addEmail(fundacion);
};

const updateFundacion = async (id, data) => {

    const fundacion = await Fundacion.findByPk(id);

    if (!fundacion) {
        throw new Error('Fundación no encontrada');
    }

    if (data.telefono && !/^\+?\d{7,15}$/.test(data.telefono)) {
        throw new Error('Por favor, ingrese un número de contacto válido');
    }

    await fundacion.update(data);

    return fundacion;
};

const aprobarFundacion = async (id, motivoRechazo = null) => {

    const fundacion = await Fundacion.findByPk(id);

    if (!fundacion) {
        throw new Error('Fundación no encontrada');
    }

    const updates = {};

    if (motivoRechazo) {
        updates.estado_aprobacion = 'RECHAZADA';
        updates.motivo_rechazo = motivoRechazo;
    } else {
        updates.estado_aprobacion = 'APROBADA';
        updates.motivo_rechazo = null;
    }

    await fundacion.update(updates);

    try {
        const emailService = require('../../../utils/email');
        await emailService.sendVerificationResult(fundacion, updates);
    } catch {
        // Email notification is optional – don't block the flow
    }

    return fundacion;
};

module.exports = {
    createFundacion,
    getFundaciones,
    getFundacionById,
    updateFundacion,
    aprobarFundacion
};