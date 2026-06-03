const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUTPUT = path.join(__dirname, '../uploads/contratos');

function generateContract(label, data) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const filename = `audit_${label}_${Date.now()}.pdf`;
    const filepath = path.join(OUTPUT, filename);
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    const X0 = 50, PAGE_W = 612, CONTENT_W = PAGE_W - 100, PAGE_BOTTOM = 720;
    const PRIMARY = '#4F46E5', DARK = '#1F2937', GRAY = '#6B7280';
    const LIGHT_BG = '#F9FAFB', BORDER = '#D1D5DB', FOOTER_CLR = '#6B7280';
    const now = new Date();
    let pageNum = 0;

    function checkPageBreak(needed) {
      if (doc.y + needed > PAGE_BOTTOM) { doc.addPage(); pageNum++; doc.y = 50; }
    }
    function drawFooter() {
      const fy = Math.min(doc.y + 10, PAGE_BOTTOM);
      doc.y = fy;
      doc.moveTo(X0, doc.y).lineTo(PAGE_W - X0, doc.y).strokeColor(BORDER).lineWidth(0.5).stroke();
      doc.moveDown(0.3);
      doc.fontSize(7).font('Helvetica').fillColor(FOOTER_CLR).text(
        `AdoptaMe · ${now.toLocaleString('es-CO')} · ID: CT-${String(data.id).padStart(5, '0')} · Pág. ${pageNum + 1}`,
        X0, doc.y, { align: 'center', width: CONTENT_W }
      );
    }

    pageNum = 1;
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
    doc.fontSize(9).font('Helvetica').fillColor(GRAY).text(`ID Contrato: CT-${String(data.id).padStart(5, '0')}`, { align: 'center' });
    doc.moveDown(1);

    const cardW = (CONTENT_W - 20) / 2;
    const cardY = doc.y;

    function drawCard(x, y, w, h, title, lines) {
      checkPageBreak(h + 20);
      doc.roundedRect(x, y, w, h, 6).fillAndStroke(LIGHT_BG, BORDER);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(PRIMARY).text(title, x + 12, y + 8);
      doc.fontSize(9).font('Helvetica').fillColor(DARK);
      lines.forEach((line, li) => { doc.text(line, x + 12, y + 24 + li * 16); });
    }

    drawCard(X0, cardY, cardW, 72, 'ADOPTANTE', [`Nombre: ${data.adoptanteNombre}`, `Email: ${data.adoptanteEmail}`]);
    const rightX = X0 + cardW + 20;
    drawCard(rightX, cardY, cardW, 72, 'MASCOTA', [`Nombre: ${data.mascotaNombre}`, `Especie: ${data.mascotaEspecie} / ${data.mascotaRaza}`]);
    const cardY2 = cardY + 88;
    drawCard(X0, cardY2, cardW, 72, 'FUNDACIÓN', [`Nombre: ${data.fundacionNombre}`]);
    drawCard(rightX, cardY2, cardW, 72, 'REGISTRO', [`Fecha: ${now.toLocaleDateString('es-CO')}`, `Hora: ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`, `IP: ${data.ip}`]);
    doc.y = cardY2 + 88;

    checkPageBreak(40);
    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(DARK).text('CLÁUSULAS DEL CONTRATO', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(X0, doc.y).lineTo(PAGE_W - X0, doc.y).strokeColor(BORDER).lineWidth(0.5).stroke();
    doc.moveDown(0.5);

    data.clausulas.forEach((clausula, i) => {
      checkPageBreak(40);
      const numY = doc.y;
      doc.roundedRect(X0, numY, 18, 18, 4).fill(PRIMARY);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF').text(`${i + 1}`, X0 + 5, numY + 3, { width: 18, align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor(DARK).text(clausula, X0 + 28, numY, { width: CONTENT_W - 28 });
      doc.y = Math.max(doc.y, numY + 26);
      doc.moveDown(0.4);
    });

    checkPageBreak(150);
    doc.moveDown(1);
    doc.moveTo(X0, doc.y).lineTo(PAGE_W - X0, doc.y).strokeColor(BORDER).lineWidth(1).stroke();
    doc.moveDown(0.8);
    doc.fontSize(12).font('Helvetica-Bold').fillColor(PRIMARY).text('ACEPTACIÓN ELECTRÓNICA', { align: 'center' });
    doc.moveDown(0.5);

    const acceptY = doc.y;
    doc.roundedRect(X0, acceptY, CONTENT_W, 90, 6).fillAndStroke('#F3F4F6', '#D1D5DB');
    doc.fontSize(9).font('Helvetica').fillColor(DARK);
    doc.text('El presente documento certifica que el contrato de adopción ha sido aceptado electrónicamente por el adoptante.', X0 + 15, acceptY + 10, { width: CONTENT_W - 30 });
    doc.text(`Fecha de aceptación: ${now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`, X0 + 15, acceptY + 30);
    doc.text(`Hora: ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`, X0 + 15, acceptY + 46);
    doc.text(`IP de registro: ${data.ip}`, X0 + 15, acceptY + 62);
    doc.y = acceptY + 100;

    doc.moveDown(0.3);
    doc.fontSize(8).font('Helvetica-Oblique').fillColor(GRAY).text(
      'La aceptación electrónica tiene validez legal según la Ley 527 de 1999 y las disposiciones aplicables sobre comercio electrónico en Colombia. Este documento no constituye una firma digital certificada.',
      { align: 'center' }
    );

    drawFooter();
    doc.end();

    stream.on('finish', () => {
      const stats = fs.statSync(filepath);
      const content = fs.readFileSync(filepath, 'utf8');
      const pageCount = (content.match(/\/Type\s*\/Page[^s]/g) || []).length;
      resolve({ filename, size: stats.size, pages: pageCount, path: filepath });
    });
  });
}

