
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;


const limitadorGeneral = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { error: "Demasiadas peticiones. Por favor intenta de nuevo en 15 minutos." }
});

const limitadorEstricto = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10,
    message: { error: "Demasiados intentos. Por seguridad, espera 15 minutos." }
});


app.use(cors()); 
app.use(express.json()); 
app.use('/uploads', express.static('uploads')); 
app.use(limitadorGeneral);

// 1. IMPORTAR MIDDLEWARE DE SEGURIDAD
const verificarToken = require('./middlewares/verificarToken');


// 2. IMPORTAR RUTAS MODULARIZADAS
const rutaAuth = require('./routes/auth');
const rutasAdoptantes = require('./routes/adoptantes');
const rutasFichas = require('./routes/fichas');
const rutasContratos = require('./routes/contratos');
const rutasAnimales = require('./routes/animales');
const rutasRefugios = require('./routes/refugios');
const rutasUsuarios = require('./routes/usuarios');
const rutasPostulaciones = require('./routes/postulaciones');
const rutasReportes = require('./routes/reportes');

// 3. CONECTAR ENDPOINTS (RUTAS)

app.get('/', (req, res) => {
    res.json({ 
        mensaje: "¡Servidor Backend de Huellita Segura corriendo exitosamente!",
        estado: "Activo"
    });
});

// Rutas Públicas
app.use('/',limitadorEstricto, rutaAuth); 
app.use('/refugios',limitadorEstricto,  rutasRefugios);
app.use('/adoptantes', rutasAdoptantes);

// Rutas Privadas (Protegidas por el Middleware)
app.use('/fichas-clinicas', verificarToken, rutasFichas);
app.use('/contratos', verificarToken, rutasContratos);
app.use('/animales',limitadorEstricto, verificarToken, rutasAnimales);

app.use('/usuarios', verificarToken, rutasUsuarios);
app.use('/postulaciones', limitadorEstricto,verificarToken, rutasPostulaciones);
app.use('/reportes-adoptantes', limitadorEstricto,  verificarToken, rutasReportes);



app.listen(PORT, () => {
    console.log(` Servidor ejecutándose en http://localhost:${PORT}`);
});