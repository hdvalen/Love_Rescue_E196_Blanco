const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const SolicitudCita = sequelize.define('SolicitudCita', {
  id_cita: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_solicitud: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  hora_inicio: { type: DataTypes.TIME, allowNull: false },
  hora_fin: { type: DataTypes.TIME, allowNull: false },
  modalidad: { type: DataTypes.STRING(50), defaultValue: 'Presencial' },
  estado: { type: DataTypes.ENUM('PENDIENTE','ACEPTADA','RECHAZADA'), defaultValue: 'PENDIENTE' },
  motivo_rechazo: { type: DataTypes.TEXT },
  creado_por: { type: DataTypes.INTEGER },
  estado_registro: { type: DataTypes.TINYINT, defaultValue: 1 },
}, { tableName: 'solicitud_cita', timestamps: false });

module.exports = SolicitudCita;
