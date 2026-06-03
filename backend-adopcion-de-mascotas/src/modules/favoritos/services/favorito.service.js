const Favorito = require('../models/favorito.model');

const toggleFavorito = async (idUsuario, idMascota) => {
    const existing = await Favorito.findOne({
        where: { id_usuario: idUsuario, id_mascota: idMascota }
    });

    if (existing) {
        await existing.destroy();
        return { favorito: false, message: 'Favorito eliminado' };
    }

    const favorito = await Favorito.create({
        id_usuario: idUsuario,
        id_mascota: idMascota
    });

    return { favorito: true, data: favorito };
};

const getFavoritosByUser = async (idUsuario) => {
    return await Favorito.findAll({
        where: { id_usuario: idUsuario },
        order: [['fecha', 'DESC']]
    });
};

const checkFavorito = async (idUsuario, idMascota) => {
    const existing = await Favorito.findOne({
        where: { id_usuario: idUsuario, id_mascota: idMascota }
    });
    return !!existing;
};

module.exports = {
    toggleFavorito,
    getFavoritosByUser,
    checkFavorito
};
