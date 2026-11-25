const pool = require('../config/db');

const getPriorities = async (req, res) => {

    try {

        const [prioridades] = await pool.query(
            'SELECT id, name FROM priorities ORDER BY id ASC'
        );

        res.json({
            mensaje: 'Prioridades obtenidas correctamente',
            prioridades
        });

    } catch (error) {

        console.error('Error al obtener prioridades:', error);

        res.status(500).json({
            mensaje: 'Error al obtener las prioridades'
        });

    }

};

module.exports = {
    getPriorities
};