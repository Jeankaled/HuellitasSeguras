const express = require('express');
const router = express.Router();
const db = require('../db');


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


router.post('/', async (req, res) => {
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


router.put('/:id', async (req, res) => {
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