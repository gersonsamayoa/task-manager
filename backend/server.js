
const express = require('express');

const app = express();
const PORT = 3000;

// Middleware para recibir datos JSON
app.use(express.json());

// Importar rutas
const usersRoutes = require('./routes/usersRoutes');

// Primera ruta de prueba
app.get('/', (req, res) => {
    res.json({
        mensaje: 'API Task Manager funcionando correctamente'
    });
});

// Rutas de usuarios
app.use('/api/users', usersRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
