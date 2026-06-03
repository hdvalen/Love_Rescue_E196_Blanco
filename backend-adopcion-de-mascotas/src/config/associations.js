const Rol = require('../modules/roles/models/rol.model');
const User = require('../modules/users/models/user.model');
const Mascota = require('../modules/mascotas/models/mascota.model');
const Fundacion = require('../modules/fundaciones/models/fundacion.model');
const Solicitud = require('../modules/solicitudes/models/solicitud.model');
const Seguimiento = require('../modules/seguimientos/models/seguimiento.model');
const Notificacion = require('../modules/notificaciones/models/notificacion.model');
const FotoMascota = require('../modules/mascotas/models/foto_mascota.model');
const Favorito = require('../modules/favoritos/models/favorito.model');
const PerfilAdoptante = require('../modules/users/models/perfil_adoptante.model');
const SolicitudNota = require('../modules/solicitudes/models/solicitud_nota.model');
const SolicitudTarea = require('../modules/solicitudes/models/solicitud_tarea.model');
const SolicitudCita = require('../modules/solicitudes/models/solicitud_cita.model');
const SolicitudDocumento = require('../modules/solicitudes/models/solicitud_documento.model');
const SolicitudEvaluacion = require('../modules/solicitudes/models/solicitud_evaluacion.model');
const Temperamento = require('../modules/mascotas/models/temperamento.model');
const MascotaTemperamento = require('../modules/mascotas/models/mascota_temperamento.model');

function applyAssociations() {

    Rol.hasMany(User, {
        foreignKey: 'id_rol'
    });

    User.belongsTo(Rol, {
        foreignKey: 'id_rol'
    });

    User.hasOne(Fundacion, {
        foreignKey: 'id_usuario'
    });

    Fundacion.belongsTo(User, {
        foreignKey: 'id_usuario'
    });

    User.hasOne(PerfilAdoptante, {
        foreignKey: 'id_usuario'
    });

    PerfilAdoptante.belongsTo(User, {
        foreignKey: 'id_usuario'
    });

    Fundacion.hasMany(Mascota, {
        foreignKey: 'id_fundacion'
    });

    Mascota.belongsTo(Fundacion, {
        foreignKey: 'id_fundacion'
    });

    User.hasMany(Solicitud, {
        foreignKey: 'id_usuario'
    });

    Solicitud.belongsTo(User, {
        foreignKey: 'id_usuario'
    });

    // Nuevo: respondido_por FK → usuario
    Solicitud.belongsTo(User, {
        foreignKey: 'respondido_por',
        as: 'Respondedor'
    });
    User.hasMany(Solicitud, {
        foreignKey: 'respondido_por',
        as: 'SolicitudesRespondidas'
    });

    Mascota.hasMany(Solicitud, {
        foreignKey: 'id_mascota'
    });

    Solicitud.belongsTo(Mascota, {
        foreignKey: 'id_mascota'
    });

    Fundacion.hasMany(Solicitud, {
        foreignKey: 'id_fundacion'
    });

    Solicitud.belongsTo(Fundacion, {
        foreignKey: 'id_fundacion'
    });

    User.hasMany(Seguimiento, {
        foreignKey: 'id_usuario'
    });

    Seguimiento.belongsTo(User, {
        foreignKey: 'id_usuario'
    });

    Solicitud.hasMany(Seguimiento, {
        foreignKey: 'id_solicitud'
    });

    Seguimiento.belongsTo(Solicitud, {
        foreignKey: 'id_solicitud'
    });

    Mascota.hasMany(FotoMascota, {
        foreignKey: 'id_mascota',
        as: 'FotosMascota'
    });

    FotoMascota.belongsTo(Mascota, {
        foreignKey: 'id_mascota',
        as: 'FotosMascota'
    });

    Mascota.belongsToMany(Temperamento, {
        through: MascotaTemperamento,
        foreignKey: 'id_mascota',
        otherKey: 'id_temperamento',
        as: 'Temperamentos'
    });
    Temperamento.belongsToMany(Mascota, {
        through: MascotaTemperamento,
        foreignKey: 'id_temperamento',
        otherKey: 'id_mascota',
        as: 'Mascotas'
    });

    // ---- SolicitudHistorial ----
    const SolicitudHistorial = require('../modules/solicitudes/models/solicitud_historial.model');
    Solicitud.hasMany(SolicitudHistorial, { foreignKey: 'id_solicitud' });
    SolicitudHistorial.belongsTo(Solicitud, { foreignKey: 'id_solicitud' });
    SolicitudHistorial.belongsTo(User, { foreignKey: 'usuario_responsable', as: 'Responsable' });

    // ---- SolicitudCita (orphan, never associated) ----
    Solicitud.hasMany(SolicitudCita, { foreignKey: 'id_solicitud' });
    SolicitudCita.belongsTo(Solicitud, { foreignKey: 'id_solicitud' });

    // ---- SolicitudDocumento (orphan, never associated) ----
    Solicitud.hasMany(SolicitudDocumento, { foreignKey: 'id_solicitud' });
    SolicitudDocumento.belongsTo(Solicitud, { foreignKey: 'id_solicitud' });
}

module.exports = applyAssociations;