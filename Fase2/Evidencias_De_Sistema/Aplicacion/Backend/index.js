// Importar las librerías necesarias
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();
// Importar la conexión a la base de datos
const db = require('./db'); 
// Inicializar la aplicación Express
const app = express();
const PORT = 3000;

// Configurar herramientas de seguridad y recepción de datos
app.use(cors()); // Permite que el frontend se conecte
app.use(express.json()); // Permite recibir datos en formato JSON

// Ruta de prueba (Endpoint base)
app.get('/', (req, res) => {
    res.json({ 
        mensaje: "¡Servidor Backend de Huellita Segura corriendo exitosamente!",
        estado: "Activo"
    });
});



//CRUD REFUGIOS
app.get('/refugios', async (req, res) => {
    try {
        const resultado = await db.query('SELECT id, rut, nombre_organizacion, direccion,  email_contacto, telefono FROM Refugios');
        res.json({
            mensaje: "Lista de refugios obtenida con éxito",
            cantidad: resultado.rowCount,
            datos: resultado.rows
        });
    } catch (error) {
        console.error("Error al consultar refugios:", error);
        res.status(500).json({ error: "Hubo un problema al consultar la base de datos" });
    }
});


app.post('/refugios', async (req, res) => {
    try {
        
        const { rut, nombre_organizacion, direccion, email_contacto, telefono } = req.body;

      
        const nuevoRefugio = await db.query(
            `INSERT INTO Refugios (rut, nombre_organizacion, direccion, email_contacto, telefono) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [rut, nombre_organizacion, direccion, email_contacto, telefono]
        );

        
        res.status(201).json({
            mensaje: "¡Refugio registrado exitosamente!",
            datos: nuevoRefugio.rows[0]
        });

    } catch (error) {
        console.error("Error al registrar refugio:", error);
        res.status(500).json({ error: "Hubo un problema al guardar en la base de datos" });
    }
});


app.put('/refugios/:id', async (req, res) => {
    try {
        const { id } = req.params; // Atrapamos el ID desde la URL
        const { nombre_organizacion, direccion, email_contacto, telefono } = req.body;

        const refugioActualizado = await db.query(
            `UPDATE Refugios 
             SET nombre_organizacion = $1, direccion = $2, email_contacto = $3, telefono = $4 
             WHERE id = $5 RETURNING *`,
            [nombre_organizacion, direccion, email_contacto, telefono, id]
        );

      
        if (refugioActualizado.rowCount === 0) {
            return res.status(404).json({ error: "Refugio no encontrado" });
        }

        res.json({
            mensaje: "¡Refugio actualizado con éxito!",
            datos: refugioActualizado.rows[0]
        });

    } catch (error) {
        console.error("Error al actualizar refugio:", error);
        res.status(500).json({ error: "Hubo un problema al actualizar la base de datos" });
    }
});


app.delete('/refugios/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const refugioEliminado = await db.query(
            'DELETE FROM Refugios WHERE id = $1 RETURNING *',
            [id]
        );

        if (refugioEliminado.rowCount === 0) {
            return res.status(404).json({ error: "Refugio no encontrado" });
        }

        res.json({
            mensaje: "¡Refugio eliminado correctamente del sistema!",
            datos: refugioEliminado.rows[0]
        });

    } catch (error) {
        console.error("Error al eliminar refugio:", error);
        res.status(500).json({ error: "Hubo un problema al eliminar en la base de datos" });
    }
});

//CRUD USUARIOS
// Ruta para REGISTRAR un nuevo usuario (POST) con Bcrypt
app.post('/usuarios', async (req, res) => {
    try {
        const { refugio_id, rut, nombre_completo, email, password, rol } = req.body;

        // 1. Encriptar la contraseña antes de guardarla
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // 2. Guardar el usuario en la base de datos (con la contraseña encriptada)
        const nuevoUsuario = await db.query(
            `INSERT INTO Usuarios (refugio_id, rut, nombre_completo, email, password_hash, rol) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, refugio_id, nombre_completo, email, rol`,
            [refugio_id, rut, nombre_completo, email, password_hash, rol]
        );

        // 3. Responder con éxito (Nota: ¡Nunca devolvemos el password_hash en la respuesta!)
        res.status(201).json({
            mensaje: "¡Usuario registrado con éxito!",
            datos: nuevoUsuario.rows[0]
        });

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ error: "Hubo un problema al guardar el usuario en la base de datos" });
    }
});

// Ruta para OBTENER todos los usuarios (GET)
app.get('/usuarios', async (req, res) => {
    try {
        // Pedimos todos los datos, incluyendo el password_hash solo para fines de prueba
        const resultado = await db.query('SELECT id, refugio_id, rut, nombre_completo, email, rol, password_hash FROM Usuarios');
        
        res.json({
            mensaje: "Lista de usuarios obtenida con éxito",
            cantidad: resultado.rowCount,
            datos: resultado.rows
        });

    } catch (error) {
        console.error("Error al consultar usuarios:", error);
        res.status(500).json({ error: "Hubo un problema al consultar la base de datos" });
    }
});

// Encender el servidor
app.listen(PORT, () => {
    console.log(` Servidor ejecutándose en http://localhost:${PORT}`);
});
