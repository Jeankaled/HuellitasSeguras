const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-ficha${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const esPdf = path.extname(file.originalname).toLowerCase() === '.pdf' && file.mimetype === 'application/pdf';
    if (esPdf) {
        return cb(null, true);
    }
    cb(new Error('Formato no válido. La ficha clínica debe ser un archivo PDF.'));
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Máximo 10 MB
    fileFilter
});


const parsearBooleano = (valor) => valor === true || valor === 'true' || valor === 1 || valor === '1';

const normalizarVacunasJson = (vacunas) => {
    if (!vacunas) return '[]';
    try {
        const parsed = typeof vacunas === 'string' ? JSON.parse(vacunas) : vacunas;
        return Array.isArray(parsed) ? JSON.stringify(parsed) : '[]';
    } catch {
        return '[]';
    }
};

const parsearPeso = (peso) => {
    if (peso === undefined || peso === null || peso === '' || peso === 'null') return null;
    const numero = Number(peso);
    return Number.isNaN(numero) ? null : numero;
};



router.get('/', async (req, res) => {
    try {
        const { refugio_id } = req.usuario;
        if (!refugio_id) {
            return res.status(403).json({ error: "Acceso restringido al personal del refugio" });
        }

        const resultado = await db.query(
            `SELECT fc.*, 
                    a.nombre AS nombre_animal, 
                    a.especie AS especie_animal, 
                    a.raza AS raza_animal, 
                    a.foto AS foto_animal
             FROM Fichas_Clinicas fc
             JOIN Animales a ON fc.animal_id = a.id
             WHERE fc.refugio_id = $1
             ORDER BY fc.fecha_ultima_actualizacion DESC`,
            [refugio_id]
        );

        res.json({
            mensaje: "Fichas clínicas obtenidas",
            cantidad: resultado.rowCount,
            datos: resultado.rows
        });
    } catch (error) {
        console.error("Error al listar fichas clínicas:", error);
        res.status(500).json({ error: "Hubo un problema al consultar las fichas clínicas" });
    }
});

