const express = require('express');

const router = express.Router();

const fundacionController = require('../controllers/fundacion.controller');

const validateJWT = require('../../../middlewares/auth.middleware');

const validateRole = require('../../../middlewares/role.middleware');

const { validate } = require('../../../middlewares/validate.middleware');
const fundacionValidator = require('../../../validators/fundacion.validator');

const upload = require('../../../utils/multer');

router.post(
    '/',
    validateJWT,
    validateRole('FUNDACION'),
    validate(fundacionValidator.create),
    fundacionController.create
);

router.get(
    '/',
    fundacionController.getAll
);

router.get(
    '/:id',
    fundacionController.getById
);

router.put(
    '/:id',
    validateJWT,
    validateRole('FUNDACION'),
    validate(fundacionValidator.update),
    fundacionController.update
);

router.put(
    '/:id/aprobar',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    validate(fundacionValidator.aprobar),
    fundacionController.aprobar
);

router.post(
    '/:id/logo',
    validateJWT,
    validateRole('FUNDACION'),
    upload.single('logo'),
    fundacionController.uploadLogo
);

module.exports = router;