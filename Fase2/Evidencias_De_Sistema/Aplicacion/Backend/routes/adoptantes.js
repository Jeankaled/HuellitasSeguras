const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const verificarToken = require('../middlewares/verificarToken');
const { validarYFormatearRut } = require('../utils/validarRut');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-perfil${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const tiposPermitidos = /jpeg|jpg|png|webp/;
    const extValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeValido = tiposPermitidos.test(file.mimetype);
    if (extValida && mimeValido) return cb(null, true);
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP.'));
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});

const subirFotoPerfil = upload.fields([
    { name: 'foto_perfil', maxCount: 1 },
    { name: 'foto', maxCount: 1 }
]);

router.get('/', verificarToken, async (req, res) => {
    try {
        const { refugio_id, rol } = req.usuario;

        if (rol === 'Adoptante' || !refugio_id) {
            return res.status(403).json({ error: "No tienes permisos para acceder al directorio de adoptantes" });
        }

        const resultado = await db.query(
            `SELECT a.id, a.rut, a.nombre_completo, a.email, a.telefono, a.direccion
             FROM Adoptantes a
             WHERE a.id IN (
                 SELECT adoptante_id FROM Postulaciones WHERE refugio_id = $1
                 UNION
                 SELECT adoptante_id FROM Contratos_Adopcion WHERE refugio_id = $1
             )
             ORDER BY a.id DESC`,
            [refugio_id]
        );

        res.json({
            mensaje: "Directorio de adoptantes obtenido con éxito",
            cantidad: resultado.rowCount,
            datos: resultado.rows
        });
    } catch (error) {
        console.error("Error al obtener directorio de adoptantes:", error);
        res.status(500).json({ error: "Error interno al consultar el directorio de adoptantes" });
    }
});


router.get('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (req.usuario.rol === 'Adoptante' && String(req.usuario.id) !== String(id)) {
            return res.status(403).json({ error: "No tienes permisos para ver este perfil" });
        }

        const resultado = await db.query(
            'SELECT id, rut, nombre_completo, email, telefono, direccion, foto_perfil, preferencia_mascota, estado_verificacion_contacto FROM Adoptantes WHERE id = $1',
            [id]
        );
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Adoptante no encontrado" });

        const adoptante = resultado.rows[0];
        res.json({
            ...adoptante,
            datos: adoptante
        });
    } catch (error) {
        res.status(500).json({ error: "Error al consultar adoptante" });
    }
});

