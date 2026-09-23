const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

const inyectarDatosMasivos = async () => {
    try {
        console.log(" Iniciando inyección MASIVA, ALEATORIA y MULTI-TENANT...");

        // 1. CREAR REFUGIOS CON IDENTIDAD VISUAL ÚNICA
        const refugio1 = await db.query(
            `INSERT INTO Refugios (rut, nombre_organizacion, direccion, email_contacto, telefono, color_principal, color_secundario, estado_verificacion)
             VALUES ('11.111.111-1', 'Patitas Felices', 'Calle Falsa 123', 'contacto@patitas.cl', '+56912345678', '#F9A8D4', '#93C5FD', 'aprobado') RETURNING id;`
        );
        const ref1_id = refugio1.rows[0].id;

        const refugio2 = await db.query(
            `INSERT INTO Refugios (rut, nombre_organizacion, direccion, email_contacto, telefono, color_principal, color_secundario, estado_verificacion)
             VALUES ('77.777.777-7', 'Fundación Esperanza', 'Av. Los Pinos 456', 'contacto@esperanza.cl', '+56998877665', '#34D399', '#FDE047', 'aprobado') RETURNING id;`
        );
        const ref2_id = refugio2.rows[0].id;
        const refugiosIds = [ref1_id, ref2_id];
        console.log(" 2 Refugios creados (Identidad visual diferenciada)");

        // 2. CREAR ADMINISTRADORES
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);
        
        await db.query(
            `INSERT INTO Usuarios (refugio_id, rut, nombre_completo, email, password_hash, rol)
             VALUES ($1, '22.222.222-2', 'Admin Patitas', 'admin@patitas.cl', $2, 'Administrador');`,
            [ref1_id, hash]
        );
        await db.query(
            `INSERT INTO Usuarios (refugio_id, rut, nombre_completo, email, password_hash, rol)
             VALUES ($1, '88.888.888-8', 'Admin Esperanza', 'admin@esperanza.cl', $2, 'Administrador');`,
            [ref2_id, hash]
        );
        console.log(" 2 Usuarios administradores listos (Pass: admin123)");

        // 3. CREAR ADOPTANTES (Vitrineo y Perfiles Completos)
        const nombresAdoptantes = ['María González', 'Juan Pérez', 'Camila Rojas', 'Pedro Silva', 'Ana Soto', 'Luis Torres', 'Carlos Díaz', 'Marta Gómez'];
        const adoptantesIds = [];
        
        for (let i = 0; i < nombresAdoptantes.length; i++) {
            // Simulamos que algunos dejaron el RUT vacío (Registro Progresivo)
            const rutSimulado = i % 3 === 0 ? null : `1${i}.000.000-${i}`;
            
            const adop = await db.query(
                `INSERT INTO Adoptantes (rut, nombre_completo, email, password_hash, telefono, direccion)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`,
                [rutSimulado, nombresAdoptantes[i], `adoptante${i}@gmail.com`, hash, `+5690000000${i}`, `Avenida Siempreviva ${i}`]
            );
            adoptantesIds.push(adop.rows[0].id);
        }
        console.log(" Adoptantes creados (Soportando Registro Progresivo sin RUT)");

        // 4. CREAR ANIMALES Y FICHAS CLÍNICAS ALEATORIAS
        const nombresMascotas = ['Luna', 'Max', 'Bella', 'Rocky', 'Coco', 'Toby', 'Kira', 'Bimba', 'Zeus', 'Milo'];
        const razas = ['Mestizo', 'Poodle', 'Labrador', 'Pug', 'Persa'];
        const animalesIds = [];
        
        for (let i = 0; i < 20; i++) {
            const nombre = nombresMascotas[Math.floor(Math.random() * nombresMascotas.length)]; 
            const raza = razas[Math.floor(Math.random() * razas.length)];
            const especie = Math.random() > 0.6 ? 'Gato' : 'Perro'; 
            const sexo = Math.random() > 0.5 ? 'Macho' : 'Hembra';

            // ASIGNACIÓN ALEATORIA AL REFUGIO
            const refugioAsignado = refugiosIds[Math.floor(Math.random() * refugiosIds.length)];

            const anim = await db.query(
                `INSERT INTO Animales (refugio_id, nombre, especie, raza, sexo, estado, microchip)
                 VALUES ($1, $2, $3, $4, $5, 'Disponible', $6) RETURNING id;`,
                [refugioAsignado, nombre, especie, raza, sexo, `9810200001234${i.toString().padStart(2, '0')}`]
            );
            const anim_id = anim.rows[0].id;
            animalesIds.push(anim_id);

            // Ficha médica
            await db.query(
                `INSERT INTO Fichas_Clinicas (animal_id, refugio_id, esterilizado, vacunas_al_dia, peso_kg, diagnostico_ingreso)
                 VALUES ($1, $2, true, true, $3, 'Ingresado en buenas condiciones.');`,
                [anim_id, refugioAsignado, (Math.random() * 20 + 2).toFixed(2)] 
            );
        }
        console.log(" 20 Animales distribuidos aleatoriamente");

        // 5. INYECTAR POSTULACIONES SENSIBLES (KYC)
        for (let i = 0; i < 5; i++) {
            // Tomamos un animal y verificamos a qué refugio pertenece para atar la postulación correctamente
            const animalElegido = animalesIds[i];
            const queryRefugio = await db.query('SELECT refugio_id FROM Animales WHERE id = $1', [animalElegido]);
            const refugioDelAnimal = queryRefugio.rows[0].refugio_id;

            await db.query(
                `INSERT INTO Postulaciones (adoptante_id, animal_id, refugio_id, estado_postulacion, acepta_tratamiento_datos, foto_cedula_url)
                 VALUES ($1, $2, $3, 'En Revisión', true, 'https://ejemplo.com/docs/cedula_mock.jpg');`,
                [adoptantesIds[i], animalElegido, refugioDelAnimal] 
            );
        }
        console.log(" 5 Postulaciones de adopción inyectadas para la Bandeja de Entrada");

        console.log(" ¡PROCESO FINALIZADO! La base de datos está poblada y lista.");
        process.exit(0);
    } catch (error) {
        console.error(" Error al inyectar datos:", error);
        process.exit(1);
    }
};

inyectarDatosMasivos();