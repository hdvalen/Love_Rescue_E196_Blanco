const http = require('http');

const API = 'http://localhost:3000/api';
const UPLOADS = 'http://localhost:3000/uploads';
const BASE = 'http://localhost:3000';

async function req(method, url, opts = {}) {
  const u = new URL(url);
  return new Promise((resolve, reject) => {
    const options = {
      hostname: u.hostname, port: u.port, path: u.pathname + u.search,
      method, headers: opts.headers || {}
    };
    if (opts.token) options.headers['Authorization'] = 'Bearer ' + opts.token;

    const h = http.request(options, async (res) => {
      let data = '';
      for await (const chunk of res) data += chunk;
      try { resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers }); }
      catch { resolve({ status: res.statusCode, data, headers: res.headers }); }
    });
    if (opts.body) h.write(JSON.stringify(opts.body));
    h.end();
  });
}

function formRequest(url, token, field, filePath) {
  const fs = require('fs');
  const path = require('path');
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath);
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="${field}"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;
  const body = Buffer.concat([Buffer.from(header), fileContent, Buffer.from(footer)]);

  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname, port: u.port, path: u.pathname,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': body.length
      }
    };
    const h = http.request(options, async (res) => {
      let data = '';
      for await (const chunk of res) data += chunk;
      try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
      catch { resolve({ status: res.statusCode, data }); }
    });
    h.write(body);
    h.end();
  });
}

async function main() {
  console.log('=== TEST END-TO-END: REORGANIZACIÓN UPLOADS ===\n');

  // 0. Create test image
  const fs = require('fs');
  const path = require('path');
  const testImg = path.join(__dirname, 'test_upload.png');
  // Copy an existing small file as test image
  const srcImg = path.join(__dirname, '../uploads/1778647408303-251222458.png');
  if (fs.existsSync(srcImg)) fs.copyFileSync(srcImg, testImg);
  else {
    // Create minimal PNG
    const sharp = require('sharp');
    await sharp({ create: { width: 10, height: 10, channels: 3, background: { r: 255, g: 0, b: 0 } } }).png().toFile(testImg);
    console.log('   Created test image:', testImg);
  }

  // 1. Login as fundacion
  const loginFund = await req('POST', API + '/auth/login', { body: { email: 'testfund@test.com', password: 'Test123!' } });
  const ft = loginFund.data?.data?.token;
  if (!ft) { console.log('ERROR: Fundacion login failed'); process.exit(1); }
  console.log('1. Fundacion login: OK');

  // 2. Login as adoptante
  const loginAdopt = await req('POST', API + '/auth/login', { body: { email: 'testadopt@test.com', password: 'Test123!' } });
  const at = loginAdopt.data?.data?.token;
  console.log('2. Adoptante login: OK');

  // 3. Upload mascota foto
  const upMascota = await formRequest(API + '/mascotas/4/fotos', ft, 'fotos', testImg);
  const mascotaFoto = upMascota.data?.fotos?.[0]?.nombre_archivo;
  console.log('3. Upload foto mascota:', upMascota.status, mascotaFoto || 'ERROR');

  // 4. Upload logo fundacion
  const upLogo = await formRequest(API + '/fundaciones/7/logo', ft, 'logo', testImg);
  const logoFile = upLogo.data?.fundacion?.logo_url;
  console.log('4. Upload logo fundacion:', upLogo.status, logoFile || 'ERROR');

  // 5. Upload foto perfil
  const upPerfil = await formRequest(API + '/usuarios/foto', at, 'foto', testImg);
  const perfilFile = upPerfil.data?.user?.foto_url;
  console.log('5. Upload foto perfil:', upPerfil.status, perfilFile || 'ERROR');

  // 6. Create solicitud and upload documento
  const mascotas = await req('GET', API + '/mascotas?limit=1', { token: at });
  const mid = mascotas.data?.mascotas?.[0]?.id_mascota;
  if (mid) {
    const cs = await req('POST', API + '/solicitudes', { token: at, body: { id_mascota: mid, motivo: 'Test upload docs' } });
    const sid = cs.data?.solicitud?.id_solicitud;
    if (sid) {
      const testPdf = path.join(__dirname, 'test_doc.pdf');
      if (!fs.existsSync(testPdf)) {
        const doc = new (require('pdfkit'))();
        const ws = fs.createWriteStream(testPdf);
        doc.pipe(ws);
        doc.text('Test document for upload verification');
        doc.end();
        await new Promise(r => ws.on('finish', r));
      }
      const upDoc = await formRequest(API + '/solicitudes/' + sid + '/documentos', at, 'archivos', testPdf);
      const docFile = upDoc.data?.documentos?.[0]?.nombre_archivo;
      console.log('6. Upload documento solicitud:', upDoc.status, docFile || 'ERROR');

      // 7. Verify files in subdirectories
      console.log('\n=== VERIFICACIÓN FÍSICA ===');
      const subdirs = {
        'mascotas/fotos': mascotaFoto,
        'fundaciones/logos': logoFile,
        'usuarios/perfiles': perfilFile,
        'solicitudes/documentos': docFile
      };
      for (const [subdir, file] of Object.entries(subdirs)) {
        if (!file) { console.log(`   ${subdir}: SKIP (no file generated)`); continue; }
        const fullPath = path.join(__dirname, '../uploads', subdir, file);
        const exists = fs.existsSync(fullPath);
        const alsoInRoot = fs.existsSync(path.join(__dirname, '../uploads', file));
        console.log(`   ${subdir}: ${exists ? '✅ FOUND' : '❌ MISSING'} ${alsoInRoot ? '(also in root!)' : ''}`);
      }

      // 8. Verify URL accessibility
      console.log('\n=== VERIFICACIÓN URL ===');
      for (const [label, file] of Object.entries({ mascotaFoto, logoFile, perfilFile, docFile })) {
        if (!file) continue;
        const r = await req('GET', `${UPLOADS}/${file}`, {});
        console.log(`   ${label}: ${r.status} (${r.status === 200 ? '✅' : '❌'})`);
      }
    }
  }

  // Cleanup
  try { fs.unlinkSync(testImg); } catch {}
  try { fs.unlinkSync(path.join(__dirname, 'test_doc.pdf')); } catch {}

  console.log('\n=== TEST COMPLETADO ===');
}

main().catch(e => { console.error(e); process.exit(1); });
