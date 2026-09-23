const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

const inyectarDatosMasivos = async () => {
    try {
        console.log(" Iniciando inyección MASIVA Multi-Tenant...");

        // ==========================================
        // 1. CREAR REFUGIOS
        // ==========================================
        const refugio1 = await db.query(
            `INSERT INTO Refugios (rut, nombre_organizacion, direccion, email_contacto, telefono)
             VALUES ('11.111.111-1', 'Refugio Patitas Felices', 'Calle Falsa 123', 'contacto@patitas.cl', '+56912345678') RETURNING id;`
        );
        const ref1_id = refugio1.rows[0].id;

        const refugio2 = await db.query(
            `INSERT INTO Refugios (rut, nombre_organizacion, direccion, email_contacto, telefono)
             VALUES ('77.777.777-7', 'Refugio Pequeñas Huellas', 'Av. Los Pinos 456', 'contacto@pequenas.cl', '+56998877665') RETURNING id;`
        );
        const ref2_id = refugio2.rows[0].id;
        console.log(" 2 Refugios creados");

        // ==========================================
        // 2. CREAR ADMINISTRADORES
        // ==========================================
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt); // Contraseña igual para ambos
        
        await db.query(
            `INSERT INTO Usuarios (refugio_id, rut, nombre_completo, email, password_hash, rol)
             VALUES ($1, '22.222.222-2', 'Admin Patitas', 'admin@patitas.cl', $2, 'Administrador');`,
            [ref1_id, hash]
        );
        await db.query(
            `INSERT INTO Usuarios (refugio_id, rut, nombre_completo, email, password_hash, rol)
             VALUES ($1, '88.888.888-8', 'Admin Pequeñas', 'admin@pequenas.cl', $2, 'Administrador');`,
            [ref2_id, hash]
        );
        console.log(" 2 Usuarios creados (admin@patitas.cl y admin@pequenas.cl | Pass: admin123)");

        // ==========================================
        // 3. CREAR ADOPTANTES CIUDADANOS
        // ==========================================
        const nombresAdoptantes = ['María González', 'Juan Pérez', 'Camila Rojas', 'Pedro Silva', 'Ana Soto', 'Luis Torres', 'Carlos Díaz', 'Marta Gómez', 'Diego Vega', 'Laura Ruiz'];
        const adoptantesIds = [];
        
        for (let i = 0; i < 10; i++) {
            const adop = await db.query(
                `INSERT INTO Adoptantes (rut, nombre_completo, email, telefono, direccion, password_hash)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`,
                [`1${i}.000.000-${i}`, nombresAdoptantes[i], `adoptante${i}@gmail.com`, `+5690000000${i}`, `Avenida Siempreviva ${i}`, hash]
            );
            adoptantesIds.push(adop.rows[0].id);
        }
        console.log(" 10 Adoptantes creados (KYC inicializado)");

        // ==========================================
        // 4. CREAR ANIMALES Y FICHAS CLÍNICAS
        // ==========================================
        const nombresMascotas = ['Luna', 'Max', 'Bella', 'Rocky', 'Coco', 'Toby', 'Kira', 'Bimba', 'Zeus', 'Milo'];
        const razas = ['Mestizo', 'Poodle', 'Labrador', 'Pug', 'Persa'];
        const animalesIds = [];
        
        for (let i = 0; i < 20; i++) {
            const nombre = nombresMascotas[i % 10] + (i >= 10 ? ' II' : ''); 
            const raza = razas[i % 5];
            const especie = (i % 3 === 0) ? 'Gato' : 'Perro'; 
            const sexo = (i % 2 === 0) ? 'Macho' : 'Hembra';

            // AQUÍ ESTÁ LA MAGIA: Los primeros 15 van al Refugio 1, los últimos 5 van al Refugio 2
            const refugioAsignado = i < 15 ? ref1_id : ref2_id;

            const anim = await db.query(
                `INSERT INTO Animales (refugio_id, nombre, especie, raza, sexo, estado, microchip)
                 VALUES ($1, $2, $3, $4, $5, 'Disponible', $6) RETURNING id;`,
                [refugioAsignado, nombre, especie, raza, sexo, `9810200001234${i.toString().padStart(2, '0')}`]
            );
            const anim_id = anim.rows[0].id;
            animalesIds.push(anim_id);

            // Crear Ficha médica para el animal
            await db.query(
                `INSERT INTO Fichas_Clinicas (animal_id, refugio_id, esterilizado, vacunas_al_dia, peso_kg, diagnostico_ingreso)
                 VALUES ($1, $2, true, true, $3, 'Rescatado de la calle, en buenas condiciones generales.');`,
                [anim_id, refugioAsignado, (Math.random() * 20 + 2).toFixed(2)] 
            );
        }
        console.log(" 20 Animales creados (15 para Patitas Felices, 5 para Pequeñas Huellas)");

        // ==========================================
        // 5. CREAR CONTRATOS (De prueba)
        // ==========================================
        for (let i = 0; i < 5; i++) {
            await db.query(
                `INSERT INTO Contratos_Adopcion (refugio_id, animal_id, adoptante_id, estado_firma)
                 VALUES ($1, $2, $3, 'Pendiente');`,
                [ref1_id, animalesIds[i], adoptantesIds[i]] // Asociados al Refugio 1 para prueba
            );
        }
        console.log(" 5 Contratos de adopción base vinculados");

        console.log(" ¡PROCESO FINALIZADO! La base de datos Multi-Tenant está lista.");
        process.exit(0);
    } catch (error) {
        console.error(" Error al inyectar datos:", error);
        process.exit(1);
    }
};

inyectarDatosMasivos();