const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');


const { 
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    restoreTask
} = require('../controllers/tasksController');

// Aquí agregaremos las rutas protegidas de tareas
router.get('/', authMiddleware, getTasks);
router.post('/', authMiddleware, createTask);
router.get('/:id', authMiddleware, getTaskById);
router.patch('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);
router.patch('/:id/restore', authMiddleware, restoreTask);

module.exports = router;