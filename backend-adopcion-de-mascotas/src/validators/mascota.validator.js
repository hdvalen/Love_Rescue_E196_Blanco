const { z } = require('zod');

const create = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    especie: z.string().min(1, 'La especie es obligatoria'),
    raza: z.string().optional().default(''),
    edad: z.union([z.string(), z.number()]).optional().transform(v => v !== undefined ? String(v) : '').default(''),
    sexo: z.string().optional().default(''),
    peso: z.string().optional().default(''),
    color: z.string().optional().default(''),
    descripcion: z.string().optional().default(''),
    estado_mascota: z.string().optional().default('DISPONIBLE'),
    temperamento_ids: z.array(z.number().int().positive()).optional().default([]),
    condiciones_adopcion: z.string().optional().default(''),
    vacunado: z.boolean().optional().default(false),
    esterilizado: z.boolean().optional().default(false),
});

const update = z.object({
    nombre: z.string().min(1).optional(),
    especie: z.string().min(1).optional(),
    raza: z.string().optional(),
    edad: z.union([z.string(), z.number()]).optional().transform(v => v !== undefined ? String(v) : undefined),
    sexo: z.string().optional(),
    peso: z.string().optional(),
    color: z.string().optional(),
    descripcion: z.string().optional(),
    estado_mascota: z.string().optional(),
    temperamento_ids: z.array(z.number().int().positive()).optional(),
    condiciones_adopcion: z.string().optional(),
    vacunado: z.boolean().optional(),
    esterilizado: z.boolean().optional(),
});

module.exports = { create, update };
