
const validarYFormatearRut = (rutInput) => {
    if (!rutInput || typeof rutInput !== 'string') {
        return { valido: false, error: 'El RUT es obligatorio.' };
    }

    const limpio = rutInput.trim().replace(/\./g, '').toUpperCase();

    if (!/^[0-9]{7,8}-[0-9K]$/.test(limpio)) {
        return { valido: false, error: 'Formato de RUT inválido. Ejemplo válido: 12.345.678-5.' };
    }

    const [cuerpo, dvIngresado] = limpio.split('-');

    if (/^(\d)\1+$/.test(cuerpo) || parseInt(cuerpo, 10) < 1000000) {
        return { valido: false, error: 'El RUT ingresado no es válido.' };
    }

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i], 10) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = suma % 11;
    const resultado = 11 - resto;
    let dvCalculado = '';

    if (resultado === 11) dvCalculado = '0';
    else if (resultado === 10) dvCalculado = 'K';
    else dvCalculado = resultado.toString();

    if (dvIngresado !== dvCalculado) {
        return { valido: false, error: 'El dígito verificador del RUT no corresponde.' };
    }

    return { valido: true, rutLimpio: limpio };
};

module.exports = { validarYFormatearRut };