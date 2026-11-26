const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        const refugio_id = req.usuario.refugio_id;
        if (!refugio_id) {
            return res.status(403).json({ error: "Solo el personal de una fundación puede crear horarios." });
        }

        const listaBloques = Array.isArray(req.body.bloques)
            ? req.body.bloques
            : [{ fecha: req.body.fecha, hora: req.body.hora, link_videollamada: req.body.link_videollamada }];

        const creados = [];
        for (const bloque of listaBloques) {
            if (!bloque.fecha || !bloque.hora) continue;
            const resInsert = await db.query(
                `INSERT INTO Horarios_Entrevista (refugio_id, fecha, hora, disponible, link_videollamada)
                 VALUES ($1, $2, $3, TRUE, $4)
                 RETURNING *`,
                [refugio_id, bloque.fecha, bloque.hora, bloque.link_videollamada || null]
            );
            creados.push(resInsert.rows[0]);
        }

        if (creados.length === 0) {
            return res.status(400).json({ error: "Debes enviar al menos un bloque válido con fecha y hora." });
        }

        res.status(201).json({
            mensaje: "Horarios creados con éxito",
            cantidad: creados.length,
            datos: creados
        });
    } catch (error) {
        console.error("Error al crear horarios:", error);
        res.status(500).json({ error: "Error interno al crear horarios" });
    }
});


router.get('/fundacion/:fundacionId', async (req, res) => {
    try {
        const { fundacionId } = req.params;

        if (req.usuario.rol === 'Adoptante') {
            const resultado = await db.query(
                `SELECT id, refugio_id, fecha, hora, disponible, link_videollamada
                 FROM Horarios_Entrevista
                 WHERE refugio_id = $1 AND disponible = TRUE
                 ORDER BY fecha ASC, hora ASC`,
                [fundacionId]
            );
            return res.json({
                mensaje: "Horarios disponibles obtenidos",
                cantidad: resultado.rowCount,
                datos: resultado.rows
            });
        }

        if (String(req.usuario.refugio_id) !== String(fundacionId)) {
            return res.status(403).json({ error: "No tienes permisos para ver los horarios de otra fundación." });
        }

        const resultado = await db.query(
            `SELECT h.*,
                    ad.nombre_completo AS nombre_adoptante,
                    ad.email AS correo_adoptante,
                    a.nombre AS nombre_animal
             FROM Horarios_Entrevista h
             LEFT JOIN Postulaciones p ON h.postulacion_id = p.id
             LEFT JOIN Adoptantes ad ON p.adoptante_id = ad.id
             LEFT JOIN Animales a ON p.animal_id = a.id
             WHERE h.refugio_id = $1
             ORDER BY h.fecha ASC, h.hora ASC`,
            [fundacionId]
        );

        res.json({
            mensaje: "Horarios de la fundación obtenidos",
            cantidad: resultado.rowCount,
            datos: resultado.rows
        });
    } catch (error) {
        console.error("Error al obtener horarios:", error);
        res.status(500).json({ error: "Error interno al consultar horarios" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const refugio_id = req.usuario.refugio_id;

        if (!refugio_id) {
            return res.status(403).json({ error: "Solo el personal de una fundación puede eliminar horarios." });
        }

        const eliminado = await db.query(
            'DELETE FROM Horarios_Entrevista WHERE id = $1 AND refugio_id = $2 AND disponible = TRUE RETURNING *',
            [id, refugio_id]
        );

        if (eliminado.rowCount === 0) {
            return res.status(400).json({ error: "No se puede eliminar: el horario no existe, no te pertenece o ya fue reservado." });
        }

        res.json({ mensaje: "Horario eliminado con éxito", datos: eliminado.rows[0] });
    } catch (error) {
        console.error("Error al eliminar horario:", error);
        res.status(500).json({ error: "Error interno al eliminar horario" });
    }
});

module.exports = router;