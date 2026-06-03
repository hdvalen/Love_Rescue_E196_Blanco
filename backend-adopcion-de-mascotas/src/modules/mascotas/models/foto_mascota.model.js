const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const FotoMascota = sequelize.define('FotoMascota', {

    id_foto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    id_mascota: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    nombre_archivo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    estado: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }

}, {

    tableName: 'foto_mascota',
    timestamps: false

});

module.exports = FotoMascota;
