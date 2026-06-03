const app = require('./app');
const sequelize = require('./config/db');

require('dotenv').config();

const Rol = require('./modules/roles/models/rol.model');
const User = require('./modules/users/models/user.model');
const Fundacion = require('./modules/fundaciones/models/fundacion.model');
const Mascota = require('./modules/mascotas/models/mascota.model');
const FotoMascota = require('./modules/mascotas/models/foto_mascota.model');
const Solicitud = require('./modules/solicitudes/models/solicitud.model');
const Seguimiento = require('./modules/seguimientos/models/seguimiento.model');
const Notificacion = require('./modules/notificaciones/models/notificacion.model');
const Favorito = require('./modules/favoritos/models/favorito.model');
const PerfilAdoptante = require('./modules/users/models/perfil_adoptante.model');
const SolicitudNota = require('./modules/solicitudes/models/solicitud_nota.model');
const SolicitudTarea = require('./modules/solicitudes/models/solicitud_tarea.model');
const SolicitudCita = require('./modules/solicitudes/models/solicitud_cita.model');
const SolicitudDocumento = require('./modules/solicitudes/models/solicitud_documento.model');
const SolicitudEvaluacion = require('./modules/solicitudes/models/solicitud_evaluacion.model');
const SolicitudHistorial = require('./modules/solicitudes/models/solicitud_historial.model');

const applyAssociations = require('./config/associations');

const PORT = process.env.PORT || 3000;

async function startServer() {

    try {

        await sequelize.authenticate();

        console.log('✅ Base de datos conectada');

        applyAssociations();

        const syncOpts = {};

        await Rol.sync(syncOpts);
        console.log('✅ Modelo Rol sincronizado');

        await User.sync(syncOpts);
        console.log('✅ Modelo Usuario sincronizado');

        await Fundacion.sync(syncOpts);
        console.log('✅ Modelo Fundación sincronizado');

        await Mascota.sync(syncOpts);
        console.log('✅ Modelo Mascota sincronizado');

        await FotoMascota.sync(syncOpts);
        console.log('✅ Modelo FotoMascota sincronizado');

        await Solicitud.sync(syncOpts);
        console.log('✅ Modelo Solicitud sincronizado');

        await Seguimiento.sync(syncOpts);
        console.log('✅ Modelo Seguimiento sincronizado');

        await Notificacion.sync(syncOpts);
        console.log('✅ Modelo Notificación sincronizado');

        await Favorito.sync(syncOpts);
        console.log('✅ Modelo Favorito sincronizado');

        await SolicitudNota.sync(syncOpts);
        console.log('✅ Modelo SolicitudNota sincronizado');

        await SolicitudTarea.sync(syncOpts);
        console.log('✅ Modelo SolicitudTarea sincronizado');

        await SolicitudCita.sync(syncOpts);
        console.log('✅ Modelo SolicitudCita sincronizado');

        await SolicitudDocumento.sync(syncOpts);
        console.log('✅ Modelo SolicitudDocumento sincronizado');

        await SolicitudEvaluacion.sync(syncOpts);
        console.log('✅ Modelo SolicitudEvaluacion sincronizado');

        await SolicitudHistorial.sync(syncOpts);
        console.log('✅ Modelo SolicitudHistorial sincronizado');

        await PerfilAdoptante.sync(syncOpts);
        console.log('✅ Modelo PerfilAdoptante sincronizado');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
        });

    } catch (error) {

        console.error('❌ Error:', error);

    }

}

startServer();
