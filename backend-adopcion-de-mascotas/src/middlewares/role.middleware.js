const ROLE_MAP = {
    1: 'ADMINISTRADOR',
    2: 'FUNDACION',
    3: 'ADOPTANTE'
};

const validateRole = (...rolesPermitidos) => {

    return (req, res, next) => {

        const nombreRol = ROLE_MAP[req.user.id_rol];

        if (!nombreRol) {
            return res.status(403).json({
                ok: false,
                message: 'Rol desconocido'
            });
        }

        if (!rolesPermitidos.includes(nombreRol)) {
            return res.status(403).json({
                ok: false,
                message: 'No tiene permisos para acceder'
            });
        }

        next();

    };

};

module.exports = validateRole;