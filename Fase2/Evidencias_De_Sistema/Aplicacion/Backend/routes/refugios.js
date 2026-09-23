const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
    }
});
const upload = multer({ storage: storage });

//CRUD REFUGIOS
router.get('/', async (req, res) => {
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


// POST Mixto: JSON + Archivo
router.post('/', upload.single('logo'), async (req, res) => {
    try {
        const { rut, nombre_organizacion, direccion, email_contacto, telefono, color_principal, color_secundario } = req.body;
        
        // Si hay archivo, construimos la URL pública local
        const logo_url = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

        const nuevoRefugio = await db.query(
            `INSERT INTO Refugios (rut, nombre_organizacion, direccion, email_contacto, telefono, logo_url, color_principal, color_secundario, estado_verificacion) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendiente') RETURNING *`,
            [rut, nombre_organizacion, direccion, email_contacto, telefono, logo_url, color_principal, color_secundario]
        );

        res.status(201).json({ mensaje: "Refugio registrado (Pendiente de aprobación)", datos: nuevoRefugio.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Hubo un problema al registrar el refugio" });
    }
});


router.put('/:id', upload.single('logo'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_organizacion, direccion, email_contacto, telefono, color_principal, color_secundario } = req.body;

        // Si hay archivo, construimos la URL pública. Si no hay, viaja como null.
        const logo_url = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

        const refugioActualizado = await db.query(
            `UPDATE Refugios 
             SET nombre_organizacion = $1, direccion = $2, email_contacto = $3, telefono = $4, 
                 logo_url = COALESCE($5, logo_url), color_principal = $6, color_secundario = $7
             WHERE id = $8 RETURNING *`,
            [nombre_organizacion, direccion, email_contacto, telefono, logo_url, color_principal, color_secundario, id]
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


router.delete('/:id', async (req, res) => {
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

module.exports = router;