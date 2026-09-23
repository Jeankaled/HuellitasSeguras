// Archivo: routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let usuario = null;
        let tipoUsuario = null;

        // 1. Buscar primero en el Staff del Refugio
        let resultado = await db.query('SELECT * FROM Usuarios WHERE email = $1', [email]);
        if (resultado.rowCount > 0) {
            usuario = resultado.rows[0];
            tipoUsuario = 'Staff';
        } else {
            // 2. Si no es Staff, buscar en Adoptantes Globales
            resultado = await db.query('SELECT * FROM Adoptantes WHERE email = $1', [email]);
            if (resultado.rowCount > 0) {
                usuario = resultado.rows[0];
                tipoUsuario = 'Adoptante';
            }
        }

        // 3. Validar si existe el correo
        if (!usuario) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }

        // 4. Validar contraseña con Bcrypt
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }

        // 5. Fabricar Token Dinámico
        // Si es adoptante, su rol es 'Adoptante' y NO tiene refugio_id, lo que le permite ver todo.
        const payloadToken = {
            id: usuario.id,
            rol: tipoUsuario === 'Staff' ? usuario.rol : 'Adoptante'
        };
        if (tipoUsuario === 'Staff') {
            payloadToken.refugio_id = usuario.refugio_id;
        }

        const token = jwt.sign(payloadToken, process.env.JWT_SECRET, { expiresIn: '2h' });

        res.json({
            mensaje: "¡Inicio de sesión exitoso!",
            token: token,
            usuario: {
                nombre: usuario.nombre_completo,
                rol: payloadToken.rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Hubo un problema al procesar el inicio de sesión" });
    }
});

module.exports = router;