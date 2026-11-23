const pool = require('../config/db');

// Obtener tareas del usuario autenticado
const getTasks = async (req, res) => {
    try {
        const userId = req.usuario.id;

        const [tasks] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ? AND deleted_at IS NULL',
            [userId]
        );

        res.json({
            mensaje: 'Tareas obtenidas correctamente',
            tareas: tasks
        });

    } catch (error) {
        console.error('Error al obtener tareas:', error);

        res.status(500).json({
            mensaje: 'Error al obtener las tareas'
        });
    }
};

// Crear una nueva tarea para el usuario autenticado
const createTask = async (req, res) => {
    try {
        const userId = req.usuario.id;

        const {
            title,
            description,
            priority_id,
            due_date
        } = req.body;

        // Validar título
        if (typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({
                mensaje: 'El título debe ser un texto y no puede estar vacío'
            });
        }

        // Validar prioridad obligatoria
        if (!priority_id) {
            return res.status(400).json({
                mensaje: 'La prioridad es obligatoria'
            });
        }

        // Validar que la prioridad exista
        const [priorities] = await pool.query(
            'SELECT id FROM priorities WHERE id = ?',
            [priority_id]
        );

        if (priorities.length === 0) {
            return res.status(400).json({
                mensaje: 'La prioridad no es válida'
            });
        }

        // Validar descripción
        if (description !== undefined && description !== null &&
            typeof description !== 'string') {
            return res.status(400).json({
                mensaje: 'La descripción debe ser un texto'
            });
        }

        // Validar fecha de vencimiento
        if (due_date !== undefined && due_date !== null) {

            const fechaValida =
                typeof due_date === 'string' &&
                /^\d{4}-\d{2}-\d{2}$/.test(due_date) &&
                !isNaN(Date.parse(due_date)) &&
                new Date(due_date).toISOString().startsWith(due_date);

            if (!fechaValida) {
                return res.status(400).json({
                    mensaje: 'La fecha debe tener un formato válido YYYY-MM-DD'
                });
            }
        }

        // Insertar tarea
        const [result] = await pool.query(
            `INSERT INTO tasks
            (user_id, priority_id, title, description, due_date)
            VALUES (?, ?, ?, ?, ?)`,
            [
                userId,
                priority_id,
                title.trim(),
                description || null,
                due_date || null
            ]
        );

        res.status(201).json({
            mensaje: 'Tarea creada correctamente',
            tareaId: result.insertId
        });

    } catch (error) {
        console.error('Error al crear tarea:', error);

        res.status(500).json({
            mensaje: 'Error al crear la tarea'
        });
    }
};

