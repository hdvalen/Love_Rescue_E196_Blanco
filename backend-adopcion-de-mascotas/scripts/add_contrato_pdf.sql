ALTER TABLE solicitud_evaluacion
ADD COLUMN contrato_pdf VARCHAR(255) DEFAULT NULL AFTER contrato_ip;
