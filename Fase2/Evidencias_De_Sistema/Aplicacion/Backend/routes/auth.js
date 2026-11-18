const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../db');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Debes ingresar correo y contraseña" });
        }

        const emailLimpio = email.trim().toLowerCase();

        let usuario = null;
        let tipoUsuario = null;
        let coloresTema = null; 

        let resultado = await db.query(`
            SELECT u.*, r.color_principal, r.color_secundario, r.nombre_organizacion
            FROM Usuarios u
            JOIN Refugios r ON u.refugio_id = r.id
            WHERE LOWER(TRIM(u.email)) = $1
        `, [emailLimpio]);

        if (resultado.rowCount > 0) {
            usuario = resultado.rows[0];
            tipoUsuario = 'Staff';
            coloresTema = {
                principal: usuario.color_principal,
                secundario: usuario.color_secundario
            };
        } else {
            resultado = await db.query(
                'SELECT * FROM Adoptantes WHERE LOWER(TRIM(email)) = $1',
                [emailLimpio]
            );
            if (resultado.rowCount > 0) {
                usuario = resultado.rows[0];
                tipoUsuario = 'Adoptante';
            }
        }

        if (!usuario) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }

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
                organizacion: usuario.nombre_organizacion,
                rol: payloadToken.rol,
                refugio_id: payloadToken.refugio_id,
                tema: coloresTema 
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Hubo un problema al procesar el inicio de sesión" });
    }
});


router.post(['/recuperar-password','/forgot-password'], async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Debes ingresar tu correo electrónico" });
        }

        const emailLimpio = email.trim().toLowerCase();
        let usuario = null;
        let tabla = null;

        let resultado = await db.query(
            'SELECT id, nombre_completo, email, password_hash FROM Usuarios WHERE LOWER(TRIM(email)) = $1',
            [emailLimpio]
        );

        if (resultado.rowCount > 0) {
            usuario = resultado.rows[0];
            tabla = 'Usuarios';
        } else {
            resultado = await db.query(
                'SELECT id, nombre_completo, email, password_hash FROM Adoptantes WHERE LOWER(TRIM(email)) = $1',
                [emailLimpio]
            );
            if (resultado.rowCount > 0) {
                usuario = resultado.rows[0];
                tabla = 'Adoptantes';
            }
        }

      
        if (!usuario) {
            return res.json({
                mensaje: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
            });
        }

        const secretoUnico = process.env.JWT_SECRET + usuario.password_hash;
        const resetToken = jwt.sign(
            { id: usuario.id, tabla, email: usuario.email },
            secretoUnico,
            { expiresIn: '15m' }
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const enlaceRecuperacion = `${frontendUrl}/reset-password?token=${resetToken}`;

        console.log("🔗 Enlace de recuperación generado:", enlaceRecuperacion);

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail({
                from: `"Huellita Segura" <${process.env.EMAIL_USER}>`,
                to: usuario.email,
                subject: 'Recuperación de contraseña - Huellita Segura 🐾',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #334155; max-width: 600px;">
                        <h2>Hola, ${usuario.nombre_completo}</h2>
                        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Huellita Segura</strong>.</p>
                        <p>Haz clic en el siguiente botón para crear una nueva contraseña (este enlace expira en 15 minutos):</p>
                        <br>
                        <a href="${enlaceRecuperacion}" style="padding: 12px 24px; background-color: #F472B6; color: white; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                            Restablecer mi contraseña
                        </a>
                        <br><br>
                        <p style="font-size: 12px; color: #64748B;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                    </div>
                `
            });
        }

        res.json({
            mensaje: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
        });

    } catch (error) {
        console.error("Error en forgot-password:", error);
        res.status(500).json({ error: "Hubo un problema al procesar la solicitud de recuperación" });
    }
});


router.post('/reset-password', async (req, res) => {
    try {
        const { token, nuevaPassword, password } = req.body;
        const claveNueva = nuevaPassword || password; // Acepta ambos nombres desde el frontend

        if (!token || !claveNueva) {
            return res.status(400).json({ error: "Falta el token o la nueva contraseña" });
        }

        if (claveNueva.length < 6) {
            return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
        }

        const decodificado = jwt.decode(token);
        if (!decodificado || !decodificado.id || !['Usuarios', 'Adoptantes'].includes(decodificado.tabla)) {
            return res.status(400).json({ error: "El enlace de recuperación no es válido" });
        }

        const consultaUsuario = await db.query(
            `SELECT id, password_hash FROM ${decodificado.tabla} WHERE id = $1`,
            [decodificado.id]
        );

        if (consultaUsuario.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const usuario = consultaUsuario.rows[0];

        const secretoUnico = process.env.JWT_SECRET + usuario.password_hash;
        try {
            jwt.verify(token, secretoUnico);
        } catch (err) {
            return res.status(400).json({ error: "El enlace ha expirado o ya fue utilizado. Solicita uno nuevo." });
        }

        const salt = await bcrypt.genSalt(10);
        const nuevoHash = await bcrypt.hash(claveNueva, salt);

        await db.query(
            `UPDATE ${decodificado.tabla} SET password_hash = $1 WHERE id = $2`,
            [nuevoHash, usuario.id]
        );

        res.json({ mensaje: "¡Contraseña actualizada con éxito! Ya puedes iniciar sesión." });

    } catch (error) {
        console.error("Error en reset-password:", error);
        res.status(500).json({ error: "Hubo un problema al restablecer la contraseña" });
    }
});

module.exports = router;