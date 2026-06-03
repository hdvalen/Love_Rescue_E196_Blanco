const mascotaService = require('../services/mascota.service');

const create = async (req, res) => {

    try {

        req.body.id_usuario = req.user.id_usuario;

        const mascota = await mascotaService.createMascota(
            req.body
        );

        res.status(201).json({
            ok: true,
            mascota
        });

    } catch (error) {

        res.status(400).json({
            ok: false,
            message: error.message
        });

    }

};

const getAll = async (req, res) => {

    try {

        const result = await mascotaService.getMascotas(
            req.query
        );

        res.json({
            ok: true,
            mascotas: result.mascotas,
            pagination: result.pagination
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

        const mascota = await mascotaService.getMascotaById(
            req.params.id
        );

        res.json({
            ok: true,
            mascota
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

        const mascota = await mascotaService.updateMascota(
            req.params.id,
            req.body
        );

        res.json({
            ok: true,
            mascota
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

        await mascotaService.deleteMascota(
            req.params.id
        );

        res.json({
            ok: true,
            message: 'Mascota eliminada'
        });

    } catch (error) {

        res.status(400).json({
            ok: false,
            message: error.message
        });

    }

};

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove
};