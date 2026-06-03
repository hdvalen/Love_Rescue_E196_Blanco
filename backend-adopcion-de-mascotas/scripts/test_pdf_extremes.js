const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateTestPDF(label, data) {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `test_${label}_${Date.now()}.pdf`;
  const filepath = path.join(__dirname, '../uploads/contratos', filename);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  const X0 = 50, PAGE_W = 612, CONTENT_W = PAGE_W - 100;
  const PRIMARY = '#4F46E5', DARK = '#1F2937', GRAY = '#6B7280', LIGHT_BG = '#F9FAFB', BORDER = '#E5E7EB';
  const now = new Date();

  // Same code as in acceptContract
  doc.rect(0, 0, PAGE_W, 12).fill(PRIMARY);
  doc.y = 24;
  doc.fontSize(22).font('Helvetica-Bold').fillColor(DARK).text('AdoptaMe', X0, doc.y, { continued: true });
  doc.fontSize(10).font('Helvetica').fillColor(GRAY).text('   Plataforma de Adopción Responsable');
  doc.moveDown(0.3);
  doc.fontSize(9).font('Helvetica').fillColor(GRAY).text(`Documento emitido el ${now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`, X0);
  doc.moveDown(0.8);
  doc.moveTo(X0, doc.y).lineTo(PAGE_W - X0, doc.y).strokeColor(BORDER).lineWidth(1).stroke();
  doc.moveDown(1);
  doc.fontSize(16).font('Helvetica-Bold').fillColor(PRIMARY).text('CONTRATO DE ADOPCIÓN RESPONSABLE', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).font('Helvetica').fillColor(GRAY).text(`ID Contrato: CT-00001   |   Solicitud: #1`, { align: 'center' });
  doc.moveDown(1);

  const cardW = (CONTENT_W - 20) / 2;
  const cardY = doc.y;
  doc.roundedRect(X0, cardY, cardW, 72, 6).fillAndStroke(LIGHT_BG, BORDER);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(PRIMARY).text('ADOPTANTE', X0 + 12, cardY + 8);
  doc.fontSize(9).font('Helvetica').fillColor(DARK);
  doc.text(`Nombre: ${data.adoptanteNombre}`, X0 + 12, cardY + 24);
  doc.text(`Email: ${data.adoptanteEmail}`, X0 + 12, cardY + 40);

  const rightX = X0 + cardW + 20;
  doc.roundedRect(rightX, cardY, cardW, 72, 6).fillAndStroke(LIGHT_BG, BORDER);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(PRIMARY).text('MASCOTA', rightX + 12, cardY + 8);
  doc.fontSize(9).font('Helvetica').fillColor(DARK);
  doc.text(`Nombre: ${data.mascotaNombre}`, rightX + 12, cardY + 24);
  doc.text(`Especie: ${data.mascotaEspecie} / ${data.mascotaRaza}`, rightX + 12, cardY + 40);

  const cardY2 = cardY + 88;
  doc.roundedRect(X0, cardY2, cardW, 72, 6).fillAndStroke(LIGHT_BG, BORDER);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(PRIMARY).text('FUNDACIÓN', X0 + 12, cardY2 + 8);
  doc.fontSize(9).font('Helvetica').fillColor(DARK);
  doc.text(`Nombre: ${data.fundacionNombre}`, X0 + 12, cardY2 + 24);

  doc.roundedRect(rightX, cardY2, cardW, 72, 6).fillAndStroke(LIGHT_BG, BORDER);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(PRIMARY).text('REGISTRO', rightX + 12, cardY2 + 8);
  doc.fontSize(9).font('Helvetica').fillColor(DARK);
  doc.text(`Fecha: ${now.toLocaleDateString('es-CO')}`, rightX + 12, cardY2 + 24);
  doc.text(`Hora: ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`, rightX + 12, cardY2 + 40);
  doc.text(`IP: ${data.ip}`, rightX + 12, cardY2 + 56);

  doc.y = cardY2 + 88;
  doc.moveDown(1);

  doc.fontSize(11).font('Helvetica-Bold').fillColor(DARK).text('CLÁUSULAS DEL CONTRATO', { align: 'center' });
  doc.moveDown(0.5);
  doc.moveTo(X0, doc.y).lineTo(PAGE_W - X0, doc.y).strokeColor(BORDER).lineWidth(0.5).stroke();
  doc.moveDown(0.5);

  data.clausulas.forEach((clausula, i) => {
    const numY = doc.y;
    doc.roundedRect(X0, numY, 18, 18, 4).fill(PRIMARY);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF').text(`${i + 1}`, X0 + 5, numY + 3, { width: 18, align: 'center' });
    doc.fontSize(9).font('Helvetica').fillColor(DARK).text(clausula, X0 + 28, numY, { width: CONTENT_W - 28 });
    doc.y = Math.max(doc.y, numY + 22);
    doc.moveDown(0.4);
  });

  doc.moveDown(1);
  doc.moveTo(X0, doc.y).lineTo(PAGE_W - X0, doc.y).strokeColor(BORDER).lineWidth(1).stroke();
  doc.moveDown(0.8);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(PRIMARY).text('ACEPTACIÓN DIGITAL', { align: 'center' });
  doc.moveDown(0.5);

  const acceptY = doc.y;
  doc.roundedRect(X0, acceptY, CONTENT_W, 90, 6).fillAndStroke('#EEF2FF', '#C7D2FE');
  doc.fontSize(9).font('Helvetica').fillColor(DARK);
  doc.text('Este documento certifica que el contrato de adopción ha sido aceptado electrónicamente.', X0 + 15, acceptY + 10, { width: CONTENT_W - 30 });
  doc.text(`Fecha de aceptación: ${now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`, X0 + 15, acceptY + 30);
  doc.text(`Hora: ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`, X0 + 15, acceptY + 46);
  doc.text(`IP de registro: ${data.ip}`, X0 + 15, acceptY + 62);
  doc.y = acceptY + 100;
  doc.moveDown(0.3);
  doc.fontSize(8).font('Helvetica-Oblique').fillColor(GRAY).text('La aceptación digital tiene validez legal según la Ley 527 de 1999.', { align: 'center' });

  // Footer
  doc.y = 700;
  doc.moveTo(X0, doc.y).lineTo(PAGE_W - X0, doc.y).strokeColor(BORDER).lineWidth(0.5).stroke();
  doc.moveDown(0.3);
  doc.fontSize(7).font('Helvetica').fillColor('#9CA3AF').text(`Documento generado por AdoptaMe · ${now.toLocaleString('es-CO')} · ID: CT-00001`, X0, doc.y, { align: 'center', width: CONTENT_W });

  doc.end();

  return new Promise((resolve) => {
    stream.on('finish', () => {
      const stats = fs.statSync(filepath);
      resolve({ filename, size: stats.size, path: filepath });
    });
  });
}

