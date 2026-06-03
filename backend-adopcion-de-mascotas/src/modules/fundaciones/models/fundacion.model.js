const { DataTypes } = require('sequelize');

const sequelize = require('../../../config/db');

const Fundacion = sequelize.define('Fundacion', {

    id_fundacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    nombre_fundacion: {
        type: DataTypes.STRING(150),
        allowNull: false
    },

    nit: {
        type: DataTypes.STRING(50)
    },

    telefono: {
        type: DataTypes.STRING(20)
    },

    ciudad: {
        type: DataTypes.STRING(100)
    },

    direccion: {
        type: DataTypes.STRING(255)
    },

    descripcion: {
        type: DataTypes.TEXT
    },

    redes_sociales: {
        type: DataTypes.STRING(255)
    },

    mision: {
        type: DataTypes.TEXT
    },

    logo_url: {
        type: DataTypes.STRING(500)
    },

    departamento: {
        type: DataTypes.STRING(100)
    },

    motivo_rechazo: {
        type: DataTypes.TEXT
    },

    estado_aprobacion: {
        type: DataTypes.ENUM(
            'PENDIENTE',
            'APROBADA',
            'RECHAZADA'
        ),
        defaultValue: 'PENDIENTE'
    },

    estado: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },

    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }

}, {

    tableName: 'fundacion',
    timestamps: false

});

module.exports = Fundacion;