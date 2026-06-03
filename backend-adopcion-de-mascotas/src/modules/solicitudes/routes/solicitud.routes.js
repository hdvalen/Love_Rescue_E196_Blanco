const express = require('express');

const router = express.Router();

const solicitudController = require('../controllers/solicitud.controller');
const detalleController = require('../controllers/solicitud_detalle.controller');

const validateJWT = require('../../../middlewares/auth.middleware');

const validateRole = require('../../../middlewares/role.middleware');

const { validate } = require('../../../middlewares/validate.middleware');
const solicitudValidator = require('../../../validators/solicitud.validator');

const { solicitudLimiter } = require('../../../middlewares/rateLimiter.middleware');

const upload = require('../../../utils/multer');

router.post(
    '/',
    validateJWT,
    validateRole('ADOPTANTE'),
    solicitudLimiter,
    validate(solicitudValidator.create),
    solicitudController.create
);

router.get(
    '/',
    validateJWT,
    solicitudController.getAll
);

router.get(
    '/:id',
    validateJWT,
    solicitudController.getById
);

router.put(
    '/:id/en-evaluacion',
    validateJWT,
    validateRole('FUNDACION', 'ADMINISTRADOR'),
    solicitudController.ponerEnEvaluacion
);

router.put(
    '/:id/en-seguimiento',
    validateJWT,
    validateRole('FUNDACION', 'ADMINISTRADOR'),
    solicitudController.ponerEnSeguimiento
);

router.put(
    '/:id/aprobar',
    validateJWT,
    validateRole('FUNDACION', 'ADMINISTRADOR'),
    validate(solicitudValidator.estadoChange),
    solicitudController.aprobar
);

router.put(
    '/:id/finalizar',
    validateJWT,
    validateRole('FUNDACION', 'ADMINISTRADOR'),
    solicitudController.finalizar
);

router.put(
    '/:id/cancelar',
    validateJWT,
    solicitudController.cancelar
);

router.put(
    '/:id/rechazar',
    validateJWT,
    validateRole('FUNDACION', 'ADMINISTRADOR'),
    validate(solicitudValidator.estadoChange),
    solicitudController.rechazar
);

router.delete(
    '/:id',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    solicitudController.remove
);

// ---- Detalle routes (notas, tareas, citas, documentos, checklist, contrato) ----
router.get('/:id/detalle', validateJWT, detalleController.getDetalle);
router.get('/:id/historial', validateJWT, detalleController.getHistorial);

router.post('/:id/notas', validateJWT, detalleController.addNota);
router.put('/:id/notas/:idNota', validateJWT, detalleController.updateNota);
router.delete('/:id/notas/:idNota', validateJWT, detalleController.deleteNota);

router.post('/:id/tareas', validateJWT, detalleController.addTarea);
router.put('/:id/tareas/:idTarea/toggle', validateJWT, detalleController.toggleTarea);
router.delete('/:id/tareas/:idTarea', validateJWT, detalleController.deleteTarea);

router.post('/:id/citas', validateJWT, detalleController.scheduleCita);
router.put('/:id/citas/:idCita', validateJWT, detalleController.updateCita);
router.put('/:id/citas/:idCita/responder', validateJWT, detalleController.responderCita);
router.delete('/:id/citas/:idCita', validateJWT, detalleController.deleteCita);

router.post('/:id/documentos', validateJWT, upload.array('documentos', 10), detalleController.addDocumento);
router.put('/:id/documentos/:idDoc/revisar', validateJWT, detalleController.revisarDocumento);
router.delete('/:id/documentos/:idDoc', validateJWT, detalleController.deleteDocumento);

router.put('/:id/checklist', validateJWT, detalleController.updateChecklist);
router.put('/:id/contrato', validateJWT, detalleController.acceptContract);
router.get('/:id/contrato/descargar', (req, res, next) => {
  if (req.query.token && !req.headers.authorization) {
    req.headers.authorization = 'Bearer ' + req.query.token;
  }
  next();
}, validateJWT, detalleController.descargarContrato);

module.exports = router;
