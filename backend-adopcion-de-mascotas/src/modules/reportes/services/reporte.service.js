const Mascota = require('../../mascotas/models/mascota.model');
const Solicitud = require('../../solicitudes/models/solicitud.model');
const Fundacion = require('../../fundaciones/models/fundacion.model');
const User = require('../../users/models/user.model');
const Notificacion = require('../../notificaciones/models/notificacion.model');
const SolicitudCita = require('../../solicitudes/models/solicitud_cita.model');
const SolicitudDocumento = require('../../solicitudes/models/solicitud_documento.model');
const ExcelJS = require('exceljs');
const { Sequelize, Op } = require('sequelize');
const sequelize = require('../../../config/db');

const getGeneral = async () => {
    const [totalMascotas, mascotasPorEstado, totalSolicitudes,
        solicitudesPorEstado, totalFundaciones, fundacionesPorEstado,
        totalUsuarios, adoptantes] = await Promise.all([
        Mascota.count({ where: { estado: 1 } }),
        Mascota.findAll({
            attributes: ['estado_mascota', [Sequelize.fn('COUNT', '*'), 'cantidad']],
            where: { estado: 1 },
            group: ['estado_mascota'],
            raw: true
        }),
        Solicitud.count({ where: { estado: 1 } }),
        Solicitud.findAll({
            attributes: ['estado_solicitud', [Sequelize.fn('COUNT', '*'), 'cantidad']],
            where: { estado: 1 },
            group: ['estado_solicitud'],
            raw: true
        }),
        Fundacion.count({ where: { estado: 1 } }),
        Fundacion.findAll({
            attributes: ['estado_aprobacion', [Sequelize.fn('COUNT', '*'), 'cantidad']],
            where: { estado: 1 },
            group: ['estado_aprobacion'],
            raw: true
        }),
        User.count({ where: { estado: 1 } }),
        User.count({ where: { estado: 1, id_rol: 3 } })
    ]);

    return {
        mascotas: { total: totalMascotas, porEstado: mascotasPorEstado },
        solicitudes: { total: totalSolicitudes, porEstado: solicitudesPorEstado },
        fundaciones: { total: totalFundaciones, porEstado: fundacionesPorEstado },
        usuarios: { total: totalUsuarios, adoptantes }
    };
};

const getMascotas = async () => {
    const [total, porEstado, porEspecie, porTamano, recientes] = await Promise.all([
        Mascota.count({ where: { estado: 1 } }),
        Mascota.findAll({
            attributes: ['estado_mascota', [Sequelize.fn('COUNT', '*'), 'cantidad']],
            where: { estado: 1 }, group: ['estado_mascota'], raw: true
        }),
        Mascota.findAll({
            attributes: ['especie', [Sequelize.fn('COUNT', '*'), 'cantidad']],
            where: { estado: 1 }, group: ['especie'], raw: true
        }),
        Mascota.findAll({
            attributes: ['tamano', [Sequelize.fn('COUNT', '*'), 'cantidad']],
            where: { estado: 1, tamano: { [Sequelize.Op.ne]: null } }, group: ['tamano'], raw: true
        }),
        Mascota.findAll({ where: { estado: 1 }, order: [['fecha_publicacion', 'DESC']], limit: 5 })
    ]);
    return { total, porEstado, porEspecie, porTamano, recientes };
};

const getSolicitudes = async () => {
    const [total, porEstado, porMes] = await Promise.all([
        Solicitud.count({ where: { estado: 1 } }),
        Solicitud.findAll({
            attributes: ['estado_solicitud', [Sequelize.fn('COUNT', '*'), 'cantidad']],
            where: { estado: 1 }, group: ['estado_solicitud'], raw: true
        }),
        Solicitud.findAll({
            attributes: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha_solicitud'), '%Y-%m'), 'mes'], [Sequelize.fn('COUNT', '*'), 'cantidad']],
            where: { estado: 1 }, group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha_solicitud'), '%Y-%m')],
            order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha_solicitud'), '%Y-%m'), 'ASC']], raw: true
        })
    ]);
    return { total, porEstado, porMes };
};

