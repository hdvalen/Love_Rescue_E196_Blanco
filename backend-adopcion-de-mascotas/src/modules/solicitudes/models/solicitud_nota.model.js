const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const SolicitudNota = sequelize.define('SolicitudNota', {

    id_nota: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    id_solicitud: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    texto: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    visibilidad: {
        type: DataTypes.ENUM('PRIVADA', 'COMPARTIDA'),
        defaultValue: 'PRIVADA'
    },

    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    autor: {
        type: DataTypes.STRING(150)
    },

    id_autor: {
        type: DataTypes.INTEGER
    },

    estado: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }

}, {

    tableName: 'solicitud_nota',
    timestamps: false

});

module.exports = SolicitudNota;
