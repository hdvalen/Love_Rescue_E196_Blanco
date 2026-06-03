const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const Solicitud = sequelize.define('Solicitud', {

    id_solicitud: {
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

    id_fundacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    fecha_solicitud: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    estado_solicitud: {
        type: DataTypes.ENUM(
            'PENDIENTE',
            'EN_EVALUACION',
            'APROBADA',
            'RECHAZADA',
            'EN_SEGUIMIENTO',
            'ADOPTADA',
            'CANCELADA'
        ),
        defaultValue: 'PENDIENTE'
    },

    motivo: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    respuesta: {
        type: DataTypes.TEXT
    },

    fecha_respuesta: {
        type: DataTypes.DATE
    },

    respondido_por: {
        type: DataTypes.INTEGER
    },

    datos_adoptante: {
        type: DataTypes.TEXT
    },

    estado: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }

}, {

    tableName: 'solicitud',
    timestamps: false

});

module.exports = Solicitud;
