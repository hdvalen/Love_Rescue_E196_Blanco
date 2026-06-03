const express = require('express');

const router = express.Router();

const userController = require('../controllers/user.controller');

const validateJWT = require('../../../middlewares/auth.middleware');

const validateRole = require('../../../middlewares/role.middleware');

const { validate } = require('../../../middlewares/validate.middleware');
const userValidator = require('../../../validators/user.validator');

const upload = require('../../../utils/multer');

router.get(
    '/perfil',
    validateJWT,
    userController.getProfile
);

router.get(
    '/',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    userController.getAll
);

router.get(
    '/:id',
    validateJWT,
    userController.getById
);

router.put(
    '/:id',
    validateJWT,
    validate(userValidator.update),
    userController.update
);

router.put(
    '/:id/password',
    validateJWT,
    validate(userValidator.updatePassword),
    userController.updatePassword
);

router.post(
    '/foto',
    validateJWT,
    upload.single('foto'),
    userController.uploadFoto
);

router.delete(
    '/:id',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    userController.remove
);

module.exports = router;