// Obtener una tarea específica del usuario autenticado
const getTaskById = async (req, res) => {
    try {
        const userId = req.usuario.id;
        const taskId = req.params.id;

        // Validar ID de la tarea
        if (!Number.isInteger(Number(taskId)) || Number(taskId) <= 0) {
            return res.status(400).json({
                mensaje: 'El ID de la tarea no es válido'
            });
        }

        const [tasks] = await pool.query(
            `SELECT * FROM tasks
             WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
            [taskId, userId]
        );

        const task = tasks[0];

        if (!task) {
            return res.status(404).json({
                mensaje: 'Tarea no encontrada'
            });
        }

        res.json({
            mensaje: 'Tarea obtenida correctamente',
            tarea: task
        });

    } catch (error) {
        console.error('Error al obtener tarea:', error);

        res.status(500).json({
            mensaje: 'Error al obtener la tarea'
        });
    }
};

// Actualizar una tarea del usuario autenticado
const updateTask = async (req, res) => {
    try {
        const userId = req.usuario.id;
        const taskId = req.params.id;

        // Validar el ID de la tarea
        if (!Number.isInteger(Number(taskId)) || Number(taskId) <= 0) {
            return res.status(400).json({
                mensaje: 'El ID de la tarea no es válido'
            });
        }

        const {
            title,
            description,
            priority_id,
            status,
            due_date
        } = req.body;

        const campos = [];
        const valores = [];

        // Identificar los campos que queremos actualizar
        if (title !== undefined) {
            campos.push('title = ?');
            valores.push(title.trim());
        }

        if (description !== undefined) {
            campos.push('description = ?');
            valores.push(description);
        }

        if (priority_id !== undefined) {
            campos.push('priority_id = ?');
            valores.push(priority_id);
        }

        if (status !== undefined) {
            campos.push('status = ?');
            valores.push(status);
        }

        if (due_date !== undefined) {
            campos.push('due_date = ?');
            valores.push(due_date);
        }

        // Validar que se haya enviado al menos un campo
        if (campos.length === 0) {
            return res.status(400).json({
                mensaje: 'No se enviaron campos para actualizar'
            });
        }

        // Validar el título
        if (title !== undefined) {
            if (typeof title !== 'string' || !title.trim()) {
                return res.status(400).json({
                    mensaje: 'El título debe ser un texto y no puede estar vacío'
                });
            }
        }

        // Validar la descripción
        if (description !== undefined && description !== null) {
            if (typeof description !== 'string') {
                return res.status(400).json({
                    mensaje: 'La descripción debe ser un texto'
                });
            }
        }

        // Validar que la prioridad exista
        if (priority_id !== undefined) {

            const [priorities] = await pool.query(
                'SELECT id FROM priorities WHERE id = ?',
                [priority_id]
            );

            if (priorities.length === 0) {
                return res.status(400).json({
                    mensaje: 'La prioridad no es válida'
                });
            }
        }

        // Validar el estado
        const estadosPermitidos = [
            'pending',
            'in_progress',
            'completed'
        ];

        if (status !== undefined && !estadosPermitidos.includes(status)) {
            return res.status(400).json({
                mensaje: 'El estado de la tarea no es válido'
            });
        }

        // Validar fecha de vencimiento
        if (due_date !== undefined && due_date !== null) {

            const fechaValida =
                typeof due_date === 'string' &&
                /^\d{4}-\d{2}-\d{2}$/.test(due_date) &&
                !isNaN(Date.parse(due_date)) &&
                new Date(due_date).toISOString().startsWith(due_date);

            if (!fechaValida) {
                return res.status(400).json({
                    mensaje: 'La fecha debe tener un formato válido YYYY-MM-DD'
                });
            }
        }

        // Agregar identificadores al arreglo
        valores.push(taskId, userId);

        // Construir consulta dinámica
        const sql = `
            UPDATE tasks
            SET ${campos.join(', ')}
            WHERE id = ? AND user_id = ? AND deleted_at IS NULL
        `;

        const [result] = await pool.query(sql, valores);

        // Verificar si existe la tarea
        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Tarea no encontrada o sin cambios'
            });
        }

        res.json({
            mensaje: 'Tarea actualizada correctamente'
        });

    } catch (error) {
        console.error('Error al actualizar tarea:', error);

        res.status(500).json({
            mensaje: 'Error al actualizar la tarea'
        });
    }
};

// Deshabilitar una tarea del usuario autenticado
const deleteTask = async (req, res) => {
    try {
        const userId = req.usuario.id;
        const taskId = req.params.id;

        // Validar ID de la tarea
        if (!Number.isInteger(Number(taskId)) || Number(taskId) <= 0) {
            return res.status(400).json({
                mensaje: 'El ID de la tarea no es válido'
            });
        }

        const [result] = await pool.query(
            `UPDATE tasks
             SET deleted_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
            [taskId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Tarea no encontrada'
            });
        }

        res.json({
            mensaje: 'Tarea deshabilitada correctamente'
        });

    } catch (error) {
        console.error('Error al deshabilitar tarea:', error);

        res.status(500).json({
            mensaje: 'Error al deshabilitar la tarea'
        });
    }
};

// Recuperar una tarea deshabilitada
const restoreTask = async (req, res) => {
    try {
        const userId = req.usuario.id;
        const taskId = req.params.id;

        // Validar ID de la tarea
        if (!Number.isInteger(Number(taskId)) || Number(taskId) <= 0) {
            return res.status(400).json({
                mensaje: 'El ID de la tarea no es válido'
            });
        }

        const [result] = await pool.query(
            `UPDATE tasks
             SET deleted_at = NULL
             WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL`,
            [taskId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Tarea eliminada no encontrada'
            });
        }

        res.json({
            mensaje: 'Tarea recuperada correctamente'
        });

    } catch (error) {
        console.error('Error al recuperar tarea:', error);

        res.status(500).json({
            mensaje: 'Error al recuperar la tarea'
        });
    }
};



module.exports = {
    createTask,
    getTaskById,
    getTasks,
    updateTask,
    deleteTask,
    restoreTask
};
