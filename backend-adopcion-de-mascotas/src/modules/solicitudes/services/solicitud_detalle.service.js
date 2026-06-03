const Solicitud = require('../models/solicitud.model');
const Fundacion = require('../../fundaciones/models/fundacion.model');
const Mascota = require('../../mascotas/models/mascota.model');
const SolicitudNota = require('../models/solicitud_nota.model');
const SolicitudTarea = require('../models/solicitud_tarea.model');
const SolicitudCita = require('../models/solicitud_cita.model');
const SolicitudDocumento = require('../models/solicitud_documento.model');
const SolicitudEvaluacion = require('../models/solicitud_evaluacion.model');
const Notificacion = require('../../notificaciones/models/notificacion.model');
const SolicitudHistorial = require('../models/solicitud_historial.model');
const Seguimiento = require('../../seguimientos/models/seguimiento.model');
const User = require('../../users/models/user.model');

const getDetalle = async (idSolicitud, userRole) => {
  const isAdoptante = userRole === 3;

  const notasWhere = { id_solicitud: idSolicitud, estado: 1 };
  if (isAdoptante) {
    notasWhere.visibilidad = 'COMPARTIDA';
  }
  const notas = await SolicitudNota.findAll({ where: notasWhere });
  const tareas = await SolicitudTarea.findAll({ where: { id_solicitud: idSolicitud, estado: 1 } });
  const citas = await SolicitudCita.findAll({ where: { id_solicitud: idSolicitud, estado_registro: 1 } });
  const documentos = await SolicitudDocumento.findAll({ where: { id_solicitud: idSolicitud, estado: 1 } });
  const evaluacion = await SolicitudEvaluacion.findOne({ where: { id_solicitud: idSolicitud, estado: 1 } });

  let evaluacionSafe = evaluacion;
  if (isAdoptante && evaluacion) {
    evaluacionSafe = {
      id_evaluacion: evaluacion.id_evaluacion,
      id_solicitud: evaluacion.id_solicitud,
      entrevista: evaluacion.entrevista,
      visita: evaluacion.visita,
      documentos_verificados: evaluacion.documentos_verificados,
      contrato_aceptado: evaluacion.contrato_aceptado,
      contrato_fecha: evaluacion.contrato_fecha,
    };
  }

  return { notas, tareas, citas, documentos, evaluacion: evaluacionSafe };
};

const getSolicitudOrThrow = async (idSolicitud) => {
  const solicitud = await Solicitud.findByPk(idSolicitud, {
    include: [{ model: Mascota, attributes: ['nombre'] }]
  });
  if (!solicitud || solicitud.estado === 0) throw new Error('Solicitud no encontrada');
  return solicitud;
};

const getFundacionUserId = async (idSolicitud) => {
  const solicitud = await Solicitud.findByPk(idSolicitud, { raw: true, attributes: ['id_fundacion'] });
  if (!solicitud) return null;
  const fundacion = await Fundacion.findByPk(solicitud.id_fundacion, { raw: true, attributes: ['id_usuario'] });
  return fundacion?.id_usuario || null;
};

// ========== NOTAS ==========

const addNota = async (idSolicitud, data) => {
  return await SolicitudNota.create({
    id_solicitud: idSolicitud,
    texto: data.texto,
    visibilidad: data.visibilidad || 'PRIVADA',
    autor: data.autor || data.nombre_autor || 'Fundación',
    id_autor: data.id_autor || null
  });
};

const updateNota = async (idNota, data) => {
  const nota = await SolicitudNota.findByPk(idNota);
  if (!nota) throw new Error('Nota no encontrada');
  await nota.update(data);
  return nota;
};

const deleteNota = async (idNota) => {
  const nota = await SolicitudNota.findByPk(idNota);
  if (!nota) throw new Error('Nota no encontrada');
  await nota.update({ estado: 0 });
  return nota;
};

// ========== TAREAS ==========

const addTarea = async (idSolicitud, data) => {
  const tarea = await SolicitudTarea.create({
    id_solicitud: idSolicitud,
    texto: data.texto
  });
  const solicitud = await Solicitud.findByPk(idSolicitud, {
    include: [{ model: Mascota, attributes: ['nombre'] }]
  });
  if (solicitud) {
    await Notificacion.create({
      id_usuario: solicitud.id_usuario,
      id_solicitud: idSolicitud,
      titulo: 'Nueva tarea pendiente',
      mensaje: `Se ha agregado una tarea a tu solicitud para ${solicitud.Mascota?.nombre || 'la mascota'}: ${data.texto}`,
      tipo: 'SEGUIMIENTO'
    });
  }
  return tarea;
};

