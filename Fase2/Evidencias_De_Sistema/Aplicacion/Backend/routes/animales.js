const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'foto') {
        const esImagen = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
        return esImagen ? cb(null, true) : cb(new Error('La foto debe ser JPG, PNG o WEBP.'));
    }
    if (file.fieldname === 'pdf_ficha') {
        const esPdf = path.extname(file.originalname).toLowerCase() === '.pdf';
        return esPdf ? cb(null, true) : cb(new Error('La ficha clínica debe ser un archivo PDF.'));
    }
    cb(new Error(`Campo de archivo no esperado: ${file.fieldname}`));
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máx
    fileFilter
});

const subirArchivosAnimal = upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'pdf_ficha', maxCount: 1 }
]);

const normalizarVacunasJson = (vacunas) => {
    if (!vacunas) return '[]';
    try {
        const parsed = typeof vacunas === 'string' ? JSON.parse(vacunas) : vacunas;
        return Array.isArray(parsed) ? JSON.stringify(parsed) : '[]';
    } catch {
        return '[]';
    }
};

router.get('/', async (req, res) => {
    try {
        const { refugio_id } = req.usuario;
        const resultado = await db.query(
            `SELECT a.*, 
                    fc.esterilizado, 
                    fc.vacunas_al_dia, 
                    fc.vacunas, 
                    fc.observaciones_medicas, 
                    fc.pdf_url
             FROM Animales a
             LEFT JOIN Fichas_Clinicas fc ON a.id = fc.animal_id
             WHERE a.refugio_id = $1 
             ORDER BY a.fecha_ingreso DESC`,
            [refugio_id]
        );
        res.json({
            mensaje: "Lista de animales obtenida",
            cantidad: resultado.rowCount,
            datos: resultado.rows
        });
    } catch (error) {
        console.error("Error al consultar animales:", error);
        res.status(500).json({ error: "Hubo un problema al consultar los animales" });
    }
});

router.get('/catalogo/:refugio_id', async (req, res) => {
    try {
        const { refugio_id } = req.params;

        const refugioQuery = await db.query(
            `SELECT id, nombre_organizacion, direccion, telefono, email_contacto, color_principal, color_secundario, logo_url 
             FROM Refugios WHERE id = $1`,
            [refugio_id]
        );

        if (refugioQuery.rowCount === 0) {
            return res.status(404).json({ error: "Fundación no encontrada" });
        }

        const animalesQuery = await db.query(
            `SELECT a.*, 
                    COALESCE(fc.esterilizado, false) AS esterilizado,
                    COALESCE(fc.vacunas_al_dia, false) AS vacunas_al_dia,
                    COALESCE(fc.vacunas, '[]'::jsonb) AS vacunas,
                    fc.observaciones_medicas,
                    fc.pdf_url
             FROM Animales a
             LEFT JOIN Fichas_Clinicas fc ON a.id = fc.animal_id
             WHERE a.refugio_id = $1 AND a.estado IN ('Disponible', 'En adopción')
             ORDER BY a.fecha_ingreso DESC`,
            [refugio_id]
        );

        res.json({
            mensaje: "Catálogo obtenido con éxito",
            fundacion: refugioQuery.rows[0],
            cantidad_animales: animalesQuery.rowCount,
            animales: animalesQuery.rows
        });
    } catch (error) {
        console.error("Error al obtener catálogo:", error);
        res.status(500).json({ error: "Hubo un problema al consultar el catálogo" });
    }
});

