const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const SolicitudEvaluacion = sequelize.define('SolicitudEvaluacion', {
  id_evaluacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_solicitud: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  entrevista: { type: DataTypes.TINYINT, defaultValue: 0 },
  visita: { type: DataTypes.TINYINT, defaultValue: 0 },
  documentos_verificados: { type: DataTypes.TINYINT, defaultValue: 0 },
  contrato_aceptado: { type: DataTypes.TINYINT, defaultValue: 0 },
  contrato_fecha: { type: DataTypes.DATE },
  contrato_ip: { type: DataTypes.STRING(50) },
  contrato_pdf: { type: DataTypes.STRING(255) },
  estado: { type: DataTypes.TINYINT, defaultValue: 1 },
}, { tableName: 'solicitud_evaluacion', timestamps: false });

module.exports = SolicitudEvaluacion;
