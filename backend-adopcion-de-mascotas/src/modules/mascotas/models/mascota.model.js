const { DataTypes } = require('sequelize');

const sequelize = require('../../../config/db');

const Mascota = sequelize.define('Mascota', {

    id_mascota: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    id_fundacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    especie: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    raza: {
        type: DataTypes.STRING(100)
    },

    edad: {
        type: DataTypes.INTEGER
    },

    tamano: {
        type: DataTypes.ENUM(
            'PEQUENO',
            'MEDIANO',
            'GRANDE'
        )
    },

    sexo: {
        type: DataTypes.ENUM(
            'MACHO',
            'HEMBRA'
        )
    },

    esterilizado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    vacunado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    temperamento: {
        type: DataTypes.TEXT
    },

    descripcion: {
        type: DataTypes.TEXT
    },

    ubicacion: {
        type: DataTypes.STRING(150)
    },

    estado_mascota: {
        type: DataTypes.ENUM(
            'DISPONIBLE',
            'EN_PROCESO',
            'ADOPTADO'
        ),
        defaultValue: 'DISPONIBLE'
    },

    estado: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },

    condiciones_adopcion: {
        type: DataTypes.TEXT
    },

    fecha_publicacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }

}, {

    tableName: 'mascota',
    timestamps: false

});

module.exports = Mascota;