router.post('/', subirArchivosAnimal, async (req, res) => {
    try {
        const { refugio_id } = req.usuario;
        const {
            nombre, especie, raza, sexo, estado, edad, microchip, historia,
            esterilizado, vacunas_al_dia, observaciones, observaciones_medicas, vacunas
        } = req.body;

        const microchipFinal = (!microchip || microchip === "" || microchip === "null") ? null : microchip;
        const fotoUrl = req.files?.['foto']?.[0] ? `/uploads/${req.files['foto'][0].filename}` : null;
        const pdfUrl = req.files?.['pdf_ficha']?.[0] ? `/uploads/${req.files['pdf_ficha'][0].filename}` : null;

        const esEsterilizado = esterilizado === true || esterilizado === 'true';
        const tieneVacunas = vacunas_al_dia === true || vacunas_al_dia === 'true';
        const obsFinal = observaciones_medicas || observaciones || '';
        const vacunasJson = normalizarVacunasJson(vacunas);

        const nuevoAnimal = await db.query(
            `INSERT INTO Animales (refugio_id, nombre, especie, raza, sexo, estado, edad, microchip, foto, historia) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [refugio_id, nombre, especie, raza, sexo, estado || 'Disponible', edad, microchipFinal, fotoUrl, historia]
        );

        const animalId = nuevoAnimal.rows[0].id;

        const fichaCreada = await db.query(
            `INSERT INTO Fichas_Clinicas (animal_id, refugio_id, esterilizado, vacunas_al_dia, vacunas, observaciones_medicas, pdf_url)
             VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7) RETURNING *`,
            [animalId, refugio_id, esEsterilizado, tieneVacunas, vacunasJson, obsFinal, pdfUrl]
        );

        res.status(201).json({
            mensaje: "¡Animal y ficha clínica registrados exitosamente!",
            datos: {
                ...nuevoAnimal.rows[0],
                ficha_clinica: fichaCreada.rows[0]
            }
        });
    } catch (error) {
        console.error("Error al registrar animal:", error);
        res.status(500).json({ error: "Hubo un problema al guardar el animal y su ficha clínica" });
    }
});

router.put('/:id', subirArchivosAnimal, async (req, res) => {
    try {
        const { id } = req.params;
        const { refugio_id } = req.usuario;
        const {
            nombre, especie, raza, sexo, estado, edad, microchip, historia,
            esterilizado, vacunas_al_dia, observaciones, observaciones_medicas, vacunas
        } = req.body;

        const microchipFinal = (!microchip || microchip === "" || microchip === "null") ? null : microchip;
        const nuevaFotoUrl = req.files?.['foto']?.[0] ? `/uploads/${req.files['foto'][0].filename}` : null;
        const nuevoPdfUrl = req.files?.['pdf_ficha']?.[0] ? `/uploads/${req.files['pdf_ficha'][0].filename}` : null;

        const esEsterilizado = esterilizado === true || esterilizado === 'true';
        const tieneVacunas = vacunas_al_dia === true || vacunas_al_dia === 'true';
        const obsFinal = observaciones_medicas || observaciones || '';
        const vacunasJson = normalizarVacunasJson(vacunas);

        const animalActualizado = await db.query(
            `UPDATE Animales 
             SET nombre = $1, especie = $2, raza = $3, sexo = $4, estado = $5, edad = $6, microchip = $7, historia = $8, foto = COALESCE($9, foto) 
             WHERE id = $10 AND refugio_id = $11 RETURNING *`,
            [nombre, especie, raza, sexo, estado, edad, microchipFinal, historia, nuevaFotoUrl, id, refugio_id]
        );

        if (animalActualizado.rowCount === 0) {
            return res.status(404).json({ error: "Animal no encontrado o sin permisos" });
        }

        const fichaActualizada = await db.query(
            `INSERT INTO Fichas_Clinicas (animal_id, refugio_id, esterilizado, vacunas_al_dia, vacunas, observaciones_medicas, pdf_url)
             VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
             ON CONFLICT (animal_id) DO UPDATE SET
                esterilizado = EXCLUDED.esterilizado,
                vacunas_al_dia = EXCLUDED.vacunas_al_dia,
                vacunas = EXCLUDED.vacunas,
                observaciones_medicas = EXCLUDED.observaciones_medicas,
                pdf_url = COALESCE(EXCLUDED.pdf_url, Fichas_Clinicas.pdf_url),
                fecha_ultima_actualizacion = CURRENT_TIMESTAMP
             RETURNING *`,
            [id, refugio_id, esEsterilizado, tieneVacunas, vacunasJson, obsFinal, nuevoPdfUrl]
        );

        res.json({
            mensaje: "Animal y ficha clínica actualizados",
            datos: {
                ...animalActualizado.rows[0],
                ficha_clinica: fichaActualizada.rows[0]
            }
        });
    } catch (error) {
        console.error("Error al actualizar animal:", error);
        res.status(500).json({ error: "Hubo un problema al actualizar el animal" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { refugio_id } = req.usuario;
        const animalEliminado = await db.query(
            'DELETE FROM Animales WHERE id = $1 AND refugio_id = $2 RETURNING *',
            [id, refugio_id]
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