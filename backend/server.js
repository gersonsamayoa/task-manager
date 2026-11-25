const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configuración CORS
app.use(cors({
    origin: 'http://localhost:4200'
}));

// Middleware para recibir datos JSON
app.use(express.json());

// Importar rutas
const usersRoutes = require('./routes/usersRoutes');
const tasksRoutes = require('./routes/tasksRoutes');
const prioritiesRoutes = require('./routes/prioritiesRoutes');

// Primera ruta de prueba
app.get('/', (req, res) => {
    res.json({
        mensaje: 'API Task Manager funcionando correctamente'
    });
});

// Rutas de usuarios
app.use('/api/users', usersRoutes);

// Rutas de tareas
app.use('/api/tasks', tasksRoutes);

//Rutas de prioridades
app.use('/api/priorities', prioritiesRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
