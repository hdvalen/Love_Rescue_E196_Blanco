const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const Favorito = sequelize.define('Favorito', {

    id_favorito: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    id_mascota: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }

}, {

    tableName: 'favorito',
    timestamps: false

});

module.exports = Favorito;
