const jwt = require('jsonwebtoken');
const fs = require('fs');
const secret = fs.readFileSync('.env','utf8').match(/JWT_SECRET=(.+)/)[1];
const base = { id_usuario: 1, email: 'test@test.com' };
const cases = [
  { label: 'id_rol=999', payload: { ...base, id_rol: 999 } },
  { label: 'id_rol=null', payload: { ...base, id_rol: null } },
  { label: 'id_rol=string', payload: { ...base, id_rol: 'ADMIN' } },
  { label: 'sin_id_rol',   payload: { ...base } },
  { label: 'payload_vacio', payload: {} },
  { label: 'id_rol=1',     payload: { ...base, id_rol: 1 } },
];
cases.forEach(c => {
  const token = jwt.sign(c.payload, secret, { algorithm: 'HS256', expiresIn: '1h' });
  console.log(c.label + '|' + token);
});
