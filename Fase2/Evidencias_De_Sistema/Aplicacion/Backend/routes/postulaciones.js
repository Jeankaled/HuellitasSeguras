const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const tiposPermitidos = /jpeg|jpg|png|webp|pdf/;
    const extValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeValido = tiposPermitidos.test(file.mimetype);

    if (extValida && mimeValido) {
        return cb(null, true);
    }
    cb(new Error('Formato no válido. Solo se permiten imágenes (JPG, PNG, WEBP) o PDF.'));
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Máximo 5MB por archivo
    fileFilter
});

const subirDocumentosKYC = upload.fields([
    { name: 'carnet', maxCount: 1 },
    { name: 'sueldo', maxCount: 1 },
    { name: 'domicilio', maxCount: 1 }
]);


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


router.get('/', async (req, res) => {
    try {
        if (req.usuario.rol === 'Adoptante') {
            const query = `
                SELECT p.*, a.nombre AS nombre_animal, r.nombre_organizacion AS nombre_refugio
                FROM Postulaciones p
                LEFT JOIN Animales a ON p.animal_id = a.id
                LEFT JOIN Refugios r ON p.refugio_id = r.id
                WHERE p.adoptante_id = $1
                ORDER BY p.fecha_postulacion DESC;
            `;
            const resultado = await db.query(query, [req.usuario.id]);
            return res.json({ mensaje: "Mis postulaciones", cantidad: resultado.rowCount, datos: resultado.rows });
        }

        const refugio_id = req.usuario.refugio_id;
        const { animal_id } = req.query;

        let query = `
            SELECT p.*, 
                   a.nombre AS nombre_animal, 
                   a.foto AS foto_animal,
                   ad.nombre_completo AS nombre_adoptante, 
                   ad.rut AS rut_adoptante,
                   ad.email AS correo_adoptante, 
                   ad.telefono AS telefono_adoptante
            FROM Postulaciones p
            LEFT JOIN Animales a ON p.animal_id = a.id
            LEFT JOIN Adoptantes ad ON p.adoptante_id = ad.id
            WHERE p.refugio_id = $1
        `;
        const params = [refugio_id];

        if (animal_id) {
            query += ` AND p.animal_id = $2`;
            params.push(animal_id);
        }

        query += ` ORDER BY p.fecha_postulacion DESC;`;

        const resultado = await db.query(query, params);
        res.json({ mensaje: "Postulaciones obtenidas", cantidad: resultado.rowCount, datos: resultado.rows });
    } catch (error) {
        console.error("Error al obtener postulaciones:", error);
        res.status(500).json({ error: "Error interno al consultar las postulaciones" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let query = "";
        let params = [];

        if (req.usuario.rol === 'Adoptante') {
            query = `
                SELECT p.*, 
                       a.nombre AS nombre_animal, a.especie AS especie_animal, a.foto AS foto_animal,
                       r.nombre_organizacion AS nombre_refugio
                FROM Postulaciones p
                LEFT JOIN Animales a ON p.animal_id = a.id
                LEFT JOIN Refugios r ON p.refugio_id = r.id
                WHERE p.id = $1 AND p.adoptante_id = $2;
            `;
            params = [id, req.usuario.id];
        } else {
            query = `
                SELECT p.*, 
                       a.nombre AS nombre_animal, a.especie AS especie_animal, a.foto AS foto_animal,
                       ad.nombre_completo AS nombre_adoptante, ad.rut AS rut_adoptante,
                       ad.email AS correo_adoptante, ad.telefono AS telefono_adoptante, ad.direccion AS direccion_adoptante
                FROM Postulaciones p
                LEFT JOIN Animales a ON p.animal_id = a.id
                LEFT JOIN Adoptantes ad ON p.adoptante_id = ad.id
                WHERE p.id = $1 AND p.refugio_id = $2;
            `;
            params = [id, req.usuario.refugio_id];
        }

        const resultado = await db.query(query, params);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: "Postulación no encontrada o sin permisos para verla" });
        }

        const historial = await db.query(
            'SELECT * FROM Historial_Postulaciones WHERE postulacion_id = $1 ORDER BY fecha DESC',
            [id]
        );

        res.json({
            mensaje: "Detalle de postulación obtenido",
            datos: resultado.rows[0],
            historial: historial.rows
        });
    } catch (error) {
        console.error("Error al obtener la postulación por ID:", error);
        res.status(500).json({ error: "Error interno al consultar la postulación" });
    }
});

