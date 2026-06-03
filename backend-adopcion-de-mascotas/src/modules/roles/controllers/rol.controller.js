const rolService = require('../services/rol.service');

const getAll = async (req, res) => {
    try {
        const roles = await rolService.getRoles();

        res.json({
            ok: true,
            roles
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
        const rol = await rolService.getRolById(req.params.id);

        res.json({
            ok: true,
            rol
        });
    } catch (error) {
        res.status(404).json({
            ok: false,
            message: error.message
        });
    }
};

const create = async (req, res) => {
    try {
        const { nombre_rol } = req.body;

        if (!nombre_rol) {
            return res.status(400).json({
                ok: false,
                message: 'El nombre del rol es requerido'
            });
        }

        const rol = await rolService.createRol({ nombre_rol });

        res.status(201).json({
            ok: true,
            rol
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
    create
};
