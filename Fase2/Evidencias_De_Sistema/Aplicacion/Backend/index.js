// Importar las librerías necesarias
const express = require('express');
const cors = require('cors');

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

// Encender el servidor
app.listen(PORT, () => {
    console.log(` Servidor ejecutándose en http://localhost:${PORT}`);
});