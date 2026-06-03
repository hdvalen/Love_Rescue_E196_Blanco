const User = require('../models/user.model');
const PerfilAdoptante = require('../models/perfil_adoptante.model');
const Fundacion = require('../../fundaciones/models/fundacion.model');
const bcrypt = require('bcryptjs');

const getUsers = async () => {
    return await User.findAll({
        attributes: { exclude: ['password'] }
    });
};

const getUserById = async (id) => {
    const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
            { model: PerfilAdoptante },
            { model: Fundacion, attributes: ['logo_url'] }
        ]
    });
    if (!user) throw new Error('Usuario no encontrado');
    return user;
};

const updateUser = async (id, data) => {
    const user = await User.findByPk(id);

    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    if (data.password) {
        delete data.password;
    }

    await user.update(data);

    const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
    });

    return updatedUser;
};

const deleteUser = async (id) => {
    const user = await User.findByPk(id);

    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    await user.update({ estado: 0 });

    return user;
};

const changePassword = async (id, currentPassword, newPassword) => {
    const user = await User.findByPk(id);

    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
        throw new Error('La contraseña actual no es correcta');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({ password: hashedPassword });

    return { message: 'Contraseña actualizada correctamente' };
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    changePassword
};
