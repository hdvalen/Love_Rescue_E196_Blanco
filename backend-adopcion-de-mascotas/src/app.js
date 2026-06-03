const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
const db = require('./config/db');
const { resolveFilePath } = require('./utils/pathResolver');

const authRoutes = require('./modules/auth/routes/auth.routes');
const fundacionRoutes = require('./modules/fundaciones/routes/fundacion.routes');
const mascotaRoutes = require('./modules/mascotas/routes/mascota.routes');
const userRoutes = require('./modules/users/routes/user.routes');
const rolRoutes = require('./modules/roles/routes/rol.routes');
const solicitudRoutes = require('./modules/solicitudes/routes/solicitud.routes');
const seguimientoRoutes = require('./modules/seguimientos/routes/seguimiento.routes');
const notificacionRoutes = require('./modules/notificaciones/routes/notificacion.routes');
const reporteRoutes = require('./modules/reportes/routes/reporte.routes');
const favoritoRoutes = require('./modules/favoritos/routes/favorito.routes');
const perfilAdoptanteRoutes = require('./modules/users/routes/perfil_adoptante.routes');
const temperamentoRoutes = require('./modules/temperamentos/routes/temperamento.routes');

const validateJWT = require('./middlewares/auth.middleware');
const validateRole = require('./middlewares/role.middleware');

const app = express();

logger.info('Iniciando aplicación', { nodeEnv: process.env.NODE_ENV || 'development' });

morgan.token('user', (req) => req.user?.id || 'anon');
morgan.token('body', (req) => req.body ? JSON.stringify(req.body).substring(0, 200) : '-');

app.use(morgan(':method :url :status :res[content-length] - :response-time ms user=:user body=:body', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No autorizado por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const helmetDirectives = {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "blob:"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:8080'],
    fontSrc: ["'self'", "data:"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'self'"],
    scriptSrcAttr: ["'none'"]
};

const hstsConfig = process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
} : false;

app.use(helmet({
    contentSecurityPolicy: {
        directives: Object.fromEntries(
            Object.entries(helmetDirectives).filter(([_, v]) => v !== null)
        )
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: hstsConfig,
    referrerPolicy: {
        policy: 'same-origin'
    },
    xssFilter: true,
    noSniff: true,
    hidePoweredBy: true,
    frameguard: { action: 'sameorigin' },
    permittedCrossDomainPolicies: { permittedPolicies: 'none' }
}));

app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()');
    if (req.user || req.headers.authorization) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
    next();
});

app.use(express.json({ limit: '10mb' }));

const PUBLIC_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

app.get('/uploads/:filename', async (req, res) => {
    const ext = path.extname(req.params.filename).toLowerCase();

    if (!PUBLIC_EXTENSIONS.has(ext)) {
        const token = req.headers.authorization?.split(' ')[1] || req.query.token;
        if (!token) {
            return res.status(401).json({ ok: false, message: 'Token requerido' });
        }
        try {
            const jwt = require('jsonwebtoken');
            jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        } catch {
            return res.status(401).json({ ok: false, message: 'Token inválido' });
        }
    }

    const resolvedPath = resolveFilePath(req.params.filename);

    if (!resolvedPath) {
        return res.status(404).json({ ok: false, message: 'Archivo no encontrado' });
    }

    res.sendFile(resolvedPath);
});

app.use('/api/auth', authRoutes);

const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
app.use('/api', apiLimiter);

app.use('/api/fundaciones', fundacionRoutes);

app.use('/api/mascotas', mascotaRoutes);

app.use('/api/usuarios', userRoutes);

app.use('/api/roles', rolRoutes);

app.use('/api/solicitudes', solicitudRoutes);

app.use('/api/seguimientos', seguimientoRoutes);

app.use('/api/notificaciones', notificacionRoutes);

app.use('/api/reportes', reporteRoutes);

app.use('/api/favoritos', favoritoRoutes);

app.use('/api/perfil-adoptante', perfilAdoptanteRoutes);

app.use('/api/temperamentos', temperamentoRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'API Adopción de Mascotas funcionando 🚀'
    });
});

app.get('/health', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        db: 'unknown'
    };

    try {
        await db.authenticate();
        health.db = 'connected';
    } catch (err) {
        health.db = 'disconnected';
        health.status = 'degraded';
        logger.error('Health check: DB disconnected', { error: err.message });
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
});

app.get('/api/private', validateJWT, (req, res) => {

    res.json({
        ok: true,
        user: req.user
    });

});

app.get(
    '/api/admin',
    validateJWT,
    validateRole('ADMINISTRADOR'),
    (req, res) => {

        res.json({
            ok: true,
            message: 'Bienvenido administrador'
        });

    }
);

app.get(
    '/api/fundacion',
    validateJWT,
    validateRole('FUNDACION'),
    (req, res) => {

        res.json({
            ok: true,
            message: 'Bienvenido fundación'
        });

    }
);

app.get(
    '/api/adoptante',
    validateJWT,
    validateRole('ADOPTANTE'),
    (req, res) => {

        res.json({
            ok: true,
            message: 'Bienvenido adoptante'
        });

    }
);

module.exports = app;