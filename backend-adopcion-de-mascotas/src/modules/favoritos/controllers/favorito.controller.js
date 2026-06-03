const favoritoService = require('../services/favorito.service');

const toggle = async (req, res) => {
    try {
        const idUsuario = req.user.id_usuario;
        const idMascota = req.params.id_mascota;

        const result = await favoritoService.toggleFavorito(idUsuario, idMascota);

        res.json({
            ok: true,
            ...result
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
        const favoritos = await favoritoService.getFavoritosByUser(req.user.id_usuario);

        res.json({
            ok: true,
            favoritos
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

const check = async (req, res) => {
    try {
        const isFav = await favoritoService.checkFavorito(
            req.user.id_usuario,
            req.params.id_mascota
        );

        res.json({
            ok: true,
            favorito: isFav
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};

module.exports = {
    toggle,
    getAll,
    check
};
