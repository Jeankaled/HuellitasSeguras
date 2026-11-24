// Archivo: utils/emailPostulaciones.js

const generarCorreoPostulacion = ({
    estado,
    nombreAdoptante,
    nombreMascota,
    nombreRefugio,
    colorPrincipal,
    frontendUrl
}) => {
    const colorBoton = colorPrincipal || '#F9A8D4';
    const estadoNormalizado = (estado || '').trim().toLowerCase();

    const botonHtml = `
        <div style="margin: 24px 0;">
            <a href="${frontendUrl}" target="_blank" rel="noopener noreferrer" style="padding: 12px 24px; background-color: ${colorBoton}; color: #ffffff; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Ver estado de mi postulación
            </a>
        </div>
    `;

    const envolverHtml = (contenido) => `
        <div style="font-family: Arial, sans-serif; color: #334155; max-width: 600px; line-height: 1.6;">
            ${contenido}
        </div>
    `;

    if (estadoNormalizado === 'en evaluación' || estadoNormalizado === 'en evaluacion') {
        return {
            subject: `Tu postulación por ${nombreMascota} está En Evaluación — ${nombreRefugio}`,
            html: envolverHtml(`
                <p>¡Hola, <strong>${nombreAdoptante}</strong>!</p>
                <p>En <strong>${nombreRefugio}</strong> nos llena de orgullo acompañar a personas que, como tú, eligen transformar una vida a través de la adopción responsable. Queremos contarte que tu postulación para darle un hogar a <strong>${nombreMascota}</strong> acaba de avanzar a la etapa: <strong>En Evaluación</strong>.</p>
                <p>Nuestro equipo está revisando con mucho cariño cada detalle de tu solicitud para asegurarnos de que <strong>${nombreMascota}</strong> y tú sean el equipo perfecto para toda la vida. Sabemos la emoción que se siente al dar este paso y agradecemos enormemente tu paciencia mientras cuidamos cada detalle de su futuro.</p>
                ${botonHtml}
                <p>Si tienes dudas o quieres comentarnos algo adicional, responde directamente a este correo y con gusto conversamos.</p>
                <p>Con cariño,<br><strong>El equipo de ${nombreRefugio}</strong></p>
            `)
        };
    }

    if (estadoNormalizado.includes('entrevista') || estadoNormalizado.includes('visita')) {
        return {
            subject: `¡Estás a un paso de conocer a ${nombreMascota}! — ${nombreRefugio}`,
            html: envolverHtml(`
                <p>¡Hola, <strong>${nombreAdoptante}</strong>!</p>
                <p>¡Tenemos excelentes noticias! Tu postulación para adoptar a <strong>${nombreMascota}</strong> avanzó a la etapa de <strong>Entrevista</strong>. Nos alegra muchísimo ver el compromiso con el que te estás preparando para recibir a un nuevo integrante en tu familia.</p>
                <p>Muy pronto nos pondremos en contacto contigo para coordinar una breve conversación donde podremos conocernos mejor, resolver todas tus preguntas y contarte más sobre la personalidad y los cuidados de <strong>${nombreMascota}</strong>.</p>
                ${botonHtml}
                <p>Si prefieres proponernos un horario que te acomode, puedes responder directamente a este correo.</p>
                <p>¡Cada vez falta menos!<br><strong>El equipo de ${nombreRefugio}</strong></p>
            `)
        };
    }

    if (estadoNormalizado === 'aprobada') {
        return {
            subject: `¡Felicidades! Tu adopción de ${nombreMascota} fue APROBADA`,
            html: envolverHtml(`
                <p>¡Hola, <strong>${nombreAdoptante}</strong>!</p>
                <p>¡Hoy es un día para celebrar! Con inmensa alegría y orgullo te contamos que tu postulación para adoptar a <strong>${nombreMascota}</strong> ha sido <strong>Aprobada</strong>.</p>
                <p>Gracias por abrirle las puertas de tu hogar y de tu corazón. Darle una segunda oportunidad a <strong>${nombreMascota}</strong> es un acto de amor enorme, y estamos felices de saber que comenzará esta nueva etapa junto a ti. En breve coordinaremos contigo los detalles finales para el encuentro y la entrega.</p>
                ${botonHtml}
                <p>Si tienes cualquier duda mientras preparas su llegada, responde directamente a este correo: estaremos encantados de acompañarte en este momento tan especial.</p>
                <p><strong>¡Bienvenido/a a la familia de adoptantes de ${nombreRefugio}!</strong></p>
            `)
        };
    }

    if (estadoNormalizado.includes('rechazada') || estadoNormalizado.includes('no seleccionada')) {
        return {
            subject: `Actualización sobre tu postulación por ${nombreMascota} — ${nombreRefugio}`,
            html: envolverHtml(`
                <p>¡Hola, <strong>${nombreAdoptante}</strong>!</p>
                <p>Primero que todo, queremos agradecerte de corazón por elegir la adopción responsable y por el interés que demostraste en <strong>${nombreMascota}</strong>. Para nosotros siempre es un orgullo encontrarnos con personas dispuestas a cambiar la historia de un animal rescatado.</p>
                <p>Después de revisar cuidadosamente todas las solicitudes y evaluar las necesidades específicas de <strong>${nombreMascota}</strong>, en esta ocasión decidimos continuar el proceso con otro perfil. Sabemos que no es la noticia que esperabas, pero te animamos a no bajar los brazos: en <strong>${nombreRefugio}</strong> hay muchos otros compañeros esperando una oportunidad y un hogar lleno de cariño como el tuyo.</p>
                ${botonHtml}
                <p>Si deseas recibir orientación sobre otros peluditos compatibles con tu estilo de vida, responde a este correo y te ayudaremos con mucho gusto.</p>
                <p>Con gratitud,<br><strong>El equipo de ${nombreRefugio}</strong></p>
            `)
        };
    }

    return {
        subject: `Actualización de tu postulación por ${nombreMascota} — ${nombreRefugio}`,
        html: envolverHtml(`
            <p>¡Hola, <strong>${nombreAdoptante}</strong>!</p>
            <p><strong>${nombreRefugio}</strong> ha actualizado tu postulación por <strong>${nombreMascota}</strong> a la etapa: <strong>${estado}</strong>.</p>
            ${botonHtml}
            <p>Si tienes dudas, puedes responder directamente a este correo para contactar al refugio.</p>
            <p>Con cariño,<br><strong>El equipo de ${nombreRefugio}</strong></p>
        `)
    };
};

module.exports = { generarCorreoPostulacion };