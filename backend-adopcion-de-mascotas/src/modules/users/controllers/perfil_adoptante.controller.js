const perfilAdoptanteService = require('../services/perfil_adoptante.service');

const getProfile = async (req, res) => {
    try {
        const perfil = await perfilAdoptanteService.getByUserId(req.user.id_usuario);
        res.json({ ok: true, perfil });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const perfil = await perfilAdoptanteService.upsert(req.user.id_usuario, req.body);
        res.json({ ok: true, perfil });
    } catch (error) {
        res.status(400).json({ ok: false, message: error.message });
    }
};

module.exports = { getProfile, updateProfile };