const toggleTarea = async (idTarea) => {
  const tarea = await SolicitudTarea.findByPk(idTarea);
  if (!tarea) throw new Error('Tarea no encontrada');
  await tarea.update({ completada: tarea.completada ? 0 : 1 });
  return tarea;
};

const deleteTarea = async (idTarea) => {
  const tarea = await SolicitudTarea.findByPk(idTarea);
  if (!tarea) throw new Error('Tarea no encontrada');
  await tarea.update({ estado: 0 });
  return tarea;
};

// ========== CITAS ==========

const scheduleCita = async (idSolicitud, data) => {
  const cita = await SolicitudCita.create({
    id_solicitud: idSolicitud,
    fecha: data.fecha,
    hora_inicio: data.hora_inicio,
    hora_fin: data.hora_fin,
    modalidad: data.modalidad || 'Presencial',
    creado_por: data.creado_por || null
  });
  const solicitud = await Solicitud.findByPk(idSolicitud, {
    include: [{ model: Mascota, attributes: ['nombre'] }]
  });
  if (solicitud) {
    const titulo = 'Nueva cita programada';
    const mensaje = `Se ha programado una cita ${data.modalidad?.toLowerCase() || 'presencial'} para tu solicitud de ${solicitud.Mascota?.nombre || 'la mascota'} el ${data.fecha} de ${data.hora_inicio} a ${data.hora_fin}`;
    await Notificacion.create({ id_usuario: solicitud.id_usuario, id_solicitud: idSolicitud, titulo, mensaje, tipo: 'SEGUIMIENTO' });

    const emailUtil = require('../../../utils/email');
    emailUtil.sendEventEmail(solicitud.id_usuario, 'Cita programada', [
      mensaje,
      'Por favor confirma tu asistencia desde la plataforma.'
    ]);
  }
  return cita;
};

const updateCita = async (idCita, data) => {
  const cita = await SolicitudCita.findByPk(idCita);
  if (!cita) throw new Error('Cita no encontrada');
  const allowed = ['fecha', 'hora_inicio', 'hora_fin', 'modalidad', 'estado'];
  const updates = {};
  for (const field of allowed) {
    if (data[field] !== undefined) updates[field] = data[field];
  }
  if (Object.keys(updates).length === 0) throw new Error('No hay campos válidos para actualizar');
  await cita.update(updates);
  const solicitud = await Solicitud.findByPk(cita.id_solicitud, {
    include: [{ model: Mascota, attributes: ['nombre'] }]
  });
  if (solicitud) {
    await Notificacion.create({
      id_usuario: solicitud.id_usuario,
      id_solicitud: cita.id_solicitud,
      titulo: 'Cita actualizada',
      mensaje: `La cita para ${solicitud.Mascota?.nombre || 'la mascota'} ha sido reprogramada`,
      tipo: 'SEGUIMIENTO'
    });
  }
  return cita;
};

const responderCita = async (idCita, estado, respondidoPor, motivoRechazo) => {
  if (!['ACEPTADA', 'RECHAZADA'].includes(estado)) {
    throw new Error('Estado inválido. Use ACEPTADA o RECHAZADA');
  }
  const cita = await SolicitudCita.findByPk(idCita);
  if (!cita) throw new Error('Cita no encontrada');
  const updateData = { estado };
  if (estado === 'RECHAZADA' && motivoRechazo) {
    updateData.motivo_rechazo = motivoRechazo;
  }
  await cita.update(updateData);
  const fundacionUserId = await getFundacionUserId(cita.id_solicitud);
  if (fundacionUserId) {
    const mensaje = estado === 'ACEPTADA'
      ? 'El adoptante ha aceptado la cita programada'
      : `El adoptante ha rechazado la cita. Motivo: ${motivoRechazo || 'No especificado'}`;
    await Notificacion.create({
      id_usuario: fundacionUserId,
      id_solicitud: cita.id_solicitud,
      titulo: estado === 'ACEPTADA' ? 'Cita aceptada' : 'Cita rechazada',
      mensaje,
      tipo: 'SEGUIMIENTO'
    });
  }
  return cita;
};

const deleteCita = async (idCita) => {
  const cita = await SolicitudCita.findByPk(idCita);
  if (!cita) throw new Error('Cita no encontrada');
  await cita.update({ estado_registro: 0 });
  return cita;
};

