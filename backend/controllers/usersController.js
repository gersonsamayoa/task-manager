
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrar un usuario
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validar campos obligatorios
        if (!name || !email || !password) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        // Verificar si el correo ya existe
        const [existingUser] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
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
            [name, email, hashedPassword]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: {
                id: result.insertId,
                name,
                email
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
        if (!email || !password) {
            return res.status(400).json({
                mensaje: 'El correo y la contraseña son obligatorios'
            });
        }

        // Buscar usuario por correo
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
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

module.exports = {
    registerUser,
    loginUser
};
