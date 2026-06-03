const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const User = sequelize.define('User', {

    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
    },

    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },

    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    telefono: {
        type: DataTypes.STRING(20)
    },

    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    estado: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },

    id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    foto_url: {
        type: DataTypes.STRING(500)
    },

    email_verified_at: {
        type: DataTypes.DATE
    },

    email_verification_token: {
        type: DataTypes.STRING(255)
    },

    email_verification_expires: {
        type: DataTypes.DATE
    },

    last_login: {
        type: DataTypes.DATE
    },

    refresh_token: {
        type: DataTypes.STRING(500)
    },

    refresh_token_expires: {
        type: DataTypes.DATE
    },

    password_reset_token: {
        type: DataTypes.STRING(255)
    },

    password_reset_expires: {
        type: DataTypes.DATE
    }

}, {

    tableName: 'usuario',
    timestamps: false

});

module.exports = User;