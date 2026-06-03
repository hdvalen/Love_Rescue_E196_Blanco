const jwt = require('jsonwebtoken');

const generateToken = (user) => {

    return jwt.sign(

        {
            id_usuario: user.id_usuario,
            email: user.email,
            id_rol: user.id_rol
        },

        process.env.JWT_SECRET,

        {
            expiresIn: process.env.JWT_EXPIRES,
            algorithm: 'HS256'
        }

    );

};

module.exports = {
    generateToken
};