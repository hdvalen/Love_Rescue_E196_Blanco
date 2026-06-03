const express = require('express');

const router = express.Router();

const reporteController = require('../controllers/reporte.controller');

const validateJWT = require('../../../middlewares/auth.middleware');

const validateRole = require('../../../middlewares/role.middleware');

router.get(
    '/publico',
    reporteController.publico
);

router.get(
    '/general',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    reporteController.general
);

router.get(
    '/mascotas',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    reporteController.mascotas
);

router.get(
    '/solicitudes',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    reporteController.solicitudes
);

router.get(
    '/fundaciones',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    reporteController.fundaciones
);

router.get(
    '/usuarios',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    reporteController.usuarios
);

router.get(
    '/mi-fundacion',
    validateJWT,
    validateRole('FUNDACION'),
    reporteController.miFundacion
);

router.get(
    '/excel',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    reporteController.excelReporte
);

module.exports = router;