// ========== DOCUMENTOS ==========

const addDocumento = async (idSolicitud, files, data) => {
  const docs = [];

  await SolicitudDocumento.update(
    { estado: 0 },
    {
      where: {
        id_solicitud: idSolicitud,
        tipo: data.tipo,
        estado_revision: 'RECHAZADO',
        estado: 1
      }
    }
  );

  for (const file of files) {
    const doc = await SolicitudDocumento.create({
      id_solicitud: idSolicitud,
      nombre: data.nombre,
      tipo: data.tipo,
      nombre_archivo: file.filename,
      tamano: file.size
    });
    docs.push(doc);
  }
  const fundacionUserId = await getFundacionUserId(idSolicitud);
  if (fundacionUserId) {
    await Notificacion.create({
      id_usuario: fundacionUserId,
      id_solicitud: idSolicitud,
      titulo: 'Nuevo documento subido',
      mensaje: `El adoptante ha subido ${docs.length} documento(s): ${data.nombre}`,
      tipo: 'SEGUIMIENTO'
    });
  }
  return docs;
};

const revisarDocumento = async (idDoc, estado, comentario_rechazo) => {
  if (!['APROBADO', 'RECHAZADO'].includes(estado)) {
    throw new Error('Estado inválido. Use APROBADO o RECHAZADO');
  }
  const doc = await SolicitudDocumento.findByPk(idDoc);
  if (!doc) throw new Error('Documento no encontrado');
  await doc.update({ estado_revision: estado, comentario_rechazo: comentario_rechazo || null });
  const solicitud = await Solicitud.findByPk(doc.id_solicitud, {
    include: [{ model: Mascota, attributes: ['nombre'] }]
  });
  if (solicitud) {
    const titulo = estado === 'APROBADO' ? 'Documento aprobado' : 'Documento rechazado';
    const mensaje = estado === 'APROBADO'
      ? `Tu documento "${doc.nombre}" para ${solicitud.Mascota?.nombre || 'la mascota'} ha sido aprobado`
      : `Tu documento "${doc.nombre}" para ${solicitud.Mascota?.nombre || 'la mascota'} ha sido rechazado. Motivo: ${comentario_rechazo || 'No especificado'}`;
    await Notificacion.create({ id_usuario: solicitud.id_usuario, id_solicitud: doc.id_solicitud, titulo, mensaje, tipo: 'SEGUIMIENTO' });
    if (estado === 'RECHAZADO') {
    const emailUtil = require('../../../utils/email');
      emailUtil.sendEventEmail(solicitud.id_usuario, 'Documento rechazado', [
        mensaje,
        'Por favor sube un nuevo documento que cumpla con los requisitos.'
      ]);
    }
  }
  return doc;
};

const deleteDocumento = async (idDoc) => {
  const doc = await SolicitudDocumento.findByPk(idDoc);
  if (!doc) throw new Error('Documento no encontrado');
  await doc.update({ estado: 0 });
  return doc;
};

// ========== CHECKLIST & CONTRATO ==========

