const { z } = require('zod');

const passwordSchema = z.string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial');

const register = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    email: z.string().email('Correo electrónico inválido'),
    password: passwordSchema,
    telefono: z.string().optional(),
    id_rol: z.number().int().positive('El rol es obligatorio'),
});

const login = z.object({
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(1, 'La contraseña es obligatoria'),
});

const resendVerification = z.object({
    email: z.string().email('Correo electrónico inválido'),
});

const refresh = z.object({
    refresh_token: z.string().min(1, 'El token es obligatorio'),
});

const logout = z.object({
    refresh_token: z.string().min(1, 'El token es obligatorio'),
});

module.exports = { register, login, resendVerification, refresh, logout };
