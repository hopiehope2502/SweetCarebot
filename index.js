const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicializamos el cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

// Almacenamos la información de cada usuario
const usuarios = {};

// Generar el QR para la autenticación
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Al confirmar que el bot está listo
client.on('ready', () => {
    console.log('✅ El bot está listo para funcionar');
});

// Lista de palabras clave que activarán el bot
const palabrasClave = ['hola', 'menú', 'agendar cita', 'información sobre servicios', 'atención personalizada'];

// Manejador de mensajes
client.on('message', async (message) => {
    const userMessage = message.body.toLowerCase();
    const userId = message.from;

    // Si el mensaje no contiene ninguna palabra clave, ignoramos el mensaje
    const contienePalabraClave = palabrasClave.some(palabra => userMessage.includes(palabra));
    if (!contienePalabraClave) {
        return; // Si no contiene palabra clave, no hacer nada
    }

    // Inicializar datos del usuario si no existe
    if (!usuarios[userId]) {
        usuarios[userId] = {
            paso: null,
            name: '',
            age: '',
            address: '',
            date: '',
            time: '',
            bienvenidaEnviada: false // Agregar un indicador de si ya se envió el mensaje de bienvenida
        };
    }

    const usuario = usuarios[userId];

    // Si el mensaje de bienvenida no ha sido enviado, lo enviamos
    if (!usuario.bienvenidaEnviada) {
        await message.reply('¡Bienvenidos a SweetCare 💜!');
        usuario.bienvenidaEnviada = true; // Marcar como enviado
    }

    // Función para manejar el menú principal
    if (userMessage === 'menú') {
        usuario.paso = null; // Reinicia el flujo si viene del menu
        await message.reply('Elige una opción:\n1️⃣. Agendar cita\n2️⃣. Información sobre servicios\n3️⃣. Atención personalizada');
        return;
    }

    // Función para iniciar agendamiento
    if (userMessage === '1' || userMessage === 'agendar cita') {
        usuario.paso = 'nombre';
        await message.reply('¡Perfecto! ¿Cómo te llamas? 👤');
        return;
    }

    // Función para mostrar información sobre los servicios
    if (userMessage === '2' || userMessage === 'información sobre servicios') {
        await message.reply('Nuestros servicios incluyen:\n👶 Cuidado diario\n🕒 Niñeras por horas\n🌙 Cuidado nocturno');
        return;
    }

    // Función para atención personalizada
    if (userMessage === '3' || userMessage === 'atención personalizada') {
        usuario.paso = 'personalizada'; // Guardamos que está en este paso
        await message.reply('Por favor, cuéntanos más sobre lo que necesitas y te ayudaremos. 💬');
        return;
    }

    // FLUJO DE ATENCIÓN PERSONALIZADA
    if (usuario.paso === 'personalizada') {
        usuario.paso = null; // Finalizamos el paso
        await message.reply('¡Muchas gracias! 🙌 En breve nos comunicaremos contigo 💜');
        return;
    }

    // FLUJO DE AGENDAMIENTO paso a paso
    switch (usuario.paso) {
        case 'nombre':
            usuario.name = message.body;
            usuario.paso = 'edad';
            await message.reply(`Gracias, ${usuario.name} 😄. ¿Qué edad tiene el/los niño/niños? 👶`);
            break;

        case 'edad':
            usuario.age = message.body;
            usuario.paso = 'direccion';
            await message.reply('¿Cuál es la dirección del servicio? 📍');
            break;

        case 'direccion':
            usuario.address = message.body;
            usuario.paso = 'fecha';
            await message.reply('¿Para qué fecha deseas agendar el servicio? 📅');
            break;

        case 'fecha':
            usuario.date = message.body;
            usuario.paso = 'hora';
            await message.reply('¿Entre qué horario te gustaría que sea el servicio? ⏰');
            break;

        case 'hora':
            usuario.time = message.body;
            usuario.paso = null; // Fin del flujo
            await message.reply(
                `✅ ¡Gracias, ${usuario.name}!\nSe esta gestionando tu cita para el ${usuario.date} a las ${usuario.time}.\n📍 Dirección: ${usuario.address} Una vez sea agendada, nos comunicaremos contigo 💜!`
            );
            break;

        default:
            await message.reply('Escribe "menú" para ver las opciones disponibles. 📝');
            break;
    }
});

// Inicializamos el cliente de WhatsApp
client.initialize();