router.get('/animal/:animal_id', async (req, res) => {
    try {
        const { animal_id } = req.params;

        const animalExiste = await db.query('SELECT id FROM Animales WHERE id = $1', [animal_id]);
        if (animalExiste.rowCount === 0) {
            return res.status(404).json({ error: "Mascota no encontrada" });
        }

        const resultado = await db.query(
            `SELECT id,
                    animal_id,
                    refugio_id,
                    esterilizado,
                    vacunas_al_dia,
                    COALESCE(vacunas, '[]'::jsonb) AS vacunas,
                    peso_kg,
                    diagnostico_ingreso,
                    observaciones_medicas,
                    observaciones_medicas AS observaciones,
                    observaciones_medicas AS tratamientos,
                    pdf_url,
                    fecha_ultima_actualizacion
             FROM Fichas_Clinicas
             WHERE animal_id = $1`,
            [animal_id]
        );

        if (resultado.rowCount === 0) {
            return res.json({
                animal_id: Number(animal_id),
                esterilizado: false,
                vacunas_al_dia: false,
                vacunas: [],
                peso_kg: null,
                diagnostico_ingreso: '',
                observaciones_medicas: '',
                observaciones: '',
                tratamientos: 'Sin antecedentes registrados',
                pdf_url: null
            });
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al obtener ficha clínica por animal:", error);
        res.status(500).json({ error: "Hubo un problema al consultar la ficha clínica" });
    }
});

router.post('/', upload.single('pdf_ficha'), async (req, res) => {
    try {
        const { refugio_id } = req.usuario;
        if (!refugio_id) {
            return res.status(403).json({ error: "Solo el personal del refugio puede registrar fichas clínicas" });
        }

        const {
            animal_id,
            esterilizado,
            vacunas_al_dia,
            vacunas,
            peso_kg,
            diagnostico_ingreso,
            observaciones_medicas,
            observaciones
        } = req.body;

        if (!animal_id) {
            return res.status(400).json({ error: "El campo animal_id es obligatorio" });
        }

        const animalValido = await db.query(
            'SELECT id FROM Animales WHERE id = $1 AND refugio_id = $2',
            [animal_id, refugio_id]
        );
        if (animalValido.rowCount === 0) {
            return res.status(404).json({ error: "Animal no encontrado o no pertenece a tu refugio" });
        }

        const esEsterilizado = parsearBooleano(esterilizado);
        const tieneVacunas = parsearBooleano(vacunas_al_dia);
        const vacunasJson = normalizarVacunasJson(vacunas);
        const pesoFinal = parsearPeso(peso_kg);
        const obsFinal = observaciones_medicas || observaciones || '';
        const pdfUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const fichaGuardada = await db.query(
            `INSERT INTO Fichas_Clinicas 
                (animal_id, refugio_id, esterilizado, vacunas_al_dia, vacunas, peso_kg, diagnostico_ingreso, observaciones_medicas, pdf_url)
             VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9)
             ON CONFLICT (animal_id) DO UPDATE SET
                esterilizado = EXCLUDED.esterilizado,
                vacunas_al_dia = EXCLUDED.vacunas_al_dia,
                vacunas = EXCLUDED.vacunas,
                peso_kg = COALESCE(EXCLUDED.peso_kg, Fichas_Clinicas.peso_kg),
                diagnostico_ingreso = COALESCE(EXCLUDED.diagnostico_ingreso, Fichas_Clinicas.diagnostico_ingreso),
                observaciones_medicas = EXCLUDED.observaciones_medicas,
                pdf_url = COALESCE(EXCLUDED.pdf_url, Fichas_Clinicas.pdf_url),
                fecha_ultima_actualizacion = CURRENT_TIMESTAMP
             RETURNING *`,
            [animal_id, refugio_id, esEsterilizado, tieneVacunas, vacunasJson, pesoFinal, diagnostico_ingreso || null, obsFinal, pdfUrl]
        );

        res.status(201).json({
            mensaje: "Ficha clínica guardada exitosamente",
            datos: fichaGuardada.rows[0]
        });
    } catch (error) {
        console.error("Error al guardar ficha clínica:", error);
        res.status(500).json({ error: "Hubo un problema al guardar la ficha clínica" });
    }
});

router.put('/:id', upload.single('pdf_ficha'), async (req, res) => {
    try {
        const { id } = req.params;
        const { refugio_id } = req.usuario;
        if (!refugio_id) {
            return res.status(403).json({ error: "Solo el personal del refugio puede editar fichas clínicas" });
        }

        const {
            esterilizado,
            vacunas_al_dia,
            vacunas,
            peso_kg,
            diagnostico_ingreso,
            observaciones_medicas,
            observaciones
        } = req.body;

        const esEsterilizado = parsearBooleano(esterilizado);
        const tieneVacunas = parsearBooleano(vacunas_al_dia);
        const vacunasJson = normalizarVacunasJson(vacunas);
        const pesoFinal = parsearPeso(peso_kg);
        const obsFinal = observaciones_medicas || observaciones || '';
        const nuevoPdfUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const resultado = await db.query(
            `UPDATE Fichas_Clinicas
             SET esterilizado = $1,
                 vacunas_al_dia = $2,
                 vacunas = $3::jsonb,
                 peso_kg = COALESCE($4, peso_kg),
                 diagnostico_ingreso = COALESCE($5, diagnostico_ingreso),
                 observaciones_medicas = $6,
                 pdf_url = COALESCE($7, pdf_url),
                 fecha_ultima_actualizacion = CURRENT_TIMESTAMP
             WHERE id = $8 AND refugio_id = $9
             RETURNING *`,
            [esEsterilizado, tieneVacunas, vacunasJson, pesoFinal, diagnostico_ingreso || null, obsFinal, nuevoPdfUrl, id, refugio_id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: "Ficha clínica no encontrada o sin permisos" });
        }

        res.json({
            mensaje: "Ficha clínica actualizada exitosamente",
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error("Error al actualizar ficha clínica:", error);
        res.status(500).json({ error: "Hubo un problema al actualizar la ficha clínica" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { refugio_id } = req.usuario;
        if (!refugio_id) {
            return res.status(403).json({ error: "Solo el personal del refugio puede eliminar fichas clínicas" });
        }

        const resultado = await db.query(
            'DELETE FROM Fichas_Clinicas WHERE id = $1 AND refugio_id = $2 RETURNING *',
            [id, refugio_id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: "Ficha clínica no encontrada o sin permisos" });
        }

        res.json({
            mensaje: "Ficha clínica eliminada",
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error("Error al eliminar ficha clínica:", error);
        res.status(500).json({ error: "Hubo un problema al eliminar la ficha clínica" });
    }
});

module.exports = router;