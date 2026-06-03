const { z } = require('zod');

const create = z.object({
    id_mascota: z.number().int().positive('La mascota es obligatoria'),
    motivo: z.string().min(1, 'El motivo es obligatorio'),
    datos_adoptante: z.record(z.any()).optional(),
});

const estadoChange = z.object({
    respuesta: z.string().optional(),
    cambiar_estado_mascota: z.boolean().optional(),
});

module.exports = { create, estadoChange };
