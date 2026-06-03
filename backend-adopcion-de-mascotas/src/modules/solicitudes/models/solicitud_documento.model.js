const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db');

const SolicitudDocumento = sequelize.define('SolicitudDocumento', {
  id_doc: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_solicitud: { type: DataTypes.INTEGER, allowNull: false },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  tipo: { type: DataTypes.STRING(50), allowNull: false },
  nombre_archivo: { type: DataTypes.STRING(255) },
  tamano: { type: DataTypes.INTEGER },
  estado_revision: { type: DataTypes.ENUM('PENDIENTE','APROBADO','RECHAZADO'), defaultValue: 'PENDIENTE' },
  comentario_rechazo: { type: DataTypes.TEXT },
  fecha_subida: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  estado: { type: DataTypes.TINYINT, defaultValue: 1 },
}, { tableName: 'solicitud_documento', timestamps: false });

module.exports = SolicitudDocumento;