router.post('/', async (req, res) => {
    try {
        const { mascota_id, tipo_vivienda, composicion_hogar, otras_mascotas, tiempo_solas, motivacion } = req.body;
        const adoptante_id = req.usuario.id;

        const animalQuery = await db.query('SELECT refugio_id FROM Animales WHERE id = $1', [mascota_id]);
        if (animalQuery.rowCount === 0) {
            return res.status(404).json({ error: "La mascota seleccionada no existe" });
        }
        const refugio_id = animalQuery.rows[0].refugio_id;

        const nuevaPostulacion = await db.query(
            `INSERT INTO Postulaciones 
             (adoptante_id, animal_id, refugio_id, tipo_vivienda, composicion_hogar, otras_mascotas, tiempo_solas, motivacion, estado_postulacion, acepta_tratamiento_datos) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'En Revisión', TRUE) 
             RETURNING *`,
            [adoptante_id, mascota_id, refugio_id, tipo_vivienda, composicion_hogar, otras_mascotas, tiempo_solas, motivacion]
        );

        const postulacionCreada = nuevaPostulacion.rows[0];

        await db.query(
            'INSERT INTO Historial_Postulaciones (postulacion_id, accion, detalle) VALUES ($1, $2, $3)',
            [postulacionCreada.id, 'Postulación enviada', 'El adoptante registró su solicitud inicial de adopción.']
        );

        res.status(201).json({ mensaje: "Postulación enviada con éxito", datos: postulacionCreada });
    } catch (error) {
        console.error("Error al registrar postulación:", error);
        res.status(500).json({ error: "Error interno al procesar la postulación" });
    }
});