const getFundaciones = async () => {
    const [total, porEstadoAprobacion, conMascotas] = await Promise.all([
        Fundacion.count({ where: { estado: 1 } }),
        Fundacion.findAll({
            attributes: ['estado_aprobacion', [Sequelize.fn('COUNT', '*'), 'cantidad']],
            where: { estado: 1 }, group: ['estado_aprobacion'], raw: true
        }),
        Fundacion.findAll({
            attributes: ['id_fundacion', 'nombre_fundacion', 'ciudad', 'estado_aprobacion', [Sequelize.fn('COUNT', Sequelize.col('Mascota.id_mascota')), 'total_mascotas']],
            include: [{ model: Mascota, attributes: [], required: false }],
            group: ['Fundacion.id_fundacion'], raw: true
        })
    ]);
    return { total, porEstadoAprobacion, conMascotas };
};

const getUsuarios = async () => {
    const [total, porRol, recientes] = await Promise.all([
        User.count({ where: { estado: 1 } }),
        User.findAll({ attributes: ['id_rol', [Sequelize.fn('COUNT', '*'), 'cantidad']], where: { estado: 1 }, group: ['id_rol'], raw: true }),
        User.findAll({ where: { estado: 1 }, order: [['fecha_registro', 'DESC']], limit: 5, attributes: ['id_usuario', 'nombre', 'email', 'fecha_registro'] })
    ]);
    return { total, porRol, recientes };
};

const getMiFundacion = async (userId) => {
    const fundacion = await Fundacion.findOne({
        where: { id_usuario: userId, estado: 1 },
        attributes: ['id_fundacion']
    });
    if (!fundacion) throw new Error('Fundación no encontrada');
    const idFundacion = fundacion.id_fundacion;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [mascotasDisponibles, mascotasEnProceso, mascotasAdoptadas,
        solicitudesPendientes, solicitudesEnEvaluacion, solicitudesAdoptadas,
        citasProximas, documentosPendientes, notificacionesNoLeidas, notificacionesCount] = await Promise.all([
        Mascota.count({ where: { id_fundacion: idFundacion, estado_mascota: 'DISPONIBLE', estado: 1 } }),
        Mascota.count({ where: { id_fundacion: idFundacion, estado_mascota: 'EN_PROCESO', estado: 1 } }),
        Mascota.count({ where: { id_fundacion: idFundacion, estado_mascota: 'ADOPTADO', estado: 1 } }),
        Solicitud.count({ where: { id_fundacion: idFundacion, estado_solicitud: 'PENDIENTE', estado: 1 } }),
        Solicitud.count({ where: { id_fundacion: idFundacion, estado_solicitud: 'EN_EVALUACION', estado: 1 } }),
        Solicitud.count({ where: { id_fundacion: idFundacion, estado_solicitud: 'ADOPTADA', estado: 1 } }),
        SolicitudCita.findAll({
            attributes: ['id_cita', 'fecha', 'hora_inicio', 'hora_fin', 'estado'],
            include: [{
                model: Solicitud,
                attributes: ['id_solicitud'],
                where: { id_fundacion: idFundacion, estado: 1 },
                required: true,
                include: [
                    { model: Mascota, attributes: ['nombre'] },
                    { model: User, attributes: ['nombre'] }
                ]
            }],
            where: { fecha: { [Op.between]: [today, weekEnd] }, estado: { [Op.ne]: 'RECHAZADA' }, estado_registro: 1 },
            order: [['fecha', 'ASC']], limit: 5
        }),
        SolicitudDocumento.count({
            include: [{ model: Solicitud, attributes: [], where: { id_fundacion: idFundacion, estado: 1 }, required: true }],
            where: { estado_revision: { [Op.ne]: 'APROBADO' }, estado: 1 }
        }),
        Notificacion.count({ where: { id_usuario: userId, leido: 0, estado: 1 } }),
        Notificacion.count({ where: { id_usuario: userId, estado: 1 } })
    ]);

    return {
        mascotas: {
            disponibles: mascotasDisponibles,
            enProceso: mascotasEnProceso,
            adoptadas: mascotasAdoptadas,
            total: mascotasDisponibles + mascotasEnProceso + mascotasAdoptadas
        },
        solicitudes: {
            pendientes: solicitudesPendientes,
            enEvaluacion: solicitudesEnEvaluacion,
            adoptadas: solicitudesAdoptadas,
            total: solicitudesPendientes + solicitudesEnEvaluacion + solicitudesAdoptadas
        },
        citasProximas: citasProximas.map(c => ({
            id: c.id_cita, fecha: c.fecha, hora_inicio: c.hora_inicio, hora_fin: c.hora_fin,
            estado: c.estado, adoptante: c.Solicitud?.User?.nombre || '',
            mascota: c.Solicitud?.Mascota?.nombre || '', id_solicitud: c.Solicitud?.id_solicitud
        })),
        documentosPendientes,
        notificaciones: { noLeidas: notificacionesNoLeidas, total: notificacionesCount }
    };
};

