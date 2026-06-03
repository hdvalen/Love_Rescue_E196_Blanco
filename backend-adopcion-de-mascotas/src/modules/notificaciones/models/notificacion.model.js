const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const Notificacion = sequelize.define('Notificacion', {

    id_notificacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    id_solicitud: {
        type: DataTypes.INTEGER
    },

    titulo: {
        type: DataTypes.STRING(200),
        allowNull: false
    },

    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    tipo: {
        type: DataTypes.ENUM(
            'SOLICITUD',
            'APROBACION',
            'RECHAZO',
            'SEGUIMIENTO',
            'SISTEMA'
        ),
        defaultValue: 'SISTEMA'
    },

    leido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    fecha_leido: {
        type: DataTypes.DATE
    },

    accion_url: {
        type: DataTypes.STRING(500)
    },

    remitente_id: {
        type: DataTypes.INTEGER
    },

    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    estado: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }

}, {

    tableName: 'notificacion',
    timestamps: false

});

module.exports = Notificacion;
