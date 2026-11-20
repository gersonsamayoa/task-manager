
const pool = require('./config/database');

async function probarConexion() {
    try {
        const [rows] = await pool.query('SELECT NOW() AS fecha');

        console.log('¡Conexión a MySQL exitosa!');
        console.log('Fecha del servidor:', rows[0].fecha);

    } catch (error) {
        console.error('Error al conectar con MySQL:', error.message);
    } finally {
        await pool.end();
    }
}

probarConexion();
