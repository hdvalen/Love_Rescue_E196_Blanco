const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const SolicitudHistorial = sequelize.define('SolicitudHistorial', {
  id_historial: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_solicitud: { type: DataTypes.INTEGER, allowNull: false },
  estado_anterior: { type: DataTypes.STRING(50) },
  estado_nuevo: { type: DataTypes.STRING(50), allowNull: false },
  usuario_responsable: { type: DataTypes.INTEGER },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  motivo: { type: DataTypes.TEXT }
}, { tableName: 'solicitud_historial', timestamps: false });

module.exports = SolicitudHistorial;
