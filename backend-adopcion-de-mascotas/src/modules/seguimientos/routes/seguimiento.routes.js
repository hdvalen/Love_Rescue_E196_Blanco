const express = require('express');

const router = express.Router();

const seguimientoController = require('../controllers/seguimiento.controller');

const validateJWT = require('../../../middlewares/auth.middleware');

const validateRole = require('../../../middlewares/role.middleware');

router.post(
    '/',
    validateJWT,
    validateRole('FUNDACION', 'ADMINISTRADOR'),
    seguimientoController.create
);

router.get(
    '/',
    validateJWT,
    seguimientoController.getAll
);

router.get(
    '/mis-seguimientos',
    validateJWT,
    seguimientoController.getMisSeguimientos
);

router.get(
    '/:id',
    validateJWT,
    seguimientoController.getById
);

router.put(
    '/:id',
    validateJWT,
    validateRole('FUNDACION', 'ADMINISTRADOR'),
    seguimientoController.update
);

router.put(
    '/:id/completar',
    validateJWT,
    validateRole('FUNDACION', 'ADMINISTRADOR'),
    seguimientoController.complete
);

router.delete(
    '/:id',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    seguimientoController.remove
);

module.exports = router;
