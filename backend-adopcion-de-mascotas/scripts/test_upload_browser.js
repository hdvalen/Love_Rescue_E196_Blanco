const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BOUNDARY = '----TestBoundary' + crypto.randomBytes(8).toString('hex');

function multipartBody(fields, files) {
  const parts = [];
  for (const [k, v] of Object.entries(fields)) {
    parts.push(Buffer.from('--' + BOUNDARY + '\r\n'));
    parts.push(Buffer.from('Content-Disposition: form-data; name="' + k + '"\r\n\r\n'));
    parts.push(Buffer.from(v + '\r\n'));
  }
  for (const [fieldName, filePath] of Object.entries(files)) {
    const content = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    parts.push(Buffer.from('--' + BOUNDARY + '\r\n'));
    parts.push(Buffer.from('Content-Disposition: form-data; name="' + fieldName + '"; filename="' + fileName + '"\r\n'));
    parts.push(Buffer.from('Content-Type: image/png\r\n\r\n'));
    parts.push(content);
    parts.push(Buffer.from('\r\n'));
  }
  parts.push(Buffer.from('--' + BOUNDARY + '--\r\n'));
  return Buffer.concat(parts);
}

async function main() {
  // Create test image
  const imgPath = __dirname + '/test_avatar.png';
  try { require('sharp')({create:{width:50,height:50,channels:3,background:{r:255,g:0,b:0}}}).png().toFile(imgPath); } catch { fs.writeFileSync(imgPath, Buffer.alloc(100)); }

  // Login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testadopt@test.com', password: 'Test123!' })
  }).then(r => r.json());
  const token = loginRes.data.token;
  if (!token) { console.log('LOGIN FAILED'); process.exit(1); }
  console.log('1. Login OK');

  // Upload foto via proper multipart
  const body = multipartBody({}, { foto: imgPath });

  const upRes = await fetch('http://localhost:3000/api/usuarios/foto', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'multipart/form-data; boundary=' + BOUNDARY
    },
    body
  }).then(r => r.json());
  
  console.log('2. Upload response:', JSON.stringify(upRes, null, 2));

  // Verify file exists
  if (upRes.ok && upRes.user?.foto_url) {
    const fileCheck = await fetch('http://localhost:3000/uploads/' + upRes.user.foto_url).then(r => ({ status: r.status, type: r.headers.get('content-type') }));
    console.log('3. File URL check:', fileCheck);
  }

  try { fs.unlinkSync(imgPath); } catch {}
}

main().catch(e => console.error(e));
