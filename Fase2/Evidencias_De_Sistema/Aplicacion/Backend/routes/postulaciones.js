const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const { generarCorreoPostulacion } = require('../utils/emailPostulaciones');

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

const subirFotosHogar = upload.array('fotos_hogar', 5);

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
                SELECT p.*, 
                    a.nombre AS nombre_animal, 
                    a.especie AS especie_animal, 
                    a.foto AS foto_animal,
                    r.nombre_organizacion AS nombre_refugio,
                    r.telefono AS telefono_refugio
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
                   a.especie AS especie_animal,
                   a.foto AS foto_animal,
                   ad.nombre_completo AS nombre_adoptante, 
                   ad.rut AS rut_adoptante,
                   ad.email AS correo_adoptante, 
                   ad.telefono AS telefono_adoptante,
                   ad.foto_perfil AS foto_adoptante
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
        console.log("Petición GET /postulaciones/:id ->", { id, usuario: req.usuario });

        if (isNaN(id)) {
            return res.status(400).json({ error: "El ID de la postulación debe ser un número válido" });
        }

        let query = "";
        let params = [];

        if (req.usuario.rol === 'Adoptante') {
            query = `
                SELECT p.*, 
                       a.nombre AS nombre_animal, a.especie AS especie_animal, a.foto AS foto_animal,
                       r.nombre_organizacion AS nombre_refugio,
                       r.telefono AS telefono_refugio
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
                       r.nombre_organizacion AS nombre_refugio,
                       r.telefono AS telefono_refugio,
                       ad.nombre_completo AS nombre_adoptante, 
                       ad.rut AS rut_adoptante,
                       ad.email AS correo_adoptante,
                       ad.telefono AS telefono_adoptante, 
                       ad.direccion AS direccion_adoptante,
                       ad.foto_perfil AS foto_adoptante
                FROM Postulaciones p
                LEFT JOIN Animales a ON p.animal_id = a.id
                LEFT JOIN Refugios r ON p.refugio_id = r.id
                LEFT JOIN Adoptantes ad ON p.adoptante_id = ad.id
                WHERE p.id = $1 AND p.refugio_id = $2;
            `;
            params = [id, req.usuario.refugio_id];
        }

        const resultado = await db.query(query, params);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: "Postulación no encontrada o sin permisos para verla" });
        }

        const [historial, citaQuery] = await Promise.all([
            db.query('SELECT * FROM Historial_Postulaciones WHERE postulacion_id = $1 ORDER BY fecha DESC', [id]),
            db.query('SELECT * FROM Horarios_Entrevista WHERE postulacion_id = $1 LIMIT 1', [id])
        ]);

        const citaAgendada = citaQuery.rows[0] || null;

        res.json({
            mensaje: "Detalle de postulación obtenido",
            datos: {
                ...resultado.rows[0],
                cita_agendada: citaAgendada
            },
            cita_agendada: citaAgendada,
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

router.post('/:id/fotos-hogar', subirFotosHogar, async (req, res) => {
    try {
        const { id } = req.params;
        const adoptante_id = req.usuario.id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "Debes adjuntar al menos una foto del hogar." });
        }

        const urlsFotos = req.files.map(file => `/uploads/${file.filename}`);

        const resultado = await db.query(
            `UPDATE Postulaciones 
             SET foto_domicilio_url = $1
             WHERE id = $2 AND adoptante_id = $3
             RETURNING *`,
            [JSON.stringify(urlsFotos), id, adoptante_id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: "Postulación no encontrada o no te pertenece" });
        }

        await db.query(
            'INSERT INTO Historial_Postulaciones (postulacion_id, accion, detalle) VALUES ($1, $2, $3)',
            [id, 'Fotos del hogar subidas', `El adoptante adjuntó ${urlsFotos.length} fotografía(s) de su domicilio.`]
        );

        res.json({
            mensaje: "Fotos del hogar subidas con éxito",
            fotos_hogar: urlsFotos,
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error("Error al subir fotos del hogar:", error);
        res.status(500).json({ error: "Error interno al subir las fotos del hogar" });
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

router.post('/:id/agendar', async (req, res) => {
    try {
        const { id } = req.params;
        const { horario_id } = req.body;
        const adoptante_id = req.usuario.id;

        if (!horario_id) {
            return res.status(400).json({ error: "Debes seleccionar un horario válido (horario_id)." });
        }

        const postulacionQuery = await db.query(
            'SELECT id, refugio_id FROM Postulaciones WHERE id = $1 AND adoptante_id = $2',
            [id, adoptante_id]
        );

        if (postulacionQuery.rowCount === 0) {
            return res.status(404).json({ error: "Postulación no encontrada o no te pertenece" });
        }

        const refugio_id = postulacionQuery.rows[0].refugio_id;

        const verificarNuevo = await db.query(
            'SELECT id FROM Horarios_Entrevista WHERE id = $1 AND refugio_id = $2 AND disponible = TRUE',
            [horario_id, refugio_id]
        );

        if (verificarNuevo.rowCount === 0) {
            return res.status(409).json({ error: "El horario seleccionado ya no está disponible." });
        }

        await db.query(
            'UPDATE Horarios_Entrevista SET disponible = TRUE, postulacion_id = NULL WHERE postulacion_id = $1',
            [id]
        );

        const reserva = await db.query(
            `UPDATE Horarios_Entrevista 
             SET disponible = FALSE, postulacion_id = $1 
             WHERE id = $2 AND refugio_id = $3 AND disponible = TRUE 
             RETURNING *`,
            [id, horario_id, refugio_id]
        );

        if (reserva.rowCount === 0) {
            return res.status(409).json({ error: "El horario seleccionado ya no está disponible." });
        }

        const citaConfirmada = reserva.rows[0];

        await db.query(
            'INSERT INTO Historial_Postulaciones (postulacion_id, accion, detalle) VALUES ($1, $2, $3)',
            [id, 'Videollamada agendada', `Entrevista reservada para el ${citaConfirmada.fecha} a las ${citaConfirmada.hora}.`]
        );

        res.json({
            mensaje: "Videollamada agendada con éxito",
            cita: citaConfirmada,
            datos: citaConfirmada
        });
    } catch (error) {
        console.error("Error al agendar videollamada:", error);
        res.status(500).json({ error: "Error interno al agendar la videollamada" });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            estado_postulacion,
            detalle_historial,
            entrevista_realizada,
            visita_realizada,
            aprobacion_comite
        } = req.body;
        const refugio_id = req.usuario.refugio_id;

        if (
            !estado_postulacion &&
            typeof entrevista_realizada !== 'boolean' &&
            typeof visita_realizada !== 'boolean' &&
            typeof aprobacion_comite !== 'boolean'
        ) {
            return res.status(400).json({ error: "Debes indicar un estado o campo de evaluación a actualizar" });
        }

        const postulacionActualizada = await db.query(
            `UPDATE Postulaciones 
             SET estado_postulacion = COALESCE($1, estado_postulacion),
                 entrevista_realizada = COALESCE($2, entrevista_realizada),
                 visita_realizada = COALESCE($3, visita_realizada),
                 aprobacion_comite = COALESCE($4, aprobacion_comite)
             WHERE id = $5 AND refugio_id = $6 
             RETURNING *`,
            [
                estado_postulacion ?? null,
                typeof entrevista_realizada === 'boolean' ? entrevista_realizada : null,
                typeof visita_realizada === 'boolean' ? visita_realizada : null,
                typeof aprobacion_comite === 'boolean' ? aprobacion_comite : null,
                id,
                refugio_id
            ]
        );

        if (postulacionActualizada.rowCount === 0) {
            return res.status(404).json({ error: "Postulación no encontrada o sin permisos" });
        }

        const postulacion = postulacionActualizada.rows[0];

        if (estado_postulacion === 'Aprobada') {
            await db.query(
                `UPDATE Animales 
                 SET estado = 'Adoptado' 
                 WHERE id = $1 AND refugio_id = $2`,
                [postulacion.animal_id, refugio_id]
            );
        }

        if (estado_postulacion) {
            await db.query(
                'INSERT INTO Historial_Postulaciones (postulacion_id, accion, detalle) VALUES ($1, $2, $3)',
                [
                    id,
                    `Cambio a: ${estado_postulacion}`,
                    detalle_historial || `La fundación actualizó el estado de la postulación a "${estado_postulacion}".`
                ]
            );
        }

        let correoEnviado = false;
        try {
            if (estado_postulacion && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const [infoAdoptante, infoRefugio, infoAnimal] = await Promise.all([
                    db.query('SELECT email, nombre_completo FROM Adoptantes WHERE id = $1', [postulacion.adoptante_id]),
                    db.query('SELECT nombre_organizacion, email_contacto, color_principal FROM Refugios WHERE id = $1', [refugio_id]),
                    db.query('SELECT nombre FROM Animales WHERE id = $1', [postulacion.animal_id])
                ]);

                if (infoAdoptante.rowCount > 0 && infoRefugio.rowCount > 0) {
                    const { email: correoDestino, nombre_completo: nombreAdoptante } = infoAdoptante.rows[0];
                    const { nombre_organizacion, email_contacto, color_principal } = infoRefugio.rows[0];
                    const nombreMascota = infoAnimal.rows[0]?.nombre || 'tu futura mascota';

                    let frontendBase = (process.env.FRONTEND_URL || 'http://localhost:5173')
                        .trim()
                        .replace(/['"\r\n\s]/g, '')
                        .replace(/\/+$/, '');

                    if (!/^https?:\/\//i.test(frontendBase)) {
                        frontendBase = `https://${frontendBase}`;
                    }
                    const frontendUrl = `${frontendBase}/mis-postulaciones/${encodeURIComponent(id)}`;

                    const { subject, html } = generarCorreoPostulacion({
                        estado: estado_postulacion,
                        nombreAdoptante,
                        nombreMascota,
                        nombreRefugio: nombre_organizacion,
                        colorPrincipal: color_principal,
                        frontendUrl
                    });

                    await transporter.sendMail({
                        from: `"${nombre_organizacion} (Huellita Segura)" <${process.env.EMAIL_USER}>`,
                        replyTo: email_contacto || process.env.EMAIL_USER,
                        to: correoDestino,
                        subject,
                        html
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
                : "Postulación actualizada con éxito",
            datos: postulacion
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