const updateChecklist = async (idSolicitud, data) => {
  let evaluacion = await SolicitudEvaluacion.findOne({ where: { id_solicitud: idSolicitud } });
  if (!evaluacion) {
    evaluacion = await SolicitudEvaluacion.create({ id_solicitud: idSolicitud });
  }
  const updates = {};
  const labels = { entrevista: 'entrevista', visita: 'visita', documentos_verificados: 'documentos verificados' };
  for (const [field, label] of Object.entries(labels)) {
    if (data[field] !== undefined) {
      updates[field] = data[field] ? 1 : 0;
      if (data[field]) {
        const solicitud = await Solicitud.findByPk(idSolicitud, {
          include: [{ model: Mascota, attributes: ['nombre'] }]
        });
        if (solicitud) {
          await Notificacion.create({
            id_usuario: solicitud.id_usuario,
            id_solicitud: idSolicitud,
            titulo: 'Evaluación actualizada',
            mensaje: `La ${label} para ${solicitud.Mascota?.nombre || 'la mascota'} ha sido completada`,
            tipo: 'SEGUIMIENTO'
          });
        }
      }
    }
  }
  await evaluacion.update(updates);
  return evaluacion;
};

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const acceptContract = async (idSolicitud, ip, usuarioId) => {
  const sequelize = require('../../../config/db');
  const transaction = await sequelize.transaction();
  let pdfPath = null;

  try {
    const solicitud = await Solicitud.findByPk(idSolicitud, {
      include: [
        { model: require('../../users/models/user.model'), attributes: ['nombre', 'email'] },
        { model: Mascota, attributes: ['nombre', 'especie', 'raza', 'id_mascota'] },
        { model: Fundacion, attributes: ['nombre_fundacion', 'logo_url', 'id_usuario'] }
      ],
      transaction
    });

    if (!solicitud) throw new Error('Solicitud no encontrada');
    if (solicitud.estado_solicitud !== 'APROBADA') throw new Error('El contrato solo puede firmarse cuando la solicitud está aprobada');

    let evaluacion = await SolicitudEvaluacion.findOne({
      where: { id_solicitud: idSolicitud, estado: 1 },
      transaction
    });

    if (!evaluacion) {
      evaluacion = await SolicitudEvaluacion.create({ id_solicitud: idSolicitud }, { transaction });
    }

    const contratoDir = path.join(__dirname, '../../../../uploads/contratos');
    if (!fs.existsSync(contratoDir)) {
      fs.mkdirSync(contratoDir, { recursive: true });
    }

    const pdfFilename = `contrato_${idSolicitud}_${Date.now()}.pdf`;
    pdfPath = path.join(contratoDir, pdfFilename);
    const doc = new PDFDocument({
      margins: { top: 95, bottom: 75, left: 50, right: 50 },
      bufferPages: true
    });
    const stream = fs.createWriteStream(pdfPath);

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);

      doc.pipe(stream);

      // ─── CONSTANTS ───
      const X0 = 50;
      const PAGE_W = 612;
      const CONTENT_W = PAGE_W - 100;
      const BLACK = '#000000';
      const MID = '#2d2d2d';
      const GRAY = '#555555';
      const now = new Date();
      const contratoId = `CT-${String(idSolicitud).padStart(5, '0')}`;
      const FONT = 'Helvetica';
      const FONT_B = 'Helvetica-Bold';
      const FONT_I = 'Helvetica-Oblique';
      const SZ = 8.5;
      const TITLE_SZ = 10;
      const LG = 3.5;
      const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

      // ─── HELPERS ───
      const fName = solicitud.Fundacion?.nombre_fundacion || '';
      var logoW = 0;
      if (solicitud.Fundacion?.logo_url) {
        try { const { resolveFilePath } = require('../../../utils/pathResolver'); const lp = resolveFilePath(solicitud.Fundacion.logo_url); if (lp && require('fs').existsSync(lp)) { logoW = 52; } } catch (_) {}
      }
      const hasLogo = logoW > 0;

      // ─── HELPERS (diseño limpio con aire) ───
      function sep() { doc.moveTo(X0, doc.y).lineTo(PAGE_W - X0, doc.y).strokeColor('#bbb').lineWidth(0.4).stroke(); doc.moveDown(0.4); }
      function heading(n, t) {
        if (doc.y > doc.page.height - doc.page.margins.bottom - 80) doc.addPage();
        doc.moveDown(0.6);
        doc.fontSize(TITLE_SZ).font(FONT_B).fillColor(BLACK).text(`${n}. ${t.toUpperCase()}`, { lineGap: 2 });
        doc.moveDown(0.3);
      }
      function sub(t) { doc.fontSize(SZ).font(FONT_I).fillColor(MID).text(t, { align: 'justify', lineGap: LG }); doc.moveDown(0.5); }
      function clause(n, t, b) {
        if (doc.y > doc.page.height - doc.page.margins.bottom - 60) doc.addPage();
        doc.fontSize(SZ).font(FONT_B).fillColor(BLACK).text(`${n}. ${t.toUpperCase()}`, { lineGap: 2 });
        doc.fontSize(SZ).font(FONT).fillColor(MID).text(b, { align: 'justify', lineGap: LG, indent: 12 });
        doc.moveDown(0.6);
      }

      // ─── TÍTULO DEL DOCUMENTO ───
      doc.moveDown(0.3);
      doc.fontSize(TITLE_SZ + 2).font(FONT_B).fillColor(BLACK).text('CONTRATO DE ADOPCIÓN RESPONSABLE DE MASCOTAS', { align: 'center', lineGap: 2 });
      doc.fontSize(8).font(FONT).fillColor(GRAY).text(`Contrato N° ${contratoId} — ${now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center', lineGap: 2 });
      doc.moveDown(0.6);

      // ─── COMPARECENCIA ───
      const day = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const fundacionEmail = 'contacto@ejemplo.com';
      const fundacionNIT = '000.000.000-0';
      const fundacionDireccion = 'Carrera 1 # 1-01, Bogotá D.C.';
      doc.fontSize(SZ).font(FONT).fillColor(MID).text(
        `En la ciudad de Bogotá D.C., República de Colombia, a los ${day} (${day}) días del mes de ${month} del año ${year}, comparecen: de una parte, ${solicitud.User?.nombre || '---'}, identificado como persona natural, quien en adelante se denominará EL/LA ADOPTANTE; y de otra parte, ${solicitud.Fundacion?.nombre_fundacion || '---'}, entidad sin ánimo de lucro dedicada a la protección animal, con NIT ${fundacionNIT}, con domicilio en la ${fundacionDireccion} y correo electrónico ${fundacionEmail}, quien en adelante se denominará LA FUNDACIÓN. Ambas partes, con plena capacidad legal para obligarse, celebran y suscriben el presente CONTRATO DE ADOPCIÓN RESPONSABLE, el cual se regirá por las cláusulas aquí dispuestas y por las normas legales colombianas vigentes aplicables.`,
        { align: 'justify', lineGap: LG }
      );
      sep();

      // ─── I. DECLARACIONES ───
      heading('I', 'DECLARACIONES');
      doc.fontSize(SZ).font(FONT_B).fillColor(BLACK).text('1.1. EL/LA ADOPTANTE DECLARA:', { indent: 10, lineGap: 2 }); doc.moveDown(0.1);
      sub('Que ha conocido y seleccionado libremente al animal descrito en el presente instrumento; que ha recibido información veraz, oportuna y completa sobre sus características, estado de salud, temperamento y cuidados requeridos; que cuenta con el espacio, recursos económicos y tiempo necesarios para garantizar su bienestar; y que acepta voluntariamente asumir todas las obligaciones civiles, administrativas y penales derivadas de esta adopción.');
      doc.fontSize(SZ).font(FONT_B).fillColor(BLACK).text('1.2. LA FUNDACIÓN DECLARA:', { indent: 10, lineGap: 2 }); doc.moveDown(0.1);
      sub('Que es una organización legalmente constituida conforme a las leyes colombianas, dedicada a la protección, rescate y adopción de animales de compañía; que ha proporcionado al adoptante la información necesaria sobre el animal; y que se compromete a realizar el acompañamiento y seguimiento posterior a la adopción.');
      sep();

      // ─── II. IDENTIFICACIÓN ───
      heading('II', 'IDENTIFICACIÓN DEL ANIMAL DE COMPAÑÍA');
      const tX = X0 + 5, tY = doc.y, tW = CONTENT_W - 10, rowH = 16;
      const tblData = [
        ['Nombre', solicitud.Mascota?.nombre || '---'], ['Especie', solicitud.Mascota?.especie || '---'],
        ['Raza', solicitud.Mascota?.raza || '---'], ['Sexo', solicitud.Mascota?.sexo === 'MACHO' ? 'Macho' : solicitud.Mascota?.sexo === 'HEMBRA' ? 'Hembra' : '---'],
        ['Edad', solicitud.Mascota?.edad ? `${solicitud.Mascota.edad} años` : '---'],
        ['Esterilizado', solicitud.Mascota?.esterilizado ? 'Sí' : 'No'], ['Vacunado', solicitud.Mascota?.vacunado ? 'Sí' : 'No'],
      ];
      const tblH = tblData.length * rowH;
      doc.rect(tX, tY, tW, tblH).lineWidth(0.3).strokeColor('#999').stroke();
      tblData.forEach(([l, v], i) => { const ry = tY + i * rowH; if (i % 2 === 0) doc.rect(tX, ry, tW, rowH).fillColor('#f5f5f5').fill(); doc.rect(tX, ry, tW, rowH).lineWidth(0.15).strokeColor('#ddd').stroke(); doc.fontSize(7.5).font(FONT_B).fillColor(BLACK).text(l, tX + 6, ry + 4); doc.fontSize(7.5).font(FONT).fillColor(MID).text(v, tX + 75, ry + 4); });
      doc.x = X0;
      doc.y = tY + tblH;

      // ─── III. OBJETO ───
      heading('III', 'OBJETO DEL CONTRATO');
      doc.fontSize(SZ).font(FONT).fillColor(MID).text('El presente contrato tiene por objeto formalizar la adopción responsable del animal de compañía identificado en la sección anterior, transfiriendo la tenencia material y el cuidado del mismo al ADOPTANTE, bajo las condiciones de protección, bienestar animal y seguimiento reguladas en este documento.', { align: 'justify', lineGap: LG });
      sep();

      // ─── IV. OBLIGACIONES ───
      heading('IV', 'OBLIGACIONES DEL ADOPTANTE');

      clause('PRIMERA', 'CUIDADOS GENERALES',
        'El adoptante se obliga a proporcionar al animal alimentación adecuada, balanceada y agua limpia; un espacio techado, seguro, higiénico y protegido de las inclemencias del clima; y un trato digno basado en el respeto y el cariño, garantizando las cinco libertades del bienestar animal.');
      clause('SEGUNDA', 'PROHIBICIÓN DE TRANSFERENCIA Y COMERCIALIZACIÓN',
        'Queda expresamente prohibido vender, alquilar, regalar, abandonar, ceder la tenencia o transferir a cualquier título el animal de compañía a terceras personas, laboratorios o establecimientos comerciales sin la previa autorización por escrito de LA FUNDACIÓN.');
      clause('TERCERA', 'ATENCIÓN VETERINARIA',
        'El adoptante se compromete a mantener al día el esquema de vacunación y desparasitación del animal, así como a proveer atención veterinaria oportuna ante cualquier signo de enfermedad, accidente o dolencia, acudiendo a profesionales titulados.');
      clause('CUARTA', 'SEGUIMIENTO Y VISITAS',
        'El adoptante autoriza de manera expresa a LA FUNDACIÓN para realizar visitas de seguimiento periódicas (presenciales o virtuales) con el fin de verificar el estado de salud, adaptación y entorno del animal, obligándose a enviar registros fotográficos o en video cuando le sean requeridos.');
      clause('QUINTA', 'NOTIFICACIÓN DE CAMBIOS',
        'El adoptante deberá notificar inmediatamente a LA FUNDACIÓN cualquier cambio de domicilio, número de contacto o correo electrónico, así como el extravío, enfermedad grave o fallecimiento del animal de compañía.');
      clause('SEXTA', 'ABANDONO Y MALTRATO',
        'El abandono físico, la negligencia en sus cuidados, el castigo físico o cualquier acto que configure maltrato animal conforme a la Ley 1774 de 2016 dará lugar a la resolución inmediata del contrato y a las acciones penales correspondientes.');
      clause('SÉPTIMA', 'RESOLUCIÓN POR INCUMPLIMIENTO',
        'En caso de constatarse el incumplimiento de cualquiera de las obligaciones pactadas en este instrumento, LA FUNDACIÓN podrá declarar la resolución del contrato y retirar de manera inmediata al animal del domicilio del adoptante, sin necesidad de requerimiento judicial previo.');

      if (solicitud._extraClauses) {
        for (let i = 0; i < solicitud._extraClauses; i++) {
          clause(`EXTRA ${i+1}`, 'CLÁUSULA ADICIONAL', 'Esta es una cláusula adicional del contrato. Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
        }
      }

      // ─── V. VIGENCIA ───
      heading('V', 'VIGENCIA Y JURISDICCIÓN');
      doc.fontSize(SZ).font(FONT).fillColor(MID).text('El presente contrato entra en vigencia a partir de la fecha de su aceptación electrónica y se mantendrá vigente durante toda la vida natural del animal de compañía, sin perjuicio de las obligaciones que por su naturaleza deben permanecer en el tiempo. Para todos los efectos legales, las partes se someten a la jurisdicción de los jueces y tribunales de la ciudad de Bogotá D.C., República de Colombia.', { align: 'justify', lineGap: LG });
      sep();

      // ─── VI. CERTIFICACIÓN DE ACEPTACIÓN ELECTRÓNICA ───
      if ((doc.page.height - doc.y - doc.page.margins.bottom) < 180) doc.addPage();
      heading('VI', 'ACEPTACIÓN ELECTRÓNICA');
      const boxTop = doc.y;
      const boxH = 110;
      doc.roundedRect(X0, boxTop, CONTENT_W, boxH, 4).lineWidth(0.8).strokeColor(BLACK).stroke();
      doc.rect(X0 + 2, boxTop + 2, CONTENT_W - 4, 14).fillColor('#222').fill();
      doc.fontSize(7.5).font(FONT_B).fillColor('#FFFFFF').text('REGISTRO DE ACEPTACIÓN ELECTRÓNICA', X0 + 8, boxTop + 4.5, { lineBreak: false });
      doc.fontSize(7.5).font(FONT).fillColor(BLACK);
      doc.text(`Fecha de aceptación: ${now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`, X0 + 12, boxTop + 22);
      doc.text(`Hora de aceptación: ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`, X0 + 12, boxTop + 34);
      doc.text(`Dirección IP: ${ip || 'No registrada'}`, X0 + 12, boxTop + 46);
      doc.text(`ID de transacción: ${contratoId}`, X0 + 12, boxTop + 58);
      doc.fontSize(6.5).font(FONT_I).fillColor(GRAY).text(
        'Esta aceptación electrónica constituye evidencia del consentimiento del adoptante conforme a la Ley 527 de 1999 y las normas aplicables sobre comercio electrónico en Colombia. No corresponde a una firma digital certificada ni reemplaza los mecanismos de firma electrónica avanzada previstos en la ley.',
        X0 + 12, boxTop + 74, { align: 'justify', lineGap: 2, width: CONTENT_W - 24 }
      );
      // Líneas de firma simbólicas
      doc.fontSize(8).font(FONT).fillColor(GRAY);
      doc.text('_________________________', X0 + 30, boxTop + 96, { lineBreak: false });
      doc.text('_________________________', X0 + CONTENT_W - 30 - 90, boxTop + 96, { lineBreak: false });
      doc.fontSize(6).font(FONT_I).fillColor(GRAY);
      doc.text('ADOPTANTE', X0 + 40, boxTop + 106, { lineBreak: false });
      doc.text('FUNDACIÓN', X0 + CONTENT_W - 30 - 70, boxTop + 106, { lineBreak: false });

      // === PASO 2: PLANTILLA POST-RENDER (DOS PASES) ===
      // Resolver ruta del logo una sola vez antes del bucle
      let pathLogo = null;
      if (solicitud.Fundacion?.logo_url) {
        try {
          const { resolveFilePath } = require('../../../utils/pathResolver');
          const lp = resolveFilePath(solicitud.Fundacion.logo_url);
          if (lp && require('fs').existsSync(lp)) pathLogo = lp;
        } catch (_) {}
      }
      const hasLogo2 = !!pathLogo;
      const textOffsetX = hasLogo2 ? 100 : 50;

      const range = doc.bufferedPageRange();
      const totalPages = range.count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);

        const oldBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;

        const X0 = 50;
        const width = doc.page.width - 50;
        const headerY = 15;
        const footerY = doc.page.height - 40;

        // 1. LOGO (esquina superior izquierda)
        if (hasLogo2) doc.image(pathLogo, X0, headerY, { width: 40 });

        // 2. HEADER TEXTS
        doc.fontSize(9).font(FONT_B);
        doc.text(fName || 'CONTRATO DE ADOPCIÓN', textOffsetX, headerY, { lineBreak: false });
        doc.text('CONTRATO DE ADOPCIÓN RESPONSABLE', textOffsetX, headerY + 12, { lineBreak: false });
        doc.fontSize(8).font(FONT);
        doc.text('Sistema AdoptaMe', textOffsetX, headerY + 24, { lineBreak: false });
        doc.moveTo(X0, headerY + 45).lineTo(width, headerY + 45).lineWidth(0.5).stroke();

        // 3. FOOTER
        doc.moveTo(X0, footerY).lineTo(width, footerY).lineWidth(0.5).stroke();
        doc.fontSize(8).font(FONT);
        doc.text('Contrato: ' + contratoId, X0, footerY + 8, { lineBreak: false });
        doc.text('Página ' + (i + 1) + ' de ' + totalPages, X0, footerY + 8, { align: 'right', width: width - X0, lineBreak: false });
        doc.text('AdoptaMe · Documento de adopción responsable', X0, footerY + 18, { align: 'center', width: width - X0, lineBreak: false });

        doc.page.margins.bottom = oldBottomMargin;
      }

      doc.end();
    });

    await evaluacion.update({
      contrato_aceptado: 1,
      contrato_fecha: new Date(),
      contrato_ip: ip || null,
      contrato_pdf: pdfFilename
    }, { transaction });

    const fundacionUserId = solicitud.Fundacion?.id_usuario || (await getFundacionUserId(idSolicitud));
    if (fundacionUserId) {
      await Notificacion.create({
        id_usuario: fundacionUserId,
        id_solicitud: idSolicitud,
        titulo: 'Contrato aceptado',
        mensaje: 'El adoptante ha aceptado el contrato de adopción',
        tipo: 'APROBACION'
      }, { transaction });
    }

    const prox = new Date(); prox.setDate(prox.getDate() + 15);
    if (solicitud.Mascota?.id_mascota) {
      await Mascota.update({ estado_mascota: 'ADOPTADO' }, { where: { id_mascota: solicitud.Mascota.id_mascota }, transaction });
    }
    await Seguimiento.create({
      id_solicitud: idSolicitud, id_usuario: fundacionUserId || usuarioId,
      tipo: 'CONTACTO', estado_seguimiento: 'PENDIENTE', proximo_contacto: prox,
      descripcion: `Seguimiento posterior a la firma del contrato de ${solicitud.Mascota?.nombre || 'la mascota'}`
    }, { transaction });
    await SolicitudHistorial.create({
      id_solicitud: idSolicitud, estado_anterior: solicitud.estado_solicitud,
      estado_nuevo: 'CONTRATO_FIRMADO', usuario_responsable: usuarioId,
      fecha: new Date(), motivo: 'Contrato de adopción aceptado electrónicamente'
    }, { transaction });
    await solicitud.update({ estado_solicitud: 'EN_SEGUIMIENTO' }, { transaction });

    await transaction.commit();

    // ─── Email notification (fire-and-forget) ───
    const emailUtil = require('../../../utils/email');
    emailUtil.sendEventEmail(fundacionUserId || solicitud.id_usuario, 'Contrato aceptado', [
        `El contrato de adopción para ${solicitud.Mascota?.nombre || 'la mascota'} ha sido aceptado electrónicamente.`,
        `Adoptante: ${solicitud.User?.nombre || 'No especificado'}`
    ]);

    return { ...evaluacion.toJSON(), contrato_pdf: pdfFilename };
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // transaction already committed — nothing to roll back
    }
    if (pdfPath && fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
    throw error;
  }
};

const getContratoPdf = async (idSolicitud, userId, userRole) => {
  const evaluacion = await SolicitudEvaluacion.findOne({
    where: { id_solicitud: idSolicitud, estado: 1 }
  });

  if (!evaluacion || !evaluacion.contrato_pdf) {
    throw new Error('Contrato no encontrado');
  }

  const solicitud = await Solicitud.findByPk(idSolicitud, {
    attributes: ['id_usuario', 'id_fundacion'],
    include: [{
      model: Fundacion,
      attributes: ['id_usuario'],
      required: false
    }]
  });

  if (!solicitud) throw new Error('Solicitud no encontrada');

  const isOwner = solicitud.id_usuario === userId;
  const isFundacionOwner = solicitud.Fundacion?.id_usuario === userId;
  const isAdmin = userRole === 1;

  if (!isOwner && !isFundacionOwner && !isAdmin) {
    throw new Error('No tienes permiso para descargar este contrato');
  }

  const pdfPath = path.join(__dirname, '../../../../uploads/contratos', path.basename(evaluacion.contrato_pdf));
  if (!fs.existsSync(pdfPath)) {
    throw new Error('Archivo de contrato no encontrado en el servidor');
  }

  return pdfPath;
};

const getHistorial = async (idSolicitud, userId, userRole) => {
  const solicitud = await Solicitud.findByPk(idSolicitud, {
    attributes: ['id_usuario', 'id_fundacion'],
    include: [{ model: Fundacion, attributes: ['id_usuario'], required: false }]
  });
  if (!solicitud) throw new Error('Solicitud no encontrada');

  const isOwner = solicitud.id_usuario === userId;
  const isFundacionOwner = solicitud.Fundacion?.id_usuario === userId;
  const isAdmin = userRole === 1;

  if (!isOwner && !isFundacionOwner && !isAdmin) {
    throw new Error('No tienes permiso para ver el historial');
  }

  return await SolicitudHistorial.findAll({
    where: { id_solicitud: idSolicitud },
    include: [{ model: User, as: 'Responsable', attributes: ['nombre'] }],
    order: [['fecha', 'ASC']]
  });
};

module.exports = {
  getDetalle,
  addNota, updateNota, deleteNota,
  addTarea, toggleTarea, deleteTarea,
  scheduleCita, updateCita, responderCita, deleteCita,
  addDocumento, revisarDocumento, deleteDocumento,
  updateChecklist, acceptContract, getContratoPdf, getHistorial
};
