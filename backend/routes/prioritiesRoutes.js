const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const { getPriorities } = require('../controllers/prioritiesController');

// Obtener prioridades
router.get('/', authMiddleware, getPriorities);

module.exports = router;