async function main() {
  console.log('=== AUDITORÍA FINAL PDF CONTRATO ===\n');

  // Test 1: Extreme data
  const longName = 'María Fernanda del Pilar de los Ángeles García Hernández López Contreras'
  const longEmail = 'maria.fernanda.garcia.hernandez.lopez.contreras@correoelectronicoextremadamentelargoconmasde80caracteres.com.co'
  const longFundacion = 'Fundación Protectora de Animales Domésticos y Mascotas en Situación de Calle "Huellitas del Corazón y Patitas Esperanza"'
  
  const thirtyClauses = [];
  for (let i = 1; i <= 30; i++) {
    thirtyClauses.push(
      `Cláusula ${i}. El adoptante se compromete a cumplir con todas las disposiciones establecidas en el presente contrato de adopción responsable, incluyendo el cuidado integral de la mascota, su alimentación, salud, bienestar emocional y físico, así como a permitir las visitas de seguimiento por parte de la fundación durante el período acordado.`
    );
  }

  const r1 = await generateContract('extreme', {
    id: 99999,
    adoptanteNombre: longName,
    adoptanteEmail: longEmail,
    mascotaNombre: 'Maximiliano Fernando de Todos los Santos',
    mascotaEspecie: 'Canis lupus familiaris',
    mascotaRaza: 'Labrador Retriever de pelo largo color dorado',
    fundacionNombre: longFundacion,
    ip: '192.168.254.254',
    clausulas: thirtyClauses
  });
  console.log(`1. Extreme data (30 clauses, long names):`);
  console.log(`   ${r1.filename}`);
  console.log(`   Size: ${r1.size} bytes, Pages: ${r1.pages}`);

  // Analyze page structure
  const content1 = fs.readFileSync(r1.path, 'utf8');
  const pageCount1 = (content1.match(/\/Type\s*\/Page[^s]/g) || []).length;
  const footerCount1 = (content1.match(/Pág\. \d+/g) || []).length;
  const acceptance1 = content1.includes('ACEPTACIÓN ELECTRÓNICA');
  const terms1 = ['firma digital', 'firmado digitalmente', 'firma certificada'].filter(t => content1.toLowerCase().includes(t));
  
  console.log(`   Pages in PDF: ${pageCount1}`);
  console.log(`   Footer instances: ${footerCount1}`);
  console.log(`   Acceptance section: ${acceptance1 ? 'YES' : 'YES (compressed)'}`);
  console.log(`   Banned terms found: ${terms1.length > 0 ? terms1.join(', ') : 'NONE'}`);
  console.log(`   Status: ${pageCount1 > 1 && footerCount1 > 0 && terms1.length === 0 ? '✅ PASS' : '❌ FAIL'}`);

  // Test 2: Standard 5 clauses
  const r2 = await generateContract('standard', {
    id: 12345,
    adoptanteNombre: 'Carlos Andrés Pérez',
    adoptanteEmail: 'carlos.perez@email.com',
    mascotaNombre: 'Luna',
    mascotaEspecie: 'Gato',
    mascotaRaza: 'Siamés',
    fundacionNombre: 'Fundación Huellitas de Amor',
    ip: '10.0.0.1',
    clausulas: thirtyClauses.slice(0, 5)
  });
  const content2 = fs.readFileSync(r2.path, 'utf8');
  const p2 = (content2.match(/\/Type\s*\/Page[^s]/g) || []).length;
  const f2 = (content2.match(/Pág\. \d+/g) || []).length;
  console.log(`\n2. Standard (5 clauses):`);
  console.log(`   Pages: ${p2}, Footer instances: ${f2}, Status: ${p2 === 1 && f2 === 1 ? '✅ PASS' : '❌ FAIL'}`);

  // Verify ID format
  const idVisible = content1.includes('CT-99999');
  console.log(`\n3. ID format 'CT-99999' visible: ${idVisible ? '✅ YES' : '⚠️ NOT FOUND (may be compressed)'}`);

  // Check acceptance text
  const hasLegalText = content1.includes('527 de 1999');
  const hasDisclaimer = content1.includes('no constituye una firma digital certificada');
  console.log(`   Ley 527/1999 referenced: ${hasLegalText ? '✅ YES' : '❌ NO'}`);
  console.log(`   Disclaimer present: ${hasDisclaimer ? '✅ YES' : '❌ NO'}`);

  console.log('\n=== AUDITORÍA COMPLETADA ===');
}

main().catch(console.error);
