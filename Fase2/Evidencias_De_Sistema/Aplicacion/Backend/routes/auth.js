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

   
        const resultado = await db.query('SELECT * FROM Usuarios WHERE email = $1', [email]);
        if (resultado.rowCount === 0) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }
        
        const usuario = resultado.rows[0];

       
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }

      
        const token = jwt.sign(
            { 
                id: usuario.id, 
                refugio_id: usuario.refugio_id, 
                rol: usuario.rol 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' } 
        );

       
        res.json({
            mensaje: "¡Inicio de sesión exitoso!",
            token: token,
            usuario: {
                nombre: usuario.nombre_completo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: "Hubo un problema al procesar el inicio de sesión" });
    }
});

module.exports = router;