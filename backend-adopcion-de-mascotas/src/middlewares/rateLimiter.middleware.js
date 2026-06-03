const rateLimit = require('express-rate-limit');

const failedLoginAttempts = new Map();

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

function getFailedAttempts(email) {
    const record = failedLoginAttempts.get(email.toLowerCase());
    if (!record) return 0;
    if (Date.now() > record.expiresAt) {
        failedLoginAttempts.delete(email.toLowerCase());
        return 0;
    }
    return record.count;
}

function recordFailedAttempt(email) {
    const key = email.toLowerCase();
    const now = Date.now();
    const existing = failedLoginAttempts.get(key);

    if (existing && now <= existing.expiresAt) {
        existing.count += 1;
        console.log(`[LOGIN_FAIL] email=${email} attempts=${existing.count}/${MAX_FAILED_ATTEMPTS}`);
    } else {
        failedLoginAttempts.set(key, {
            count: 1,
            expiresAt: now + LOGIN_WINDOW_MS
        });
        console.log(`[LOGIN_FAIL] email=${email} attempts=1/${MAX_FAILED_ATTEMPTS} (new window)`);
    }
}

function resetFailedAttempts(email) {
    const key = email.toLowerCase();
    if (failedLoginAttempts.has(key)) {
        failedLoginAttempts.delete(key);
        console.log(`[LOGIN_SUCCESS] email=${email} — failed attempts reset`);
    }
}

function isEmailBlocked(email) {
    return getFailedAttempts(email) >= MAX_FAILED_ATTEMPTS;
}

function getRemainingTime(email) {
    const record = failedLoginAttempts.get(email.toLowerCase());
    if (!record) return 0;
    const remaining = record.expiresAt - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 60000) : 0;
}

const loginLimiter = (req, res, next) => {
    const email = req.body?.email;
    if (!email) return next();

    if (isEmailBlocked(email)) {
        const mins = getRemainingTime(email);
        console.log(`[LOGIN_BLOCKED] email=${email} remaining=${mins}min`);
        return res.status(429).json({
            ok: false,
            message: `Demasiados intentos fallidos. Intenta de nuevo en ${mins} minutos.`
        });
    }

    next();
};

const ipBruteForceLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.log(`[IP_BRUTE_FORCE] ip=${req.ip} — too many login attempts`);
        res.status(429).json({
            ok: false,
            message: 'Demasiados intentos desde tu conexión. Intenta de nuevo en 15 minutos.'
        });
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            ok: false,
            message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.'
        });
    }
});

const createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            ok: false,
            message: 'Demasiadas solicitudes de creación. Intenta de nuevo en 1 hora.'
        });
    }
});

const solicitudLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            ok: false,
            message: 'Demasiadas solicitudes de adopción. Intenta de nuevo en 1 hora.'
        });
    }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            ok: false,
            message: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.'
        });
    }
});

module.exports = {
    loginLimiter,
    ipBruteForceLimiter,
    recordFailedAttempt,
    resetFailedAttempts,
    isEmailBlocked,
    authLimiter,
    createLimiter,
    solicitudLimiter,
    apiLimiter
};
