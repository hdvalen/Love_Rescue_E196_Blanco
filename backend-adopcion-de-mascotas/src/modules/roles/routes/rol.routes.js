const express = require('express');

const router = express.Router();

const rolController = require('../controllers/rol.controller');

const validateJWT = require('../../../middlewares/auth.middleware');

const validateRole = require('../../../middlewares/role.middleware');

router.post(
    '/',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    rolController.create
);

router.get(
    '/',
    rolController.getAll
);

router.get(
    '/:id',
    rolController.getById
);

module.exports = router;
