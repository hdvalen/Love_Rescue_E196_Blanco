const express = require('express');

const router = express.Router();

const mascotaController = require('../controllers/mascota.controller');
const fotoMascotaController = require('../controllers/foto_mascota.controller');

const validateJWT = require('../../../middlewares/auth.middleware');

const validateRole = require('../../../middlewares/role.middleware');

const { validate } = require('../../../middlewares/validate.middleware');
const mascotaValidator = require('../../../validators/mascota.validator');

const { createLimiter } = require('../../../middlewares/rateLimiter.middleware');

const upload = require('../../../utils/multer');

router.post(
    '/',
    validateJWT,
    validateRole('FUNDACION'),
    createLimiter,
    validate(mascotaValidator.create),
    mascotaController.create
);

router.get(
    '/',
    mascotaController.getAll
);

router.get(
    '/:id',
    mascotaController.getById
);

router.put(
    '/:id',
    validateJWT,
    validateRole('FUNDACION'),
    validate(mascotaValidator.update),
    mascotaController.update
);

router.delete(
    '/:id',
    validateJWT,
    validateRole('FUNDACION'),
    mascotaController.remove
);

router.post(
    '/:id/fotos',
    validateJWT,
    validateRole('FUNDACION'),
    upload.array('fotos', 5),
    fotoMascotaController.uploadFotos
);

router.delete(
    '/fotos/:fotoId',
    validateJWT,
    validateRole('FUNDACION'),
    fotoMascotaController.remove
);

module.exports = router;