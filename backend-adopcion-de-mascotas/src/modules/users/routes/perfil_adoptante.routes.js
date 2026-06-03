const express = require('express');
const router = express.Router();
const controller = require('../controllers/perfil_adoptante.controller');
const validateJWT = require('../../../middlewares/auth.middleware');

router.get('/', validateJWT, controller.getProfile);
router.put('/', validateJWT, controller.updateProfile);

module.exports = router;
