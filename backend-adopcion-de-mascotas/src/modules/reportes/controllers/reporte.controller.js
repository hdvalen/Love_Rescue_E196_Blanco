const reporteService = require('../services/reporte.service');

const publico = async (req, res) => {
    try {
        const data = await reporteService.getGeneral();
        const disponibles = (data.mascotas.porEstado || []).find(e => e.estado_mascota === 'DISPONIBLE');
        const adoptadas = (data.solicitudes.porEstado || []).find(e => e.estado_solicitud === 'ADOPTADA');
        const aprobadas = (data.fundaciones.porEstado || []).find(e => e.estado_aprobacion === 'APROBADA');

        res.json({
            ok: true,
            mascotas_disponibles: parseInt(disponibles?.cantidad || 0),
            adopciones_exitosas: parseInt(adoptadas?.cantidad || 0),
            fundaciones_verificadas: parseInt(aprobadas?.cantidad || 0)
        });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const general = async (req, res) => {
    try {
        const data = await reporteService.getGeneral();

        res.json({ ok: true, ...data });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

const mascotas = async (req, res) => {
    try {
        const data = await reporteService.getMascotas();

        res.json({ ok: true, ...data });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

const solicitudes = async (req, res) => {
    try {
        const data = await reporteService.getSolicitudes();

        res.json({ ok: true, ...data });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

const fundaciones = async (req, res) => {
    try {
        const data = await reporteService.getFundaciones();

        res.json({ ok: true, ...data });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

const usuarios = async (req, res) => {
    try {
        const data = await reporteService.getUsuarios();

        res.json({ ok: true, ...data });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

const miFundacion = async (req, res) => {
    try {
        const data = await reporteService.getMiFundacion(req.user.id_usuario);
        res.json({ ok: true, ...data });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const excelReporte = async (req, res) => {
    try {
        const wb = await reporteService.getExcelReporte();
        const fileName = `reporte_adoptame_${new Date().toISOString().slice(0, 10)}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        await wb.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

module.exports = {
    publico,
    general,
    mascotas,
    solicitudes,
    fundaciones,
    usuarios,
    miFundacion,
    excelReporte
};
