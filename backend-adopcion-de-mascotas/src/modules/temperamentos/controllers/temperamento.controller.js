const Temperamento = require('../../mascotas/models/temperamento.model');

const getAll = async (req, res) => {
    try {
        const temperamentos = await Temperamento.findAll({
            order: [['nombre', 'ASC']]
        });
        res.json({ ok: true, temperamentos });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

module.exports = { getAll };
