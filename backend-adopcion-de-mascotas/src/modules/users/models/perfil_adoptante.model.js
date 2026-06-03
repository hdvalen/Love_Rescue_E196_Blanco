const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const PerfilAdoptante = sequelize.define('PerfilAdoptante', {
    id_perfil: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    housing_type: {
        type: DataTypes.STRING(50)
    },
    has_patio: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    hours_alone: {
        type: DataTypes.STRING(50)
    },
    experience: {
        type: DataTypes.TEXT
    },
    family_composition: {
        type: DataTypes.STRING(200)
    }
}, {
    tableName: 'perfil_adoptante',
    timestamps: true
});

module.exports = PerfilAdoptante;
