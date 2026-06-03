const detalleService = require('../services/solicitud_detalle.service');

const getDetalle = async (req, res) => {
  try {
    const detalle = await detalleService.getDetalle(req.params.id, req.user?.id_rol);
    res.json({ ok: true, ...detalle });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

const addNota = async (req, res) => {
  try {
    const nota = await detalleService.addNota(req.params.id, {
      texto: req.body.texto,
      visibilidad: req.body.visibilidad,
      autor: req.body.autor || req.user?.nombre,
      nombre_autor: req.user?.nombre,
      id_autor: req.user?.id_usuario
    });
    res.status(201).json({ ok: true, nota });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const updateNota = async (req, res) => {
  try {
    const nota = await detalleService.updateNota(req.params.idNota, req.body);
    res.json({ ok: true, nota });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const deleteNota = async (req, res) => {
  try {
    await detalleService.deleteNota(req.params.idNota);
    res.json({ ok: true, message: 'Nota eliminada' });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const addTarea = async (req, res) => {
  try {
    if (!req.body.texto) {
      return res.status(400).json({ ok: false, message: 'El texto de la tarea es requerido' });
    }
    const tarea = await detalleService.addTarea(req.params.id, { texto: req.body.texto });
    res.status(201).json({ ok: true, tarea });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const toggleTarea = async (req, res) => {
  try {
    const tarea = await detalleService.toggleTarea(req.params.idTarea);
    res.json({ ok: true, tarea });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const deleteTarea = async (req, res) => {
  try {
    await detalleService.deleteTarea(req.params.idTarea);
    res.json({ ok: true, message: 'Tarea eliminada' });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const scheduleCita = async (req, res) => {
  try {
    const { fecha, hora_inicio, hora_fin, modalidad } = req.body;
    if (!fecha || !hora_inicio || !hora_fin) {
      return res.status(400).json({ ok: false, message: 'Fecha, hora inicio y hora fin son requeridos' });
    }
    const cita = await detalleService.scheduleCita(req.params.id, {
      fecha, hora_inicio, hora_fin,
      modalidad,
      creado_por: req.user?.id_usuario,
    });
    res.status(201).json({ ok: true, cita });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const updateCita = async (req, res) => {
  try {
    const cita = await detalleService.updateCita(req.params.idCita, req.body);
    res.json({ ok: true, cita });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const responderCita = async (req, res) => {
  try {
    const { estado, motivo_rechazo } = req.body;
    if (!estado) {
      return res.status(400).json({ ok: false, message: 'El estado es requerido (ACEPTADA o RECHAZADA)' });
    }
    const cita = await detalleService.responderCita(req.params.idCita, estado, req.user?.id_usuario, motivo_rechazo);
    res.json({ ok: true, cita });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const deleteCita = async (req, res) => {
  try {
    await detalleService.deleteCita(req.params.idCita);
    res.json({ ok: true, message: 'Cita eliminada' });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const addDocumento = async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ ok: false, message: 'Debe seleccionar al menos un archivo' });
    }
    if (!req.body.nombre || !req.body.tipo) {
      return res.status(400).json({ ok: false, message: 'Nombre y tipo del documento son requeridos' });
    }
    const docs = await detalleService.addDocumento(req.params.id, files, {
      nombre: req.body.nombre,
      tipo: req.body.tipo,
    });
    res.status(201).json({ ok: true, documentos: docs });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const revisarDocumento = async (req, res) => {
  try {
    const { estado, comentario_rechazo } = req.body;
    if (!estado) {
      return res.status(400).json({ ok: false, message: 'El estado de revisión es requerido' });
    }
    const doc = await detalleService.revisarDocumento(req.params.idDoc, estado, comentario_rechazo);
    res.json({ ok: true, documento: doc });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const deleteDocumento = async (req, res) => {
  try {
    await detalleService.deleteDocumento(req.params.idDoc);
    res.json({ ok: true, message: 'Documento eliminado' });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const updateChecklist = async (req, res) => {
  try {
    const evaluacion = await detalleService.updateChecklist(req.params.id, req.body);
    res.json({ ok: true, evaluacion });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const acceptContract = async (req, res) => {
  try {
    const evaluacion = await detalleService.acceptContract(req.params.id, req.ip, req.user.id_usuario);
    res.json({ ok: true, evaluacion });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

const descargarContrato = async (req, res) => {
  try {
    const pdfPath = await detalleService.getContratoPdf(
      req.params.id,
      req.user.id_usuario,
      req.user.id_rol
    );
    res.download(pdfPath);
  } catch (error) {
    const status = error.message === 'Contrato no encontrado' ? 404 : 403;
    res.status(status).json({ ok: false, message: error.message });
  }
};

const getHistorial = async (req, res) => {
  try {
    const historial = await detalleService.getHistorial(
      req.params.id,
      req.user.id_usuario,
      req.user.id_rol
    );
    res.json({ ok: true, historial });
  } catch (error) {
    const status = error.message === 'Solicitud no encontrada' ? 404 : 403;
    res.status(status).json({ ok: false, message: error.message });
  }
};

module.exports = {
  getDetalle,
  addNota, updateNota, deleteNota,
  addTarea, toggleTarea, deleteTarea,
  scheduleCita, updateCita, responderCita, deleteCita,
  addDocumento, revisarDocumento, deleteDocumento,
  updateChecklist, acceptContract, descargarContrato, getHistorial
};
