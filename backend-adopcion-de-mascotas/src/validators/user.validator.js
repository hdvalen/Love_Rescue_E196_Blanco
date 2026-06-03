const { z } = require('zod');

const update = z.object({
    nombre: z.string().min(1).optional(),
    email: z.string().email('Correo electrónico inválido').optional(),
    telefono: z.string().optional(),
    foto_url: z.string().optional(),
});

const updatePassword = z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
    newPassword: z.string()
        .min(8, 'La nueva contraseña debe tener mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[a-z]/, 'Debe contener al menos una minúscula')
        .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial'),
});

module.exports = { update, updatePassword };
