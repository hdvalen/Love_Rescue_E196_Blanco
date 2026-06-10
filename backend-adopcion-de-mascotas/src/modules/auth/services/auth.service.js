const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwtUtils = require('../../../utils/jwt');
const User = require('../../users/models/user.model');
const Rol = require('../../roles/models/rol.model');
const Fundacion = require('../../fundaciones/models/fundacion.model');
const PerfilAdoptante = require('../../users/models/perfil_adoptante.model');
const logger = require('../../../utils/logger');

const register = async (data) => {

    const { nombre, email, password, telefono, id_rol } = data;

    const userExists = await User.findOne({
        where: { email }
    });

    if (userExists) {
        throw new Error('El correo electrónico ya se encuentra vinculado a una cuenta');
    }

    const rolExists = await Rol.findByPk(id_rol);

    if (!rolExists) {
        throw new Error('El rol enviado no existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
        nombre,
        email,
        password: hashedPassword,
        telefono,
        id_rol,
        email_verification_token: verificationToken,
        email_verification_expires: verificationExpires
    });

    const response = {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        foto_url: user.foto_url || null
    };

    if (id_rol === 2) {
        const fundacion = await Fundacion.create({
            id_usuario: user.id_usuario,
            nombre_fundacion: nombre
        });

        response.id_fundacion = fundacion.id_fundacion;
    }

    const emailUtil = require('../../../utils/email');
    emailUtil.sendEmailVerification(user, verificationToken).catch(error => {
        logger.warn('[email] sendVerification falló', { error: error.message, userId: user.id_usuario });
    });

    return response;

};

const login = async (data) => {

    const { email, password } = data;

    if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios');
    }

    const user = await User.findOne({
        where: {
            email,
            estado: 1
        },
        include: [{ model: PerfilAdoptante }, { model: Fundacion, attributes: ['logo_url'] }]
    });

    if (!user) {
        throw new Error('Credenciales incorrectas');
    }

    const validPassword = await bcrypt.compare(
        password,
        user.password
    );

    if (!validPassword) {
        throw new Error('Credenciales incorrectas');
    }

    if (!user.email_verified_at) {
        throw new Error('EMAIL_NOT_VERIFIED');
    }

    const token = jwtUtils.generateToken(user);

    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await user.update({
        refresh_token: refreshToken,
        refresh_token_expires: refreshExpires,
        last_login: new Date()
    });

    return {
        token,
        refresh_token: refreshToken,
        user: {
            id_usuario: user.id_usuario,
            nombre: user.nombre,
            email: user.email,
            id_rol: user.id_rol,
            foto_url: user.foto_url || null,
            telefono: user.telefono || null,
            email_verified_at: user.email_verified_at || null,
            PerfilAdoptante: user.PerfilAdoptante || null,
            Fundacion: user.Fundacion || null
        }
    };

};

const verifyEmail = async (token) => {
    if (!token) {
        throw new Error('Token requerido');
    }

    const user = await User.findOne({
        where: {
            email_verification_token: token,
            estado: 1
        }
    });

    if (!user) {
        throw new Error('Token inválido o expirado');
    }

    if (user.email_verified_at) {
        return { message: 'El correo ya está verificado' };
    }

    if (user.email_verification_expires && new Date() > new Date(user.email_verification_expires)) {
        throw new Error('El token ha expirado. Solicita uno nuevo.');
    }

    await user.update({
        email_verified_at: new Date(),
        email_verification_token: null,
        email_verification_expires: null
    });

    return { message: 'Correo verificado correctamente' };
};

const resendVerification = async (email) => {
    if (!email) {
        throw new Error('Email requerido');
    }

    const user = await User.findOne({
        where: { email, estado: 1 }
    });

    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    if (user.email_verified_at) {
        throw new Error('El correo ya está verificado');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.update({
        email_verification_token: verificationToken,
        email_verification_expires: verificationExpires
    });

    const emailUtil = require('../../../utils/email');
    emailUtil.sendEmailVerification(user, verificationToken).catch(error => {
        logger.warn('[email] resendVerification falló', { error: error.message, userId: user.id_usuario });
    });

    return { message: 'Correo de verificación reenviado' };
};

const refreshToken = async (refreshTokenValue) => {
    if (!refreshTokenValue) {
        throw new Error('Refresh token requerido');
    }

    const user = await User.findOne({
        where: {
            refresh_token: refreshTokenValue,
            estado: 1
        },
        include: [{ model: PerfilAdoptante }]
    });

    if (!user) {
        const possibleUser = await User.findOne({
            where: { estado: 1 },
        include: [{ model: PerfilAdoptante }]
        });
        if (possibleUser) {
            await possibleUser.update({ refresh_token: null, refresh_token_expires: null });
        }
        throw new Error('Refresh token inválido o revocado');
    }

    if (user.refresh_token_expires && new Date() > new Date(user.refresh_token_expires)) {
        await user.update({ refresh_token: null, refresh_token_expires: null });
        throw new Error('Refresh token expirado. Inicia sesión nuevamente.');
    }

    const newJwt = jwtUtils.generateToken(user);
    const newRefreshToken = crypto.randomBytes(32).toString('hex');
    const newRefreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await user.update({
        refresh_token: newRefreshToken,
        refresh_token_expires: newRefreshExpires
    });

    return {
        token: newJwt,
        refresh_token: newRefreshToken
    };
};

const logout = async (refreshTokenValue) => {
    if (!refreshTokenValue) {
        return { message: 'Sesión cerrada' };
    }

    const user = await User.findOne({
        where: { refresh_token: refreshTokenValue, estado: 1 }
    });

    if (user) {
        await user.update({ refresh_token: null, refresh_token_expires: null });
    }

    return { message: 'Sesión cerrada correctamente' };
};

const forgotPassword = async (email) => {
    if (!email) {
        throw new Error('Email requerido');
    }

    const user = await User.findOne({ where: { email, estado: 1 } });

    if (!user) {
        return { message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires
    });

    const emailUtil = require('../../../utils/email');
    emailUtil.sendPasswordReset(user, resetToken).catch(error => {
        logger.warn('[email] sendPasswordReset falló', { error: error.message, userId: user.id_usuario });
    });

    return { message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña' };
};

const resetPassword = async (token, newPassword) => {
    if (!token || !newPassword) {
        throw new Error('Token y nueva contraseña son requeridos');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        throw new Error('La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial');
    }

    const user = await User.findOne({
        where: {
            password_reset_token: token,
            estado: 1
        }
    });

    if (!user) {
        throw new Error('Token inválido o expirado');
    }

    if (user.password_reset_expires && new Date() > new Date(user.password_reset_expires)) {
        await user.update({ password_reset_token: null, password_reset_expires: null });
        throw new Error('El token ha expirado. Solicita uno nuevo.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
        password: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null,
        refresh_token: null,
        refresh_token_expires: null
    });

    return { message: 'Contraseña actualizada correctamente' };
};

module.exports = {
    register,
    login,
    verifyEmail,
    resendVerification,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword
};
