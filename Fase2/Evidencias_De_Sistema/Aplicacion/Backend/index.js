// Importar las librerías necesarias
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
// Importar la conexión a la base de datos
const db = require('./db'); 
// Inicializar la aplicación Express
const app = express();
const PORT = 3000;

// Configurar herramientas de seguridad y recepción de datos
app.use(cors()); // Permite que el frontend se conecte
app.use(express.json()); // Permite recibir datos en formato JSON

// Ruta de prueba (Endpoint base)
app.get('/', (req, res) => {
    res.json({ 
        mensaje: "¡Servidor Backend de Huellita Segura corriendo exitosamente!",
        estado: "Activo"
    });
});







// RUTA DE LOGIN (AUTENTICACIÓN CON JWT)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

   
        const resultado = await db.query('SELECT * FROM Usuarios WHERE email = $1', [email]);
        if (resultado.rowCount === 0) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }
        
        const usuario = resultado.rows[0];

       
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }

      
        const token = jwt.sign(
            { 
                id: usuario.id, 
                refugio_id: usuario.refugio_id, 
                rol: usuario.rol 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' } 
        );

       
        res.json({
            mensaje: "¡Inicio de sesión exitoso!",
            token: token,
            usuario: {
                nombre: usuario.nombre_completo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: "Hubo un problema al procesar el inicio de sesión" });
    }
});

// MIDDLEWARE DE SEGURIDAD (Verificar Token)

const verificarToken = (req, res, next) => {
   
    const token = req.header('Authorization');


    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. No hay token de seguridad." });
    }

    try {
        const tokenLimpio = token.replace('Bearer ', '');

       
        const verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        
   
        req.usuario = verificado;
        next(); 

    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
    }
};

//CRUD REFUGIOS
app.get('/refugios', async (req, res) => {
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


app.post('/refugios', async (req, res) => {
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


app.put('/refugios/:id', async (req, res) => {
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


app.delete('/refugios/:id', async (req, res) => {
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

//CRUD USUARIOS
app.post('/usuarios', async (req, res) => {
    try {
        const { refugio_id, rut, nombre_completo, email, password, rol } = req.body;

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const nuevoUsuario = await db.query(
            `INSERT INTO Usuarios (refugio_id, rut, nombre_completo, email, password_hash, rol) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, refugio_id, nombre_completo, email, rol`,
            [refugio_id, rut, nombre_completo, email, password_hash, rol]
        );
        res.status(201).json({
            mensaje: "¡Usuario registrado con éxito!",
            datos: nuevoUsuario.rows[0]
        });

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ error: "Hubo un problema al guardar el usuario en la base de datos" });
    }
});

app.get('/usuarios', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM Usuarios'); 
        
        res.json({
            mensaje: "Lista de usuarios obtenida con éxito",
            cantidad: resultado.rowCount,
            datos: resultado.rows
        });

    } catch (error) {
        console.error("Error al consultar usuarios:", error);
        res.status(500).json({ error: "Hubo un problema al consultar la base de datos" });
    }
});

app.put('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, email, rol } = req.body;

        const usuarioActualizado = await db.query(
            `UPDATE Usuarios 
             SET nombre_completo = $1, email = $2, rol = $3 
             WHERE id = $4 RETURNING id, refugio_id, nombre_completo, email, rol`,
            [nombre_completo, email, rol, id]
        );

        if (usuarioActualizado.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            mensaje: "¡Usuario actualizado con éxito!",
            datos: usuarioActualizado.rows[0]
        });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Hubo un problema al actualizar el usuario" });
    }
});

app.delete('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const usuarioEliminado = await db.query(
            'DELETE FROM Usuarios WHERE id = $1 RETURNING id, nombre_completo, email',
            [id]
        );

        if (usuarioEliminado.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            mensaje: "¡Usuario eliminado correctamente!",
            datos: usuarioEliminado.rows[0]
        });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Hubo un problema al eliminar el usuario" });
    }
});

// CRUD: ANIMALES (FICHAS CLÍNICAS)
app.post('/animales',verificarToken, async (req, res) => {
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

app.get('/animales',verificarToken, async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM Animales');
        res.json({
            mensaje: "Lista de animales obtenida",
            cantidad: resultado.rowCount,
            datos: resultado.rows
        });
    } catch (error) {
        res.status(500).json({ error: "Hubo un problema al consultar los animales" });
    }
});

app.put('/animales/:id',verificarToken, async (req, res) => {
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

app.delete('/animales/:id', verificarToken, async (req, res) => {
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

// Encender el servidor
app.listen(PORT, () => {
    console.log(` Servidor ejecutándose en http://localhost:${PORT}`);
});
