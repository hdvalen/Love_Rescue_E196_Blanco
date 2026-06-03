const jwt = require('jsonwebtoken');

const validateJWT = (req, res, next) => {

    try {

        const authorization = req.headers.authorization;

        if (!authorization) {

            return res.status(401).json({
                ok: false,
                message: 'Token requerido'
            });

        }

        const token = authorization.split(' ')[1];

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ['HS256'] }
        );

        req.user = payload;

        next();

    } catch (error) {

        return res.status(401).json({
            ok: false,
            message: 'Token inválido'
        });

    }

};

module.exports = validateJWT;