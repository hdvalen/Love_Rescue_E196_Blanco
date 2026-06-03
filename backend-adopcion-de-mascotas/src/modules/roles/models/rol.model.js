const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const Rol = sequelize.define('Rol', {
    
    id_rol: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    nombre_rol: {
        type: DataTypes.STRING(50),
        allowNull: false
    }

}, {
    
    tableName: 'rol',
    timestamps: false

});

module.exports = Rol;