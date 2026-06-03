require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const http = require('http');

// First login to get token
const loginPayload = JSON.stringify({ email: 'maldali@gmail.com', password: 'Magdali123*' });

const loginReq = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginPayload) }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const loginRes = JSON.parse(data);
    if (!loginRes.ok) {
      console.log('Login error:', loginRes.message);
      return;
    }
    const token = loginRes.token;
    console.log('Token obtained');

    // Now update profile
    const updatePayload = JSON.stringify({
      housing_type: 'Casa',
      has_patio: true,
      hours_alone: '4 horas',
      experience: 'Tengo experiencia con perros',
      family_composition: '2 adultos'
    });

    const updateReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/usuarios/' + loginRes.user.id_usuario,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(updatePayload),
        'Authorization': 'Bearer ' + token
      }
    }, (res2) => {
      let d2 = '';
      res2.on('data', c => d2 += c);
      res2.on('end', () => {
        console.log('Update response:', d2);
      });
    });
    updateReq.write(updatePayload);
    updateReq.end();
  });
});
loginReq.write(loginPayload);
loginReq.end();
