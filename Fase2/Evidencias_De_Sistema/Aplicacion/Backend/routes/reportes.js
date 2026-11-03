const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                id, 
                adoptante_rut, 
                tipo_falta, 
                descripcion, 
                fecha_reporte
            FROM Reportes_Adoptantes
            ORDER BY fecha_reporte DESC;
        `;
        const resultado = await db.query(query);
        
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener reportes de adoptantes:", error);
        res.status(500).json({ error: 'Error al obtener los reportes de adoptantes' });
    }
});

router.post('/', async (req, res) => {
    try {
        const refugio_id = req.usuario.refugio_id; 
        const { adoptante_rut, tipo_falta, descripcion } = req.body;

        const nuevoReporte = await db.query(
            `INSERT INTO Reportes_Adoptantes (refugio_id, adoptante_rut, tipo_falta, descripcion) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [refugio_id, adoptante_rut, tipo_falta, descripcion]
        );

        res.status(201).json({ 
            mensaje: "Adoptante ingresado a la lista roja con éxito", 
            datos: nuevoReporte.rows[0] 
        });
    } catch (error) {
        console.error("Error al reportar adoptante:", error);
        res.status(500).json({ error: 'Error al registrar el reporte' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const refugio_id = req.usuario.refugio_id;
        const { adoptante_rut, tipo_falta, descripcion } = req.body;

        const reporteActualizado = await db.query(
            `UPDATE Reportes_Adoptantes 
             SET adoptante_rut = COALESCE(NULLIF($1, ''), adoptante_rut),
                 tipo_falta = COALESCE(NULLIF($2, ''), tipo_falta),
                 descripcion = COALESCE(NULLIF($3, ''), descripcion)
             WHERE id = $4 AND refugio_id = $5 
             RETURNING *`,
            [adoptante_rut, tipo_falta, descripcion, id, refugio_id]
        );

        if (reporteActualizado.rowCount === 0) {
            return res.status(404).json({ error: "Reporte no encontrado o sin permisos para editarlo" });
        }

        res.json({ 
            mensaje: "Reporte actualizado con éxito", 
            datos: reporteActualizado.rows[0] 
        });
    } catch (error) {
        console.error("Error al actualizar reporte:", error);
        res.status(500).json({ error: 'Error al actualizar el reporte' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const refugio_id = req.usuario.refugio_id;

        const reporteEliminado = await db.query(
            'DELETE FROM Reportes_Adoptantes WHERE id = $1 AND refugio_id = $2 RETURNING *',
            [id, refugio_id]
        );

        if (reporteEliminado.rowCount === 0) {
            return res.status(404).json({ error: "Reporte no encontrado o sin permisos para eliminarlo" });
        }

        res.json({ 
            mensaje: "Reporte eliminado de la lista roja", 
            datos: reporteEliminado.rows[0] 
        });
    } catch (error) {
        console.error("Error al eliminar reporte:", error);
        res.status(500).json({ error: 'Error al eliminar el reporte' });
    }
});

module.exports = router;