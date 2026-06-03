const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const SolicitudTarea = sequelize.define('SolicitudTarea', {
  id_tarea: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_solicitud: { type: DataTypes.INTEGER, allowNull: false },
  texto: { type: DataTypes.STRING(500), allowNull: false },
  completada: { type: DataTypes.TINYINT, defaultValue: 0 },
  estado: { type: DataTypes.TINYINT, defaultValue: 1 },
}, { tableName: 'solicitud_tarea', timestamps: false });

module.exports = SolicitudTarea;
