const PerfilAdoptante = require('../models/perfil_adoptante.model');

const getByUserId = async (id_usuario) => {
    return await PerfilAdoptante.findOne({ where: { id_usuario } });
};

const upsert = async (id_usuario, data) => {
    const allowedFields = ['housing_type', 'has_patio', 'hours_alone', 'experience', 'family_composition'];
    const payload = {};
    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            payload[field] = data[field];
        }
    }
    if (Object.keys(payload).length === 0) {
        throw new Error('No hay campos válidos para actualizar');
    }
    const [perfil] = await PerfilAdoptante.upsert({
        id_usuario,
        ...payload
    });
    return perfil;
};

module.exports = { getByUserId, upsert };