router.post('/:id/documentos', subirDocumentosKYC, async (req, res) => {
    try {
        const { id } = req.params;
        const adoptante_id = req.usuario.id;
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';

        const urlCedula = req.files?.['carnet'] ? `${baseUrl}/uploads/${req.files['carnet'][0].filename}` : null;
        const urlSueldo = req.files?.['sueldo'] ? `${baseUrl}/uploads/${req.files['sueldo'][0].filename}` : null;
        const urlDomicilio = req.files?.['domicilio'] ? `${baseUrl}/uploads/${req.files['domicilio'][0].filename}` : null;

        if (!urlCedula && !urlSueldo && !urlDomicilio) {
            return res.status(400).json({ error: "Debes adjuntar al menos un documento válido." });
        }

        const resultado = await db.query(
            `UPDATE Postulaciones 
             SET foto_cedula_url = COALESCE($1, foto_cedula_url),
                 comprobante_ingresos_url = COALESCE($2, comprobante_ingresos_url),
                 foto_domicilio_url = COALESCE($3, foto_domicilio_url),
                 estado_postulacion = 'Revisión de Documentos'
             WHERE id = $4 AND adoptante_id = $5
             RETURNING *`,
            [urlCedula, urlSueldo, urlDomicilio, id, adoptante_id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: "Postulación no encontrada o no te pertenece" });
        }

        await db.query(
            'INSERT INTO Historial_Postulaciones (postulacion_id, accion, detalle) VALUES ($1, $2, $3)',
            [id, 'Documentos KYC recibidos', 'El adoptante adjuntó su documentación para verificación del refugio.']
        );

        res.json({ mensaje: "Documentos subidos con éxito", datos: resultado.rows[0] });
    } catch (error) {
        console.error("Error al subir documentos:", error);
        res.status(500).json({ error: "Error interno al subir los documentos" });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_postulacion, detalle_historial } = req.body;
        const refugio_id = req.usuario.refugio_id;

        const postulacionActualizada = await db.query(
            `UPDATE Postulaciones 
             SET estado_postulacion = $1 
             WHERE id = $2 AND refugio_id = $3 
             RETURNING *`,
            [estado_postulacion, id, refugio_id]
        );

        if (postulacionActualizada.rowCount === 0) {
            return res.status(404).json({ error: "Postulación no encontrada o sin permisos" });
        }

        await db.query(
            'INSERT INTO Historial_Postulaciones (postulacion_id, accion, detalle) VALUES ($1, $2, $3)',
            [
                id,
                `Cambio a: ${estado_postulacion}`,
                detalle_historial || `La fundación actualizó el estado de la postulación a "${estado_postulacion}".`
            ]
        );

        let correoEnviado = false;
        try {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const infoAdoptante = await db.query(
                    'SELECT email, nombre_completo FROM Adoptantes WHERE id = $1',
                    [postulacionActualizada.rows[0].adoptante_id]
                );

                const infoRefugio = await db.query(
                    'SELECT nombre_organizacion, email_contacto, color_principal FROM Refugios WHERE id = $1',
                    [refugio_id]
                );

                if (infoAdoptante.rowCount > 0 && infoRefugio.rowCount > 0) {
                    const { email: correoDestino, nombre_completo: nombreAdoptante } = infoAdoptante.rows[0];
                    const { nombre_organizacion, email_contacto, color_principal } = infoRefugio.rows[0];
                    
                    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
                    const frontendUrl = `${frontendBase}/mis-postulaciones/${id}`;
                    const colorBoton = color_principal || '#F9A8D4';

                    await transporter.sendMail({
                        from: `"${nombre_organizacion} (Huellita Segura)" <${process.env.EMAIL_USER}>`,
                        replyTo: email_contacto || process.env.EMAIL_USER,
                        to: correoDestino,
                        subject: `Actualización de tu postulación en ${nombre_organizacion} 🐾`,
                        html: `
                            <div style="font-family: Arial, sans-serif; color: #334155; max-width: 600px;">
                                <h2>Hola, ${nombreAdoptante}</h2>
                                <p><strong>${nombre_organizacion}</strong> ha actualizado tu postulación a la etapa: <strong>${estado_postulacion}</strong>.</p>
                                <br>
                                <a href="${frontendUrl}" style="padding: 12px 24px; background-color: ${colorBoton}; color: white; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                                    Ver estado de mi postulación
                                </a>
                                <br><br>
                                <p>Si tienes dudas, puedes responder directamente a este correo para contactar al refugio.</p>
                            </div>
                        `
                    });
                    correoEnviado = true;
                }
            }
        } catch (mailError) {
            console.error("Advertencia: Estado guardado, pero falló el envío de correo:", mailError.message);
        }

        res.json({
            mensaje: correoEnviado
                ? "Estado actualizado y correo enviado al adoptante"
                : "Estado actualizado (correo no enviado, revisa configuración SMTP)",
            datos: postulacionActualizada.rows[0]
        });
    } catch (error) {
        console.error("Error al actualizar postulación:", error);
        res.status(500).json({ error: "Error interno al actualizar la postulación" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const refugio_id = req.usuario.refugio_id;

        const postulacionEliminada = await db.query(
            'DELETE FROM Postulaciones WHERE id = $1 AND refugio_id = $2 RETURNING *',
            [id, refugio_id]
        );

        if (postulacionEliminada.rowCount === 0) {
            return res.status(404).json({ error: "Postulación no encontrada o sin permisos" });
        }

        res.json({ mensaje: "Postulación eliminada exitosamente", datos: postulacionEliminada.rows[0] });
    } catch (error) {
        console.error("Error al eliminar postulación:", error);
        res.status(500).json({ error: "Error interno al eliminar la postulación" });
    }
});

module.exports = router;