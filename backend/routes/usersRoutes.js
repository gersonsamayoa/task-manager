const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword
} = require('../controllers/usersController');

// Ruta para registrar usuarios
router.post('/register', registerUser);

// Ruta para iniciar sesión
router.post('/login', loginUser);

// Ruta para obtener el perfil del usuario autenticado
router.get('/profile', require('../middleware/authMiddleware'), getUserProfile);

// Ruta para actualizar el perfil del usuario autenticado
router.patch('/profile', require('../middleware/authMiddleware'), updateUserProfile);

// Ruta para cambiar la contraseña del usuario autenticado
router.patch('/change-password', require('../middleware/authMiddleware'), changePassword);

module.exports = router;
