const nodemailer = require('nodemailer');
const logger = require('./logger');
const User = require('../modules/users/models/user.model');

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    if (!process.env.SMTP_HOST) return null;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
    });

    return transporter;
}

const sendVerificationResult = async (fundacion, updates) => {
    const t = getTransporter();
    if (!t) return;

    try {
        const user = await User.findByPk(fundacion.id_usuario);
        if (!user || !user.email) return;

        const isApproved = updates.estado_aprobacion === 'APROBADA';
        const subject = isApproved
            ? '✓ Tu fundación ha sido verificada'
            : '✗ Tu fundación ha sido rechazada';

        const html = isApproved
            ? `<h2>¡Felicidades!</h2><p>Tu fundación <strong>${fundacion.nombre_fundacion}</strong> ha sido aprobada. Ya puedes publicar mascotas en la plataforma.</p>`
            : `<h2>Fundación rechazada</h2><p>Tu fundación <strong>${fundacion.nombre_fundacion}</strong> ha sido rechazada.</p><p><strong>Motivo:</strong> ${updates.motivo_rechazo || 'No especificado'}</p><p>Por favor, corrige las observaciones y contacta al administrador.</p>`;

        await t.sendMail({
            from: process.env.SMTP_FROM || 'noreply@adopcionmascotas.com',
            to: user.email,
            subject,
            html
        });
    } catch (error) {
        logger.error('[email] sendVerificationResult falló', { error: error.message });
    }
};

const sendEmailVerification = async (user, token) => {
    const t = getTransporter();
    if (!t) return;

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    try {
        await t.sendMail({
            from: process.env.SMTP_FROM || 'noreply@adopcionmascotas.com',
            to: user.email,
            subject: '🐾 Verifica tu correo electrónico - AdoptaMe',
            html: `<h2>¡Hola ${user.nombre}!</h2>
<p>Gracias por registrarte en <strong>AdoptaMe</strong>.</p>
<p>Para completar tu registro, por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente enlace:</p>
<p style="text-align:center;margin:30px 0">
  <a href="${verifyUrl}" style="background-color:#4F46E5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
    Verificar mi correo
  </a>
</p>
<p>O copia y pega este enlace en tu navegador:</p>
<p style="font-size:12px;color:#666;word-break:break-all">${verifyUrl}</p>
<br/>
<p>Este enlace expirará en 24 horas.</p>
<p>Si no creaste una cuenta en AdoptaMe, ignora este mensaje.</p>`
        });
    } catch (error) {
        logger.error('[email] sendEmailVerification falló', { error: error.message, email: user.email });
    }
};

const sendWelcome = async (user, nombre) => {
    const t = getTransporter();
    if (!t) return;

    try {
        const subject = '🐾 ¡Bienvenido a AdoptaMe!';

        const html = `<h2>¡Hola ${nombre}!</h2>
<p>Tu cuenta ha sido creada correctamente en <strong>AdoptaMe</strong>, la plataforma de adopción responsable.</p>
<p>Ya puedes iniciar sesión y comenzar a explorar todas las funcionalidades.</p>
<br/>
<p>Si tienes alguna duda, no dudes en contactarnos.</p>
<p>¡Gracias por ser parte de esta comunidad!</p>`;

        await t.sendMail({
            from: process.env.SMTP_FROM || 'noreply@adopcionmascotas.com',
            to: user.email,
            subject,
            html
        });
    } catch (error) {
        logger.error('[email] sendWelcome falló', { error: error.message, email: user.email });
    }
};

const sendPasswordReset = async (user, token) => {
    const t = getTransporter();
    if (!t) return;

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${token}`;

    try {
        await t.sendMail({
            from: process.env.SMTP_FROM || 'noreply@adopcionmascotas.com',
            to: user.email,
            subject: '🔒 Restablecer tu contraseña - AdoptaMe',
            html: `<h2>Hola ${user.nombre}</h2>
<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>AdoptaMe</strong>.</p>
<p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
<p style="text-align:center;margin:30px 0">
  <a href="${resetUrl}" style="background-color:#4F46E5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
    Restablecer contraseña
  </a>
</p>
<p>O copia y pega este enlace en tu navegador:</p>
<p style="font-size:12px;color:#666;word-break:break-all">${resetUrl}</p>
<br/>
<p>Este enlace expirará en 1 hora.</p>
<p>Si no solicitaste este cambio, ignora este mensaje. Tu contraseña no será modificada.</p>`
        });
    } catch (error) {
        logger.error('[email] sendPasswordReset falló', { error: error.message, email: user.email });
    }
};

function buildHtml(title, bodyLines) {
    const lines = bodyLines.map(l => `<p>${l}</p>`).join('\n');
    return `<div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif;padding:20px">
<h2 style="color:#4F46E5">${title}</h2>
${lines}
<br/>
<hr style="border:none;border-top:1px solid #eee"/>
<p style="font-size:12px;color:#999">Este mensaje fue generado automáticamente por <strong>AdoptaMe</strong>. No respondas a este correo.</p>
</div>`;
}

async function sendEventEmail(userId, subject, bodyLines) {
    const t = getTransporter();
    if (!t) return;

    try {
        const user = await User.findByPk(userId, { attributes: ['email', 'nombre'] });
        if (!user || !user.email) return;

        const html = buildHtml(subject, bodyLines);

        await t.sendMail({
            from: process.env.SMTP_FROM || 'noreply@adopcionmascotas.com',
            to: user.email,
            subject: `[AdoptaMe] ${subject}`,
            html
        });
        logger.info('[email] enviado', { email: user.email, subject });
    } catch (error) {
        logger.error('[email] sendEventEmail falló', { error: error.message, userId });
    }
}

module.exports = { sendVerificationResult, sendWelcome, sendEmailVerification, sendPasswordReset, sendEventEmail };