router.patch('/preferencias', verificarToken, async (req, res) => {
    try {
        const adoptante_id = req.usuario.id;
        const { preferencia_mascota } = req.body;

        const resultado = await db.query(
            `UPDATE Adoptantes 
             SET preferencia_mascota = $1 
             WHERE id = $2 
             RETURNING id, nombre_completo, email, preferencia_mascota`,
            [preferencia_mascota, adoptante_id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: "Adoptante no encontrado" });
        }

        res.json({
            mensaje: "Preferencia guardada con éxito",
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error("Error al guardar preferencia:", error);
        res.status(500).json({ error: "Error al actualizar preferencia del adoptante" });
    }
});


router.post('/', async (req, res) => {
    try {
        const { rut, nombre_completo, email, telefono, direccion, password } = req.body;

        if (!nombre_completo || !email || !password) {
            return res.status(400).json({ error: "Faltan campos obligatorios para crear la cuenta básica" });
        }

        const validacionRut = validarYFormatearRut(rut);
        if (!validacionRut.valido) {
            return res.status(400).json({ error: validacionRut.error });
        }
        const rutLimpio = validacionRut.rutLimpio;
        const emailLimpio = email.trim().toLowerCase();

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const nuevoAdoptante = await db.query(
            `INSERT INTO Adoptantes (rut, nombre_completo, email, password_hash, telefono, direccion) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre_completo, email, foto_perfil`,
            [rutLimpio, nombre_completo, emailLimpio, password_hash, telefono || null, direccion || null]
        );

        const adoptanteCreado = nuevoAdoptante.rows[0];

        const payloadToken = {
            id: adoptanteCreado.id,
            rol: 'Adoptante'
        };

        const token = jwt.sign(payloadToken, process.env.JWT_SECRET, { expiresIn: '2h' });

        res.status(201).json({
            mensaje: "Cuenta de adoptante creada exitosamente",
            token: token,
            usuario: {
                id: adoptanteCreado.id,
                nombre: adoptanteCreado.nombre_completo,
                email: adoptanteCreado.email,
                foto_perfil: adoptanteCreado.foto_perfil,
                rol: 'Adoptante'
            },
            adoptante: adoptanteCreado
        });

    } catch (error) {
        console.error("Error en POST adoptantes:", error);
        if (error.code === '23505') {
            return res.status(400).json({ error: "Este RUT o correo electrónico ya está registrado" });
        }
        res.status(500).json({ error: "Hubo un problema al crear la cuenta" });
    }
});

router.put('/:id', verificarToken, subirFotoPerfil, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id === 'undefined' || isNaN(Number(id))) {
            return res.status(400).json({ error: "ID de adoptante no válido en la petición" });
        }

        if (req.usuario.rol === 'Adoptante' && String(req.usuario.id) !== String(id)) {
            return res.status(403).json({ error: "No tienes permisos para editar este perfil" });
        }

        const limpiarTexto = (valor) => {
            if (valor === undefined || valor === null) return null;
            const texto = String(valor).trim();
            if (texto === '' || texto === 'undefined' || texto === 'null') return null;
            return texto;
        };

        const nombreFinal = limpiarTexto(req.body.nombre_completo || req.body.nombre);
        const telefonoFinal = limpiarTexto(req.body.telefono);
        const direccionFinal = limpiarTexto(req.body.direccion);
        const preferenciaFinal = limpiarTexto(req.body.preferencia_mascota);

        if (telefonoFinal && telefonoFinal.length > 20) {
            return res.status(400).json({ error: "El teléfono no puede superar los 20 caracteres" });
        }

        let estadoVerifFinal = null;
        if (req.body.estado_verificacion_contacto === true || req.body.estado_verificacion_contacto === 'true') {
            estadoVerifFinal = true;
        } else if (req.body.estado_verificacion_contacto === false || req.body.estado_verificacion_contacto === 'false') {
            estadoVerifFinal = false;
        }

        const archivo = req.files?.['foto_perfil']?.[0] || req.files?.['foto']?.[0];
        const nuevaFotoUrl = archivo ? `/uploads/${archivo.filename}` : null;

        const resultado = await db.query(
            `UPDATE Adoptantes 
             SET nombre_completo = COALESCE($1::varchar, nombre_completo), 
                 telefono = COALESCE($2::varchar, telefono), 
                 direccion = COALESCE($3::varchar, direccion), 
                 preferencia_mascota = COALESCE($4::varchar, preferencia_mascota),
                 estado_verificacion_contacto = COALESCE($5::boolean, estado_verificacion_contacto),
                 foto_perfil = COALESCE($6::varchar, foto_perfil)
             WHERE id = $7::integer 
             RETURNING id, rut, nombre_completo, email, telefono, direccion, foto_perfil, preferencia_mascota, estado_verificacion_contacto`,
            [
                nombreFinal,
                telefonoFinal,
                direccionFinal,
                preferenciaFinal,
                estadoVerifFinal,
                nuevaFotoUrl,
                Number(id)
            ]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: "Adoptante no encontrado" });
        }

        const adoptanteActualizado = resultado.rows[0];
        res.json({
            mensaje: "Adoptante actualizado",
            ...adoptanteActualizado,
            datos: adoptanteActualizado
        });
    } catch (error) {
        console.error("Error al actualizar adoptante:", error);
        res.status(500).json({
            error: error.detail || error.message || "Error al actualizar adoptante"
        });
    }
});

router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (req.usuario.rol === 'Adoptante' && String(req.usuario.id) !== String(id)) {
            return res.status(403).json({ error: "No tienes permisos para eliminar esta cuenta" });
        }

        const resultado = await db.query('DELETE FROM Adoptantes WHERE id = $1 RETURNING id', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Adoptante no encontrado" });
        res.json({ mensaje: "Adoptante eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar adoptante" });
    }
});

module.exports = router;