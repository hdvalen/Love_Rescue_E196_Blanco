const { Op } = require('sequelize');

const Mascota = require('../models/mascota.model');
const { getPagination, getPaginationResponse } = require('../../../utils/pagination');
const Fundacion = require('../../fundaciones/models/fundacion.model');
const FotoMascota = require('../models/foto_mascota.model');
const Temperamento = require('../models/temperamento.model');

const TEMPERAMENTO_INCLUDE = {
    model: Temperamento,
    as: 'Temperamentos',
    attributes: ['id_temperamento', 'nombre'],
    through: { attributes: [] }
};

const mascotaIncludes = (includePhotos = true) => {
    const includes = [
        {
            model: Fundacion,
            attributes: ['nombre_fundacion', 'logo_url', 'estado_aprobacion', 'ciudad', 'departamento']
        },
        TEMPERAMENTO_INCLUDE
    ];
    if (includePhotos) {
        includes.push({
            model: FotoMascota,
            as: 'FotosMascota',
            where: { estado: 1 },
            attributes: ['id_foto', 'nombre_archivo'],
            required: false
        });
    }
    return includes;
};

const createMascota = async (data) => {

    const fundacion = await Fundacion.findOne({ where: { id_usuario: data.id_usuario } });

    if (!fundacion) {
        throw new Error('Fundación no encontrada');
    }

    if (fundacion.estado_aprobacion !== 'APROBADA') {
        throw new Error('La fundación debe estar aprobada por un administrador para publicar mascotas');
    }

    data.id_fundacion = fundacion.id_fundacion;

    const temperamento_ids = data.temperamento_ids;
    delete data.temperamento_ids;

    if (temperamento_ids) {
        const temps = await Temperamento.findAll({ where: { id_temperamento: temperamento_ids } });
        if (temps.length) {
            data.temperamento = temps.map(t => t.nombre).join(', ');
        }
    }

    const mascota = await Mascota.create(data);

    if (temperamento_ids) {
        await mascota.setTemperamentos(temperamento_ids);
    }

    return await Mascota.findByPk(mascota.id_mascota, { include: mascotaIncludes() });
};

const getMascotas = async (filters) => {

    const where = { estado: 1 };

    if (filters.search) {
        where[Op.or] = [
            { nombre: { [Op.like]: `%${filters.search}%` } },
            { raza: { [Op.like]: `%${filters.search}%` } }
        ];
    }

    if (filters.especie) {
        where.especie = filters.especie;
    }

    if (filters.tamano) {
        where.tamano = filters.tamano;
    }

    if (filters.estado_mascota) {
        where.estado_mascota = filters.estado_mascota;
    }

    if (filters.ubicacion) {
        where.ubicacion = {
            [Op.like]: `%${filters.ubicacion}%`
        };
    }

    if (filters.id_fundacion) {
        where.id_fundacion = filters.id_fundacion;
    }

    const { page, limit, offset } = getPagination(filters);

    const { count, rows } = await Mascota.findAndCountAll({
        where,
        include: mascotaIncludes(false),
        offset,
        limit,
        distinct: true
    });

    if (rows.length > 0) {
        const ids = rows.map(r => r.id_mascota);
        const fotos = await FotoMascota.findAll({
            where: { id_mascota: ids, estado: 1 },
            attributes: ['id_mascota', 'id_foto', 'nombre_archivo']
        });
        const fotoMap = {};
        for (const f of fotos) {
            if (!fotoMap[f.id_mascota]) fotoMap[f.id_mascota] = [];
            fotoMap[f.id_mascota].push({ id_foto: f.id_foto, nombre_archivo: f.nombre_archivo });
        }
        for (const m of rows) {
            m.dataValues.FotosMascota = fotoMap[m.id_mascota] || [];
        }
    }

    return {
        mascotas: rows,
        pagination: getPaginationResponse(count, page, limit)
    };

};

const getMascotaById = async (id) => {

    const mascota = await Mascota.findOne({
        where: {
            id_mascota: id,
            estado: 1
        },
        include: mascotaIncludes()
    });

    if (!mascota) {
        throw new Error('Mascota no encontrada');
    }

    return mascota;
};

const updateMascota = async (id, data) => {

    const mascota = await Mascota.findByPk(id);

    if (!mascota) {
        throw new Error('Mascota no encontrada');
    }

    const temperamento_ids = data.temperamento_ids;
    delete data.temperamento_ids;

    if (temperamento_ids) {
        const temps = await Temperamento.findAll({ where: { id_temperamento: temperamento_ids } });
        if (temps.length) {
            data.temperamento = temps.map(t => t.nombre).join(', ');
        }
    }

    await mascota.update(data);

    if (temperamento_ids) {
        await mascota.setTemperamentos(temperamento_ids);
    }

    return await Mascota.findByPk(id, { include: mascotaIncludes() });
};

const deleteMascota = async (id) => {

    const mascota = await Mascota.findByPk(id);

    if (!mascota) {
        throw new Error('Mascota no encontrada');
    }

    await mascota.update({
        estado: 0
    });

};

module.exports = {
    createMascota,
    getMascotas,
    getMascotaById,
    updateMascota,
    deleteMascota
};