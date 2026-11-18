const db = require('../db');

const validarEmailUnico = async (emailInput) => {
    if (!emailInput || typeof emailInput !== 'string') {
        return { valido: false, error: 'El correo electrónico es obligatorio.' };
    }

    const emailLimpio = emailInput.trim().toLowerCase();

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(emailLimpio)) {
        return { valido: false, error: 'El formato del correo electrónico no es válido.' };
    }

    const consulta = `
        SELECT 'Usuarios' AS tabla FROM Usuarios WHERE LOWER(TRIM(email)) = $1
        UNION ALL
        SELECT 'Adoptantes' AS tabla FROM Adoptantes WHERE LOWER(TRIM(email)) = $1
        UNION ALL
        SELECT 'Refugios' AS tabla FROM Refugios WHERE LOWER(TRIM(email_contacto)) = $1
        LIMIT 1;
    `;

    const resultado = await db.query(consulta, [emailLimpio]);

    if (resultado.rowCount > 0) {
        return { 
            valido: false, 
            error: 'Este correo electrónico ya está registrado en otra cuenta de la plataforma.' 
        };
    }

    return { valido: true, emailLimpio };
};

module.exports = { validarEmailUnico };