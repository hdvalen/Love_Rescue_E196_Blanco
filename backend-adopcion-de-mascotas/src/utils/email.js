const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const logger = require('./logger');
const User = require('../modules/users/models/user.model');

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    if (!process.env.SMTP_HOST) {
        logger.warn('[email] SMTP_HOST no configurado');
        return null;
    }

    const smtpUser = (process.env.SMTP_USER || '').replace(/["']/g, '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').replace(/["']/g, '').trim();

    if (smtpUser === 'apikey' && smtpPass.startsWith('SG.')) {
        logger.info('[email] Usando SendGrid API');
        sgMail.setApiKey(smtpPass);
        return sgMail;
    }

    logger.info('[email] Creando transporter SMTP', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT
    });

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: smtpUser,
            pass: smtpPass
        },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    });

    return transporter;
}

async function sendEmail({ to, subject, html }) {
    const t = getTransporter();
    if (!t) return;

    const from = process.env.SMTP_FROM || 'AdoptaMe <noreply@adopcionmascotas.com>';

    if (t.send) {
        await t.send({
            to,
            from,
            subject,
            html
        });
    } else {
        await t.sendMail({
            from,
            to,
            subject,
            html
        });
    }
}

const sendVerificationResult = async (fundacion, updates) => {
    try {
        const user = await User.findByPk(fundacion.id_usuario);
        if (!user || !user.email) return;

        const isApproved = updates.estado_aprobacion === 'APROBADA';
        await sendEmail({
            to: user.email,
            subject: isApproved ? '✓ Tu fundación ha sido verificada' : '✗ Tu fundación ha sido rechazada',
            html: isApproved
                ? `<h2>¡Felicidades!</h2><p>Tu fundación <strong>${fundacion.nombre_fundacion}</strong> ha sido aprobada. Ya puedes publicar mascotas en la plataforma.</p>`
                : `<h2>Fundación rechazada</h2><p>Tu fundación <strong>${fundacion.nombre_fundacion}</strong> ha sido rechazada.</p><p><strong>Motivo:</strong> ${updates.motivo_rechazo || 'No especificado'}</p><p>Por favor, corrige las observaciones y contacta al administrador.</p>`
        });
    } catch (error) {
        logger.error('[email] sendVerificationResult falló', { error: error.message });
    }
};

const sendEmailVerification = async (user, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    logger.info(`[VERIFICATION] URL para ${user.email}: ${verifyUrl}`);
    try {
        await sendEmail({
            to: user.email,
            subject: '🐾 Verifica tu correo electrónico - AdoptaMe',
            html: `<h2>¡Hola ${user.nombre}!</h2>
<p>Gracias por registrarte en <strong>AdoptaMe</strong>.</p>
<p>Para completar tu registro, por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente enlace:</p>
<p style="text-align:center;margin:30px 0">
  <a href="${verifyUrl}" style="background-color:#4F46E5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Verificar mi correo</a>
</p>
<p style="font-size:12px;color:#666;word-break:break-all">${verifyUrl}</p>
<br/><p>Este enlace expirará en 24 horas.</p>`
        });
        logger.info('[email] Verificación enviada', { email: user.email });
    } catch (error) {
        logger.error('[email] sendEmailVerification falló', { error: error.message, email: user.email, code: error.code });
    }
};

const sendWelcome = async (user, nombre) => {
    try {
        await sendEmail({
            to: user.email,
            subject: '🐾 ¡Bienvenido a AdoptaMe!',
            html: `<h2>¡Hola ${nombre}!</h2><p>Tu cuenta ha sido creada correctamente en <strong>AdoptaMe</strong>.</p>`
        });
    } catch (error) {
        logger.error('[email] sendWelcome falló', { error: error.message, email: user.email });
    }
};

const sendPasswordReset = async (user, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${token}`;
    try {
        await sendEmail({
            to: user.email,
            subject: '🔒 Restablecer tu contraseña - AdoptaMe',
            html: `<h2>Hola ${user.nombre}</h2><p>Recibimos una solicitud para restablecer la contraseña.</p><p><a href="${resetUrl}">Restablecer contraseña</a></p>`
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
    try {
        const user = await User.findByPk(userId, { attributes: ['email', 'nombre'] });
        if (!user || !user.email) return;

        await sendEmail({
            to: user.email,
            subject: `[AdoptaMe] ${subject}`,
            html: buildHtml(subject, bodyLines)
        });
        logger.info('[email] enviado', { email: user.email, subject });
    } catch (error) {
        logger.error('[email] sendEventEmail falló', { error: error.message, userId });
    }
}

async function testSmtpConnection() {
    const t = getTransporter();
    if (!t) return { ok: false, error: 'SMTP_HOST no configurado' };
    try {
        if (t.send) {
            return { ok: true, message: 'Usando SendGrid API (HTTPS)' };
        }
        await t.verify();
        return { ok: true, message: 'Conexión SMTP exitosa' };
    } catch (error) {
        return { ok: false, error: error.message, code: error.code, command: error.command };
    }
}

module.exports = { sendVerificationResult, sendWelcome, sendEmailVerification, sendPasswordReset, sendEventEmail, testSmtpConnection };