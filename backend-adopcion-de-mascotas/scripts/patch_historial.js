const fs = require('fs');
const path = require('path');
const filepath = path.join(__dirname, '../src/modules/solicitudes/services/solicitud.service.js');
let content = fs.readFileSync(filepath, 'utf8');

// Each insertion: find the transaction.commit that belongs to each state change
// Insert registrarHistorial before await transaction.commit();

// 1. createSolicitud (PENDIENTE)
content = content.replace(
  "        await registrarHistorial(solicitud.id_solicitud, null, 'PENDIENTE', data.id_usuario, data.motivo, transaction);\n        await transaction.commit();\n        return solicitud;\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst getSolicitudes",
  "        await transaction.commit();\n        return solicitud;\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst getSolicitudes"
);

// 2. ponerEnEvaluacion (EN_EVALUACION)
content = content.replace(
  "        }, { transaction });\n\n        await transaction.commit();\n        return solicitud;\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst ponerEnSeguimiento",
  "        }, { transaction });\n        await registrarHistorial(id, null, 'EN_EVALUACION', respondidoPor, null, transaction);\n        await transaction.commit();\n        return solicitud;\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst ponerEnSeguimiento"
);

// 3. ponerEnSeguimiento (EN_SEGUIMIENTO)
content = content.replace(
  "        }, { transaction });\n\n        await transaction.commit();\n        return solicitud;\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst aprobarSolicitud",
  "        }, { transaction });\n        await registrarHistorial(id, 'APROBADA', 'EN_SEGUIMIENTO', respondidoPor, null, transaction);\n        await transaction.commit();\n        return solicitud;\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst aprobarSolicitud"
);

// 4. aprobarSolicitud (APROBADA)
content = content.replace(
  "        }, { transaction });\n\n        await transaction.commit();\n        return solicitud;\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst rechazarSolicitud",
  "        }, { transaction });\n        await registrarHistorial(id, solicitud.estado_solicitud, 'APROBADA', respondidoPor, respuesta, transaction);\n        await transaction.commit();\n        return solicitud;\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst rechazarSolicitud"
);

// 5. rechazarSolicitud (RECHAZADA)
content = content.replace(
  "        }, { transaction });\n\n        await transaction.commit();\n        return solicitud;\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst finalizarAdopcion",
  "        }, { transaction });\n        await registrarHistorial(id, solicitud.estado_solicitud, 'RECHAZADA', respondidoPor, respuesta, transaction);\n        await transaction.commit();\n        return solicitud;\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst finalizarAdopcion"
);

// 6. finalizarAdopcion (ADOPTADA)
content = content.replace(
  "        await transaction.commit();\n\n        return {\n            solicitud: {\n                id_solicitud: solicitud.id_solicitud,\n                estado_solicitud: 'ADOPTADA'\n            },\n            mascota: {\n                id_mascota: solicitud.id_mascota,\n                estado_mascota: 'ADOPTADO'\n            }\n        };\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst cancelarSolicitud",
  "        await registrarHistorial(id, solicitud.estado_solicitud, 'ADOPTADA', respondidoPor, null, transaction);\n        await transaction.commit();\n\n        return {\n            solicitud: {\n                id_solicitud: solicitud.id_solicitud,\n                estado_solicitud: 'ADOPTADA'\n            },\n            mascota: {\n                id_mascota: solicitud.id_mascota,\n                estado_mascota: 'ADOPTADO'\n            }\n        };\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst cancelarSolicitud"
);

// 7. cancelarSolicitud (CANCELADA)
content = content.replace(
  "        }, { transaction });\n        }\n\n        await transaction.commit();\n        return solicitud;\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst deleteSolicitud",
  "        }, { transaction });\n        }\n        await registrarHistorial(id, (solicitud as any).estado_solicitud, 'CANCELADA', usuarioId, motivo, transaction);\n        await transaction.commit();\n        return solicitud;\n    } catch (error) {\n        await transaction.rollback();\n        throw error;\n    }\n};\n\nconst deleteSolicitud"
);

fs.writeFileSync(filepath, content, 'utf8');
console.log('PATCHED');
