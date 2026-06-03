const express = require('express');

const router = express.Router();

const notificacionController = require('../controllers/notificacion.controller');

const validateJWT = require('../../../middlewares/auth.middleware');

const validateRole = require('../../../middlewares/role.middleware');

router.post(
    '/',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    notificacionController.create
);

router.get(
    '/',
    validateJWT,
    notificacionController.getAll
);

router.put(
    '/leer-todas',
    validateJWT,
    notificacionController.marcarTodasLeidas
);

router.get(
    '/:id',
    validateJWT,
    notificacionController.getById
);

router.put(
    '/:id/leer',
    validateJWT,
    notificacionController.marcarLeida
);

router.delete(
    '/:id',
    validateJWT,
    notificacionController.remove
);

module.exports = router;
