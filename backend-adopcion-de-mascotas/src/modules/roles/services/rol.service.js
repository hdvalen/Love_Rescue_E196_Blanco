const Rol = require('../models/rol.model');

const getRoles = async () => {
    return await Rol.findAll();
};

const getRolById = async (id) => {
    const rol = await Rol.findByPk(id);

    if (!rol) {
        throw new Error('Rol no encontrado');
    }

    return rol;
};

const createRol = async (data) => {
    const existing = await Rol.findOne({
        where: { nombre_rol: data.nombre_rol }
    });

    if (existing) {
        throw new Error('El rol ya existe');
    }

    const rol = await Rol.create(data);

    return rol;
};

module.exports = {
    getRoles,
    getRolById,
    createRol
};
