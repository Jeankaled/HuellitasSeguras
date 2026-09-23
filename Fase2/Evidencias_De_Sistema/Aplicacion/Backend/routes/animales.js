const express = require('express');
const router = express.Router();
const db = require('../db');



router.post('/', async (req, res) => {
    try {
        const { refugio_id, nombre, especie, raza, sexo, estado, microchip } = req.body;
        
        const nuevoAnimal = await db.query(
            `INSERT INTO Animales (refugio_id, nombre, especie, raza, sexo, estado, microchip) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [refugio_id, nombre, especie, raza, sexo, estado, microchip]
        );

        res.status(201).json({
            mensaje: "¡Animal registrado exitosamente!",
            datos: nuevoAnimal.rows[0]
        });
    } catch (error) {
        console.error("Error al registrar animal:", error);
        res.status(500).json({ error: "Hubo un problema al guardar el animal" });
    }
});

router.get('/', async (req, res) => {
    try {
        // Leemos la identidad del usuario desde el Token JWT
        const { rol, refugio_id } = req.usuario; 
        let resultado;

        if (rol === 'Administrador' || rol === 'Staff') {
            // AISLAMIENTO: El refugio SOLO ve sus propios animales
            resultado = await db.query('SELECT * FROM Animales WHERE refugio_id = $1', [refugio_id]);
        } else {
            // CATÁLOGO PÚBLICO: El adoptante ve todos los animales disponibles de cualquier refugio
            resultado = await db.query("SELECT * FROM Animales WHERE estado = 'Disponible'");
        }

        res.json({
            mensaje: "Lista de animales obtenida",
            cantidad: resultado.rowCount,
            datos: resultado.rows
        });
    } catch (error) {
        console.error("Error en GET animales:", error);
        res.status(500).json({ error: "Hubo un problema al consultar los animales" });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, especie, raza, sexo, estado, microchip } = req.body;

        const animalActualizado = await db.query(
            `UPDATE Animales 
             SET nombre = $1, especie = $2, raza = $3, sexo = $4, estado = $5, microchip = $6 
             WHERE id = $7 RETURNING *`,
            [nombre, especie, raza, sexo, estado, microchip, id]
        );

        if (animalActualizado.rowCount === 0) return res.status(404).json({ error: "Animal no encontrado" });

        res.json({
            mensaje: "Ficha clínica actualizada",
            datos: animalActualizado.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: "Hubo un problema al actualizar el animal" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const animalEliminado = await db.query(
            'DELETE FROM Animales WHERE id = $1 RETURNING *',
            [id]
        );

        if (animalEliminado.rowCount === 0) return res.status(404).json({ error: "Animal no encontrado" });

        res.json({
            mensaje: "Animal eliminado del sistema",
            datos: animalEliminado.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: "Hubo un problema al eliminar el animal" });
    }
});

module.exports = router;