const authService = require('../services/auth.service');

const register = async (req, res) => {

    try {

        const response = await authService.register(req.body);

        return res.status(201).json({
            ok: true,
            message: 'Usuario registrado correctamente',
            data: response
        });

    } catch (error) {

        return res.status(400).json({
            ok: false,
            message: error.message
        });

    }

};

const { recordFailedAttempt, resetFailedAttempts } = require('../../../middlewares/rateLimiter.middleware');

const login = async (req, res) => {

    try {

        const response = await authService.login(req.body);

        resetFailedAttempts(req.body.email);

        return res.status(200).json({
            ok: true,
            message: 'Login exitoso',
            data: response
        });

    } catch (error) {

        recordFailedAttempt(req.body.email);

        return res.status(400).json({
            ok: false,
            message: error.message
        });

    }

};

const verifyEmail = async (req, res) => {

    try {

        const result = await authService.verifyEmail(req.query.token);

        return res.json({
            ok: true,
            message: result.message
        });

    } catch (error) {

        return res.status(400).json({
            ok: false,
            message: error.message
        });

    }

};

const resendVerification = async (req, res) => {

    try {

        const result = await authService.resendVerification(req.body.email);

        return res.json({
            ok: true,
            message: result.message
        });

    } catch (error) {

        return res.status(400).json({
            ok: false,
            message: error.message
        });

    }

};

const refresh = async (req, res) => {

    try {

        const result = await authService.refreshToken(req.body.refresh_token);

        return res.json({
            ok: true,
            data: result
        });

    } catch (error) {

        return res.status(401).json({
            ok: false,
            message: error.message
        });

    }

};

const logout = async (req, res) => {

    try {

        const result = await authService.logout(req.body.refresh_token);

        return res.json({
            ok: true,
            message: result.message
        });

    } catch (error) {

        return res.status(500).json({
            ok: false,
            message: error.message
        });

    }

};

const forgotPassword = async (req, res) => {

    try {

        const result = await authService.forgotPassword(req.body.email);

        return res.json({
            ok: true,
            message: result.message
        });

    } catch (error) {

        return res.status(400).json({
            ok: false,
            message: error.message
        });

    }

};

const resetPassword = async (req, res) => {

    try {

        const { token, newPassword } = req.body;

        const result = await authService.resetPassword(token, newPassword);

        return res.json({
            ok: true,
            message: result.message
        });

    } catch (error) {

        return res.status(400).json({
            ok: false,
            message: error.message
        });

    }

};

module.exports = {
    register,
    login,
    verifyEmail,
    resendVerification,
    refresh,
    logout,
    forgotPassword,
    resetPassword
};