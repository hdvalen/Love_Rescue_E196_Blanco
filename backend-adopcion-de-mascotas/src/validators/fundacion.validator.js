const { z } = require('zod');

const create = z.object({
    nombre_fundacion: z.string().min(1, 'El nombre de la fundación es obligatorio'),
    descripcion: z.string().optional().default(''),
    direccion: z.string().optional().default(''),
    ciudad: z.string().optional().default(''),
    departamento: z.string().optional().default(''),
    telefono: z.string().optional().default(''),
    sitio_web: z.string().optional().default(''),
    redes_sociales: z.string().optional().default(''),
    mision: z.string().optional().default(''),
    nit: z.string().optional().default(''),
});

const update = z.object({
    nombre_fundacion: z.string().min(1).optional(),
    descripcion: z.string().optional(),
    direccion: z.string().optional(),
    ciudad: z.string().optional(),
    departamento: z.string().optional(),
    telefono: z.string().optional(),
    sitio_web: z.string().optional(),
    redes_sociales: z.string().optional(),
    mision: z.string().optional(),
    nit: z.string().optional(),
});

const aprobar = z.object({
    motivo_rechazo: z.string().optional(),
});

module.exports = { create, update, aprobar };
