const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const MascotaTemperamento = sequelize.define('MascotaTemperamento', {
    id_mascota: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'mascota', key: 'id_mascota' },
        onDelete: 'CASCADE'
    },
    id_temperamento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'temperamento', key: 'id_temperamento' },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'mascota_temperamento',
    timestamps: false
});

module.exports = MascotaTemperamento;
