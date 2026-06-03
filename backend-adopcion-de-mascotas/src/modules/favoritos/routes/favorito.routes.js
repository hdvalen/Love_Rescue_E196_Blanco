const express = require('express');

const router = express.Router();

const favoritoController = require('../controllers/favorito.controller');

const validateJWT = require('../../../middlewares/auth.middleware');

router.post(
    '/:id_mascota',
    validateJWT,
    favoritoController.toggle
);

router.get(
    '/',
    validateJWT,
    favoritoController.getAll
);

router.get(
    '/check/:id_mascota',
    validateJWT,
    favoritoController.check
);

module.exports = router;
