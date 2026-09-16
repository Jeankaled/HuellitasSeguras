// Archivo: routes/adoptantes.js
const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM Adoptantes');
        res.json({ mensaje: "Lista obtenida", cantidad: resultado.rowCount, datos: resultado.rows });
    } catch (error) {
        res.status(500).json({ error: "Error al consultar adoptantes" });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await db.query('SELECT * FROM Adoptantes WHERE id = $1', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Adoptante no encontrado" });
        res.json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar adoptante" });
    }
});


router.post('/', async (req, res) => {
    try {
        const { rut, nombre_completo, email, telefono, direccion } = req.body;
        const resultado = await db.query(
            `INSERT INTO Adoptantes (rut, nombre_completo, email, telefono, direccion) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [rut, nombre_completo, email, telefono, direccion]
        );
        res.status(201).json({ mensaje: "Adoptante creado", datos: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al crear adoptante", detalle: error.message });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, telefono, direccion, estado_verificacion_contacto } = req.body;
        const resultado = await db.query(
            `UPDATE Adoptantes 
             SET nombre_completo = $1, telefono = $2, direccion = $3, estado_verificacion_contacto = $4 
             WHERE id = $5 RETURNING *`,
            [nombre_completo, telefono, direccion, estado_verificacion_contacto, id]
        );
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Adoptante no encontrado" });
        res.json({ mensaje: "Adoptante actualizado", datos: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar adoptante" });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await db.query('DELETE FROM Adoptantes WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Adoptante no encontrado" });
        res.json({ mensaje: "Adoptante eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar adoptante" });
    }
});

module.exports = router;