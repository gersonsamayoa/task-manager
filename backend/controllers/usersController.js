const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrar un usuario
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validar campos obligatorios
        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                mensaje: 'El nombre debe ser un texto y no puede estar vacío'
            });
        }

        if (typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password) {
            return res.status(400).json({
                mensaje: 'El correo y la contraseña son obligatorios'
            });
        }

        // Validar formato del correo
        const emailNormalizado = email.trim().toLowerCase();

        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoEmail.test(emailNormalizado)) {
            return res.status(400).json({
                mensaje: 'El correo electrónico no tiene un formato válido'
            });
        }

        // Validar longitud de la contraseña
        if (password.length < 8) {
            return res.status(400).json({
                mensaje: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        // Verificar si el correo ya existe
        const [existingUser] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [emailNormalizado]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                mensaje: 'El correo ya está registrado'
            });
        }

        // Encriptar contraseña mediante bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Guardar usuario en MySQL
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name.trim(), emailNormalizado, hashedPassword]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: {
                id: result.insertId,
                name: name.trim(),
                email: emailNormalizado
            }
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);

        res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }
};

// Iniciar sesión
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos obligatorios
        if (
            typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password
        ) {
            return res.status(400).json({
                mensaje: 'El correo y la contraseña son obligatorios'
            });
        }

        // Normalizar correo
        const emailNormalizado = email.trim().toLowerCase();

        // Buscar usuario por correo
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [emailNormalizado]
        );

        // Verificar si existe el usuario
        if (users.length === 0) {
            return res.status(401).json({
                mensaje: 'Credenciales incorrectas'
            });
        }

        const user = users[0];

        // Comparar contraseña
        const passwordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordValid) {
            return res.status(401).json({
                mensaje: 'Credenciales incorrectas'
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        // Responder al usuario
        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);

        res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }
};

// Obtener perfil del usuario autenticado
const getUserProfile = async (req, res) => {
    try {
        const userId = req.usuario.id;

        const [users] = await pool.query(
            'SELECT id, name, email FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json({
            mensaje: 'Perfil obtenido correctamente',
            usuario: users[0]
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error);

        res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }
};

// Actualizar perfil del usuario autenticado
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.usuario.id;
        const { name, email } = req.body;

        if (
            typeof name !== 'string' || !name.trim() ||
            typeof email !== 'string' || !email.trim()
        ) {
            return res.status(400).json({
                mensaje: 'El nombre y el correo son obligatorios'
            });
        }

        const emailNormalizado = email.trim().toLowerCase();

        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoEmail.test(emailNormalizado)) {
            return res.status(400).json({
                mensaje: 'El correo electrónico no tiene un formato válido'
            });
        }

        // Verificar que el correo no pertenezca a otro usuario
        const [existingUser] = await pool.query(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [emailNormalizado, userId]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                mensaje: 'El correo ya está registrado por otro usuario'
            });
        }

        await pool.query(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name.trim(), emailNormalizado, userId]
        );

        res.json({
            mensaje: 'Perfil actualizado correctamente',
            usuario: {
                id: userId,
                name: name.trim(),
                email: emailNormalizado
            }
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);

        res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }
};

// Cambiar contraseña del usuario autenticado
const changePassword = async (req, res) => {
    try {
        const userId = req.usuario.id;
        const { currentPassword, newPassword } = req.body;

        // Validar campos obligatorios
        if (
            typeof currentPassword !== 'string' || !currentPassword ||
            typeof newPassword !== 'string' || !newPassword
        ) {
            return res.status(400).json({
                mensaje: 'Debes proporcionar la contraseña actual y la nueva'
            });
        }

        // Validar longitud de la nueva contraseña
        if (newPassword.length < 8) {
            return res.status(400).json({
                mensaje: 'La nueva contraseña debe tener al menos 8 caracteres'
            });
        }

        // Obtener contraseña actual del usuario
        const [users] = await pool.query(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const passwordValid = await bcrypt.compare(
            currentPassword,
            users[0].password
        );

        if (!passwordValid) {
            return res.status(401).json({
                mensaje: 'La contraseña actual es incorrecta'
            });
        }

        // Encriptar nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña en MySQL
        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({
            mensaje: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);

        res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword
};