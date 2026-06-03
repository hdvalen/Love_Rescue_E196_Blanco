require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/db');
const Mascota = require('./src/modules/mascotas/models/mascota.model');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la BD');

    // Check if fundacion 5 exists, if not create it
    const [funds] = await sequelize.query('SELECT id_fundacion FROM fundacion WHERE id_fundacion = 5');
    if (!funds.length) {
      // Create a fundacion user first
      const hashedPw = await bcrypt.hash('Fundacion1!', 10);
      const [userResult] = await sequelize.query(
        "INSERT INTO usuario (nombre, email, password, id_rol, estado) VALUES ('Refugio Esperanza', 'refugio@esperanza.org', ?, 2, 1)",
        { replacements: [hashedPw] }
      );
      const idUsuario = userResult.insertId || userResult[0]?.insertId;
      console.log(`  ✓ Usuario fundación creado (id=${idUsuario})`);

      // Now create fundacion 5
      await sequelize.query(
        "INSERT INTO fundacion (id_usuario, nombre_fundacion, estado_aprobacion, ciudad, departamento) VALUES (?, 'Refugio Esperanza', 'APROBADA', 'Cali', 'Valle del Cauca')",
        { replacements: [idUsuario] }
      );
      console.log('  ✓ Fundación 5 creada: Refugio Esperanza');
    } else {
      console.log('  ✓ Fundación 5 ya existe');
    }

    const pets = [
      // --- 5 Perros (3 para fundacion 4, 2 para fundacion 5) ---
      { nombre: 'Max', especie: 'Perro', raza: 'Golden Retriever', edad: 2, tamano: 'GRANDE', sexo: 'MACHO', esterilizado: true, vacunado: true, temperamento: 'Cariñoso,Juguetón,Sociable', descripcion: 'Max es un perro increíblemente cariñoso y juguetón. Le encanta correr al aire libre.', ubicacion: 'Bogotá', condiciones_adopcion: 'Requiere casa con patio amplio', id_fundacion: 4 },
      { nombre: 'Rocky', especie: 'Perro', raza: 'Border Collie', edad: 3, tamano: 'MEDIANO', sexo: 'MACHO', esterilizado: false, vacunado: true, temperamento: 'Inteligente,Energético,Leal', descripcion: 'Rocky es muy inteligente y necesita mucha actividad física y mental.', ubicacion: 'Medellín', id_fundacion: 5 },
      { nombre: 'Toby', especie: 'Perro', raza: 'Dachshund', edad: 1, tamano: 'PEQUENO', sexo: 'MACHO', esterilizado: false, vacunado: true, temperamento: 'Curioso,Juguetón,Alegre', descripcion: 'Toby es un cachorrito lleno de energía y curiosidad.', ubicacion: 'Cali', id_fundacion: 4 },
      { nombre: 'Luna', especie: 'Perro', raza: 'Labrador', edad: 4, tamano: 'GRANDE', sexo: 'HEMBRA', esterilizado: true, vacunado: true, temperamento: 'Tranquila,Protectora,Fiel', descripcion: 'Luna es una perra tranquila y protectora. Ideal para familias.', ubicacion: 'Bogotá', id_fundacion: 5 },
      { nombre: 'Bruno', especie: 'Perro', raza: 'Pastor Alemán', edad: 2, tamano: 'GRANDE', sexo: 'MACHO', esterilizado: true, vacunado: true, temperamento: 'Leal,Inteligente,Protector', descripcion: 'Bruno está bien entrenado. Busca un hogar con experiencia.', ubicacion: 'Medellín', id_fundacion: 4 },
      // --- 5 Gatos (2 para fundacion 4, 3 para fundacion 5) ---
      { nombre: 'Mía', especie: 'Gato', raza: 'Tabby Naranja', edad: 1, tamano: 'MEDIANO', sexo: 'HEMBRA', esterilizado: true, vacunado: true, temperamento: 'Tranquila,Independiente,Cariñosa', descripcion: 'Mía disfruta de las siestas largas y los mimos. Ideal para departamentos.', ubicacion: 'Bogotá', id_fundacion: 4 },
      { nombre: 'Nieve', especie: 'Gato', raza: 'Persa Blanco', edad: 1, tamano: 'PEQUENO', sexo: 'HEMBRA', esterilizado: false, vacunado: true, temperamento: 'Dulce,Juguetona,Tierna', descripcion: 'Nieve es dulce y juguetona. Su pelo sedoso requiere cepillado regular.', ubicacion: 'Cali', id_fundacion: 5 },
      { nombre: 'Simba', especie: 'Gato', raza: 'Naranja', edad: 3, tamano: 'MEDIANO', sexo: 'MACHO', esterilizado: true, vacunado: true, temperamento: 'Sociable,Juguetón,Aventurero', descripcion: 'Simba es sociable y disfruta explorar cada rincón.', ubicacion: 'Medellín', id_fundacion: 4 },
      { nombre: 'Stella', especie: 'Gato', raza: 'Azul Ruso', edad: 2, tamano: 'MEDIANO', sexo: 'HEMBRA', esterilizado: true, vacunado: true, temperamento: 'Elegante,Silenciosa,Adaptable', descripcion: 'Stella es elegante y se adapta bien a espacios pequeños.', ubicacion: 'Bogotá', id_fundacion: 5 },
      { nombre: 'Pelusa', especie: 'Gato', raza: 'Mestizo', edad: 1, tamano: 'PEQUENO', sexo: 'HEMBRA', esterilizado: false, vacunado: false, temperamento: 'Traviesa,Cariñosa,Curiosa', descripcion: 'Pelusa es una gatita traviesa que llena de alegría cualquier hogar.', ubicacion: 'Medellín', id_fundacion: 5 },
    ];

    // Ensure all temperamento names exist in the temperamento table
    const allTempNames = [...new Set(pets.flatMap(p => p.temperamento.split(',').map(t => t.trim()).filter(Boolean)))];
    for (const nombre of allTempNames) {
      await sequelize.query('INSERT IGNORE INTO temperamento (nombre) VALUES (?)', { replacements: [nombre] });
    }
    console.log(`  ✓ ${allTempNames.length} temperamentos asegurados en BD`);

    for (const pet of pets) {
      const [existing] = await sequelize.query(
        'SELECT id_mascota FROM mascota WHERE nombre = ? AND id_fundacion = ? AND especie = ?',
        { replacements: [pet.nombre, pet.id_fundacion, pet.especie] }
      );
      if (existing.length) {
        console.log(`  ~ ${pet.especie}: ${pet.nombre} ya existe, saltando`);
        continue;
      }
      const newPet = await Mascota.create(pet);
      // Link temperamentos via pivot table
      const nombres = pet.temperamento.split(',').map(t => t.trim()).filter(Boolean);
      for (const nombre of nombres) {
        const [rows] = await sequelize.query(
          'SELECT id_temperamento FROM temperamento WHERE nombre = ?',
          { replacements: [nombre] }
        );
        if (rows.length) {
          await sequelize.query(
            'INSERT IGNORE INTO mascota_temperamento (id_mascota, id_temperamento) VALUES (?, ?)',
            { replacements: [newPet.id_mascota, rows[0].id_temperamento] }
          );
        }
      }
      console.log(`  ✓ ${pet.especie}: ${pet.nombre} (fundación ${pet.id_fundacion})`);
    }

    console.log('✅ Seed completado');
    await sequelize.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
