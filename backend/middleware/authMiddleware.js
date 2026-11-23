const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Obtenemos el token enviado por el cliente
        const authHeader = req.headers.authorization;

        // Verificamos que exista el encabezado de autorización y que tenga el formato correcto
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                mensaje: 'Formato de token inválido'
            });
        }

        // Extraemos el token (Bearer TOKEN)
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                mensaje: 'Formato de token inválido'
            });
        }

        // Verificamos que el token sea válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Guardamos los datos del usuario en la petición
        req.usuario = decoded;

        // Permitimos continuar
        next();

    } catch (error) {
        return res.status(401).json({
            mensaje: 'Token inválido o expirado'
        });
    }
};

module.exports = authMiddleware;