async function main() {
  const results = [];

  // Test 1: Very long names
  results.push(await generateTestPDF('long_names', {
    adoptanteNombre: 'María del Pilar de los Ángeles Fernández García Hernández López',
    adoptanteEmail: 'maria.del.pilar.fernandez.garcia.hernandez.lopez@correoelectronicoextremadamentelargo.com.co',
    mascotaNombre: 'Maximiliano Fernando de Todos los Santos Pérez',
    mascotaEspecie: 'Canis lupus familiaris (Perro Doméstico)',
    mascotaRaza: 'Labrador Retriever de pelo largo color dorado',
    fundacionNombre: 'Fundación Protectora de Animales y Mascotas "Huellitas del Corazón"',
    ip: '192.168.254.254',
    clausulas: [
      'El adoptante se compromete a brindar los cuidados necesarios para garantizar el bienestar de la mascota, incluyendo alimentación adecuada, atención veterinaria periódica, un espacio seguro y afecto permanente.',
      'El adoptante autoriza a la fundación a realizar visitas de seguimiento, previa coordinación, para verificar el estado y bienestar de la mascota adoptada durante el período acordado.',
      'El adoptante se compromete a mantener actualizados sus datos de contacto y a notificar a la fundación ante cualquier cambio que pueda afectar el cuidado o tenencia de la mascota.',
      'En caso de no poder continuar con la tenencia de la mascota por cualquier motivo, el adoptante se compromete a devolverla a la fundación, quedando prohibida su entrega a terceros sin autorización expresa.',
      'El adoptante declara haber recibido información completa sobre las características, necesidades y responsabilidades que implica la adopción, y acepta todos los términos del presente contrato.'
    ]
  }));
  console.log(`1. Long names: ${results[0].filename} (${results[0].size} bytes)`);

  // Test 2: 20 clauses (extreme)
  const twentyClauses = [];
  for (let i = 1; i <= 20; i++) {
    twentyClauses.push(`Cláusula número ${i}. Esta es una cláusula de prueba con texto suficientemente largo para simular condiciones contractuales reales en un proceso de adopción responsable de mascotas. El adoptante debe cumplir con esta disposición de manera estricta.`);
  }
  results.push(await generateTestPDF('20_clausulas', {
    adoptanteNombre: 'Test User',
    adoptanteEmail: 'test@test.com',
    mascotaNombre: 'Firulais',
    mascotaEspecie: 'Perro',
    mascotaRaza: 'Criollo',
    fundacionNombre: 'Test Fundacion',
    ip: '127.0.0.1',
    clausulas: twentyClauses
  }));
  console.log(`2. 20 clauses: ${results[1].filename} (${results[1].size} bytes)`);

  // Test 3: 0 clauses (edge case)
  results.push(await generateTestPDF('0_clausulas', {
    adoptanteNombre: 'Test User', adoptanteEmail: 'test@test.com',
    mascotaNombre: 'Firulais', mascotaEspecie: 'Perro', mascotaRaza: 'Criollo',
    fundacionNombre: 'Test Fundacion', ip: '127.0.0.1',
    clausulas: []
  }));
  console.log(`3. 0 clauses: ${results[2].filename} (${results[2].size} bytes)`);

  // Test 4: Special characters
  results.push(await generateTestPDF('special_chars', {
    adoptanteNombre: '¡Test! Usuario "Especial" <>&\'"',
    adoptanteEmail: 'test+special@test-mail.com',
    mascotaNombre: 'Ñoño Pérez™ ©2024',
    mascotaEspecie: 'Perro®',
    mascotaRaza: 'Dóberman',
    fundacionNombre: 'Fundación "Amigos" <Amor>',
    ip: '192.168.1.1',
    clausulas: [
      'Caracteres especiales: áéíóú ñ Ñ ¡¿ € ® ™ © «»',
      'HTML entities: < > & " \' / \\',
      'Saltos de línea manuales:\nPrimera línea\nSegunda línea\nTercera línea',
      'Texto muy largo sin espacios: Loremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloremagnaaliqua.'
    ]
  }));
  console.log(`4. Special chars: ${results[3].filename} (${results[3].size} bytes)`);

  // Summary
  console.log('\n=== RESULT SUMMARY ===');
  for (const r of results) {
    const stats = fs.statSync(r.path);
    console.log(`${r.filename}: ${stats.size} bytes`);
  }
}

main().catch(console.error);