const getExcelReporte = async () => {
    const [mascotas, solicitudesRaw, fundaciones, usuarios] = await Promise.all([
        Mascota.findAll({ where: { estado: 1 }, attributes: ['id_mascota', 'nombre', 'especie', 'estado_mascota', 'fecha_publicacion'], raw: true }),
        sequelize.query(
            `SELECT s.id_solicitud, s.estado_solicitud, s.fecha_solicitud,
                    m.nombre AS mascota_nombre,
                    u.nombre AS user_nombre, u.email AS user_email,
                    f.nombre_fundacion AS fundacion_nombre
             FROM solicitud s
             LEFT JOIN mascota m ON m.id_mascota = s.id_mascota
             LEFT JOIN usuario u ON u.id_usuario = s.id_usuario
             LEFT JOIN fundacion f ON f.id_fundacion = s.id_fundacion
             WHERE s.estado = 1
             ORDER BY s.fecha_solicitud DESC
             LIMIT 500`,
            { type: Sequelize.QueryTypes.SELECT }
        ),
        Fundacion.findAll({ where: { estado: 1 }, attributes: ['id_fundacion', 'nombre_fundacion', 'telefono', 'ciudad', 'departamento', 'nit', 'estado_aprobacion', 'motivo_rechazo', 'fecha_registro'], include: [{ model: User, attributes: ['email'] }] }),
        User.count({ where: { estado: 1 } })
    ]);

    const solicitudes = solicitudesRaw.map(s => ({
        id_solicitud: s.id_solicitud,
        estado_solicitud: s.estado_solicitud,
        fecha_solicitud: s.fecha_solicitud,
        MascotaNombre: s.mascota_nombre || '',
        UserNombre: s.user_nombre || '',
        UserEmail: s.user_email || '',
        FundacionNombre: s.fundacion_nombre || ''
    }));

    const wb = new ExcelJS.Workbook();
    wb.creator = 'AdoptaMe';
    wb.created = new Date();

    const colors = { header: '1F4E79', subheader: 'D6E4F0', zebra: 'F2F7FB', border: 'B0B0B0', white: 'FFFFFF' };
    const font = { name: 'Segoe UI', size: 10 };

    function styleHeader(ws, row, height) {
        row.height = height || 22;
        row.eachCell((cell) => {
            cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.header } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = { bottom: { style: 'medium', color: { argb: colors.border } } };
        });
    }

    function addSection(wb, name, headers, data, colWidths) {
        const ws = wb.addWorksheet(name);
        const hRow = ws.addRow(headers);
        styleHeader(ws, hRow, 24);
        ws.columns = headers.map((h, i) => ({ header: h, width: colWidths[i] || 15 }));

        data.forEach((row, idx) => {
            const vals = headers.map((h) => (row[h] ?? ''));
            const r = ws.addRow(vals);
            r.height = 20;
            r.eachCell((cell, colIdx) => {
                cell.font = { name: 'Segoe UI', size: 10 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? colors.white : colors.zebra } };
                cell.border = { bottom: { style: 'thin', color: { argb: colors.border } } };
                cell.alignment = { vertical: 'middle', horizontal: [1, 5, 6].includes(colIdx) ? 'center' : 'left' };
            });
        });
        ws.addRow([]);
        return ws;
    }

    // Sheet 1: Resumen
    const resumen = wb.addWorksheet('Resumen');
    const rHeaders = ['Indicador', 'Valor'];
    const rhRow = resumen.addRow(rHeaders);
    styleHeader(resumen, rhRow, 24);
    resumen.columns = [{ width: 35 }, { width: 15 }];

    const stats = [
        ['MASCOTAS', ''],
        [`    Disponibles`, mascotas.filter((m) => m.estado_mascota === 'DISPONIBLE').length],
        [`    En Proceso`, mascotas.filter((m) => m.estado_mascota === 'EN_PROCESO').length],
        [`    Adoptadas`, mascotas.filter((m) => m.estado_mascota === 'ADOPTADO').length],
        [`    Total`, mascotas.length],
        ['', ''],
        ['SOLICITUDES', ''],
        [`    Pendientes`, solicitudes.filter((s) => s.estado_solicitud === 'PENDIENTE').length],
        [`    En Evaluación`, solicitudes.filter((s) => s.estado_solicitud === 'EN_EVALUACION').length],
        [`    Aprobadas`, solicitudes.filter((s) => s.estado_solicitud === 'APROBADA').length],
        [`    En Seguimiento`, solicitudes.filter((s) => s.estado_solicitud === 'EN_SEGUIMIENTO').length],
        [`    Adoptadas`, solicitudes.filter((s) => s.estado_solicitud === 'ADOPTADA').length],
        [`    Rechazadas`, solicitudes.filter((s) => s.estado_solicitud === 'RECHAZADA').length],
        [`    Total`, solicitudes.length],
        ['', ''],
        ['FUNDACIONES', ''],
        [`    Verificadas`, fundaciones.filter((f) => f.estado_aprobacion === 'APROBADA').length],
        [`    Pendientes`, fundaciones.filter((f) => f.estado_aprobacion === 'PENDIENTE').length],
        [`    Rechazadas`, fundaciones.filter((f) => f.estado_aprobacion === 'RECHAZADA').length],
        [`    Total`, fundaciones.length],
        ['', ''],
        ['USUARIOS', ''],
        [`    Total`, usuarios],
    ];
    stats.forEach((r, i) => {
        const row = resumen.addRow(r);
        row.height = 20;
        const isTitle = String(r[1]) === '' && r[0] !== '';
        row.eachCell((cell, c) => {
            cell.font = {
                name: 'Segoe UI',
                size: isTitle ? 11 : 10,
                bold: isTitle,
                color: isTitle ? { argb: colors.header } : undefined
            };
            if (isTitle) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8EDF2' } };
            } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? colors.white : colors.zebra } };
            }
            cell.alignment = {
                vertical: 'middle',
                horizontal: c === 0 ? 'left' : 'right',
                indent: c === 0 ? 1 : 0
            };
            cell.border = { bottom: { style: 'thin', color: { argb: colors.border } } };
        });
    });

    // Sheet 2: Mascotas
    addSection(wb, 'Mascotas',
        ['ID', 'Nombre', 'Especie', 'Estado', 'Registrada'],
        mascotas.map((m) => ({
            ID: m.id_mascota, Nombre: m.nombre, Especie: m.especie,
            Estado: m.estado_mascota === 'DISPONIBLE' ? 'Disponible' : m.estado_mascota === 'EN_PROCESO' ? 'En Proceso' : 'Adoptado',
            Registrada: m.fecha_publicacion ? new Date(m.fecha_publicacion).toLocaleDateString('es-CO') : ''
        })),
        [8, 25, 15, 15, 15]
    );

    // Sheet 3: Solicitudes
    addSection(wb, 'Solicitudes',
        ['ID', 'Estado', 'Adoptante', 'Email', 'Mascota', 'Fundación', 'Fecha'],
solicitudes.map((s) => 
({
            ID: s.id_solicitud, Estado: s.estado_solicitud,
            Adoptante: s.UserNombre, Email: s.UserEmail,
            Mascota: s.MascotaNombre, 'Fundación': s.FundacionNombre,
            Fecha: s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleDateString('es-CO') : ''
        })),
        [8, 18, 22, 28, 20, 22, 15]
    );

    // Sheet 4: Fundaciones
    addSection(wb, 'Fundaciones',
        ['ID', 'Nombre', 'Email', 'Teléfono', 'Ciudad', 'Departamento', 'NIT', 'Estado', 'Motivo Rechazo', 'Registrada'],
fundaciones.map((f) => 
({
            ID: f.id_fundacion, Nombre: f.nombre_fundacion, Email: f.User?.email || '',
            Teléfono: f.telefono || '', Ciudad: f.ciudad || '', Departamento: f.departamento || '',
            NIT: f.nit || '',
            Estado: f.estado_aprobacion === 'APROBADA' ? 'Verificada' : f.estado_aprobacion === 'PENDIENTE' ? 'Pendiente' : 'Rechazada',
            'Motivo Rechazo': f.motivo_rechazo || '',
            Registrada: f.fecha_registro ? new Date(f.fecha_registro).toLocaleDateString('es-CO') : ''
        })),
        [8, 25, 28, 15, 18, 18, 18, 14, 30, 15]
    );

    return wb;
};

module.exports = { getGeneral, getMascotas, getSolicitudes, getFundaciones, getUsuarios, getMiFundacion, getExcelReporte };
