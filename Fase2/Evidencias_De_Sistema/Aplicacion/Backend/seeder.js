const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

const inyectarDatosMasivos = async () => {
    try {
        console.log(" Iniciando inyección MASIVA de datos...");

        // 1. Crear Refugio Base
        const refugio = await db.query(
            `INSERT INTO Refugios (rut, nombre_organizacion, direccion, email_contacto, telefono)
             VALUES ('11.111.111-1', 'Refugio Patitas Felices', 'Calle Falsa 123', 'contacto@patitas.cl', '+56912345678') RETURNING id;`
        );
        const ref_id = refugio.rows[0].id;
        console.log(" Refugio creado");

        // 2. Crear Admin
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);
        await db.query(
            `INSERT INTO Usuarios (refugio_id, rut, nombre_completo, email, password_hash, rol)
             VALUES ($1, '22.222.222-2', 'Admin Principal', 'admin@patitas.cl', $2, 'Administrador');`,
            [ref_id, hash]
        );
        console.log(" Usuario administrador creado (admin@patitas.cl | admin123)");

        // 3. Crear 10 Adoptantes con un ciclo for
        const nombresAdoptantes = ['María González', 'Juan Pérez', 'Camila Rojas', 'Pedro Silva', 'Ana Soto', 'Luis Torres', 'Carlos Díaz', 'Marta Gómez', 'Diego Vega', 'Laura Ruiz'];
        const adoptantesIds = [];
        
        for (let i = 0; i < 10; i++) {
            const adop = await db.query(
                `INSERT INTO Adoptantes (rut, nombre_completo, email, telefono, direccion)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
                [`1${i}.000.000-${i}`, nombresAdoptantes[i], `adoptante${i}@gmail.com`, `+5690000000${i}`, `Avenida Siempreviva ${i}`]
            );
            adoptantesIds.push(adop.rows[0].id);
        }
        console.log(" 10 Adoptantes creados (KYC inicializado)");

        // 4. Crear 20 Animales y sus Fichas Médicas con un ciclo for
        const nombresPerros = ['Luna', 'Max', 'Bella', 'Rocky', 'Coco', 'Toby', 'Kira', 'Bimba', 'Zeus', 'Milo'];
        const razas = ['Mestizo', 'Poodle', 'Labrador', 'Pug', 'Pastor Alemán'];
        const animalesIds = [];
        
        for (let i = 0; i < 20; i++) {
            const nombre = nombresPerros[i % 10] + (i >= 10 ? ' II' : ''); // Para no repetir nombres exactos
            const raza = razas[i % 5];
            const especie = (i % 3 === 0) ? 'Gato' : 'Perro'; // 1 de cada 3 será un gato
            const sexo = (i % 2 === 0) ? 'Macho' : 'Hembra';

            const anim = await db.query(
                `INSERT INTO Animales (refugio_id, nombre, especie, raza, sexo, estado, microchip)
                 VALUES ($1, $2, $3, $4, $5, 'Disponible', $6) RETURNING id;`,
                [ref_id, nombre, especie, raza, sexo, `9810200001234${i.toString().padStart(2, '0')}`]
            );
            const anim_id = anim.rows[0].id;
            animalesIds.push(anim_id);

            // Crear Ficha médica para el animal
            await db.query(
                `INSERT INTO Fichas_Clinicas (animal_id, refugio_id, esterilizado, vacunas_al_dia, peso_kg, diagnostico_ingreso)
                 VALUES ($1, $2, true, true, $3, 'Rescatado de la calle, en buenas condiciones generales.');`,
                [anim_id, ref_id, (Math.random() * 20 + 2).toFixed(2)] // Genera un peso aleatorio entre 2 y 22 kg
            );
        }
        console.log(" 20 Animales y 20 Fichas Clínicas creadas");

        // 5. Crear 5 Contratos de Adopción (Para probar el Módulo Legal)
        for (let i = 0; i < 5; i++) {
            await db.query(
                `INSERT INTO Contratos_Adopcion (refugio_id, animal_id, adoptante_id, estado_firma)
                 VALUES ($1, $2, $3, 'Pendiente');`,
                [ref_id, animalesIds[i], adoptantesIds[i]]
            );
        }
        console.log(" 5 Contratos de adopción base vinculados");

        console.log(" ¡PROCESO FINALIZADO! Tu base de datos tiene ahora 36 registros inyectados.");
        process.exit(0);
    } catch (error) {
        console.error(" Error al inyectar datos:", error);
        process.exit(1);
    }
};

inyectarDatosMasivos();