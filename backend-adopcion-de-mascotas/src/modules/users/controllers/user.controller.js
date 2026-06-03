const userService = require('../services/user.service');
const User = require('../models/user.model');
const { resizeImage } = require('../../../utils/imageResizer');
const { deleteFile } = require('../../../utils/pathResolver');

const ADMIN_ROLE_ID = 1;

function isOwnerOrAdmin(req, targetUserId) {
    const numericTarget = Number(targetUserId);
    return req.user.id_usuario === numericTarget || req.user.id_rol === ADMIN_ROLE_ID;
}

const getAll = async (req, res) => {
    try {
        const users = await userService.getUsers();

        res.json({
            ok: true,
            users
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
        if (!isOwnerOrAdmin(req, req.params.id)) {
            return res.status(403).json({ ok: false, message: 'No tienes permiso para ver este usuario' });
        }

        const user = await userService.getUserById(req.params.id);

        res.json({
            ok: true,
            user
        });
    } catch (error) {
        res.status(404).json({
            ok: false,
            message: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id_usuario);

        res.json({
            ok: true,
            user
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
        if (!isOwnerOrAdmin(req, req.params.id)) {
            return res.status(403).json({ ok: false, message: 'No tienes permiso para modificar este usuario' });
        }

        const user = await userService.updateUser(req.params.id, req.body);

        res.json({
            ok: true,
            user
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
        await userService.deleteUser(req.params.id);

        res.json({
            ok: true,
            message: 'Usuario desactivado correctamente'
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        if (!isOwnerOrAdmin(req, req.params.id)) {
            return res.status(403).json({ ok: false, message: 'No tienes permiso para cambiar esta contraseña' });
        }

        const { currentPassword, newPassword } = req.body;

        const result = await userService.changePassword(
            req.params.id,
            currentPassword,
            newPassword
        );

        res.json({
            ok: true,
            message: result.message
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};

const uploadFoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                ok: false,
                message: 'No se ha proporcionado un archivo'
            });
        }

        const current = await User.findByPk(req.user.id_usuario, { attributes: ['foto_url'] });
        if (current?.foto_url) {
            deleteFile(current.foto_url);
        }

        await resizeImage(req.file.path, 'profile');

        const user = await userService.updateUser(
            req.user.id_usuario,
            { foto_url: req.file.filename }
        );

        res.json({
            ok: true,
            message: 'Foto subida correctamente',
            user
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};

module.exports = {
    getAll,
    getById,
    getProfile,
    update,
    remove,
    updatePassword,
    uploadFoto
};
