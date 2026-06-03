const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const Seguimiento = sequelize.define('Seguimiento', {

    id_seguimiento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    id_solicitud: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    fecha_seguimiento: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    tipo: {
        type: DataTypes.ENUM(
            'CONTACTO',
            'VISITA',
            'LLAMADA',
            'CUESTIONARIO'
        ),
        allowNull: false
    },

    tipo_visita: {
        type: DataTypes.ENUM('VIRTUAL', 'PRESENCIAL')
    },

    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    estado_seguimiento: {
        type: DataTypes.ENUM(
            'PENDIENTE',
            'REALIZADO',
            'CANCELADO'
        ),
        defaultValue: 'PENDIENTE'
    },

    proximo_contacto: {
        type: DataTypes.DATE
    },

    observaciones: {
        type: DataTypes.TEXT
    },

    estado: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }

}, {

    tableName: 'seguimiento',
    timestamps: false

});

module.exports = Seguimiento;
