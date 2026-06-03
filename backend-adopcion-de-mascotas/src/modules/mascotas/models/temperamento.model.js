const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const Temperamento = sequelize.define('Temperamento', {
    id_temperamento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'temperamento',
    timestamps: false
});

module.exports = Temperamento;
