require('dotenv').config();
const pool = require('./db');

async function initDb() {
  const client = await pool.connect();
  try {
    console.log('A iniciar criação de tabelas...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(30),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name_pt VARCHAR(150) NOT NULL,
        name_en VARCHAR(150) NOT NULL,
        description_pt TEXT,
        description_en TEXT,
        duration_minutes INTEGER DEFAULT 60,
        price NUMERIC(10,2),
        active BOOLEAN DEFAULT TRUE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS business_hours (
        id SERIAL PRIMARY KEY,
        day_of_week INTEGER NOT NULL UNIQUE,
        open_time TIME,
        close_time TIME,
        is_closed BOOLEAN DEFAULT FALSE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        service_id INTEGER REFERENCES services(id),
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        role_pt VARCHAR(150),
        role_en VARCHAR(150),
        bio_pt TEXT,
        bio_en TEXT,
        photo_url VARCHAR(500),
        display_order INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT TRUE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        responded_at TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);

    await client.query(`
      ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";
    `);
    await client.query(`
      ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);

    // Seed default business hours (Mon-Sat, closed Sunday)
    const hoursCheck = await client.query('SELECT COUNT(*) FROM business_hours');
    if (parseInt(hoursCheck.rows[0].count) === 0) {
      const defaultHours = [
        [0, null, null, true],
        [1, '09:30', '19:00', false],
        [2, '09:30', '19:00', false],
        [3, '09:30', '19:00', false],
        [4, '09:30', '19:00', false],
        [5, '09:30', '19:00', false],
        [6, '10:00', '15:00', false],
      ];
      for (const [day, open, close, closed] of defaultHours) {
        await client.query(
          'INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES ($1,$2,$3,$4)',
          [day, open, close, closed]
        );
      }
      console.log('Horários padrão inseridos.');
    }

    // Seed default services
    const servicesCheck = await client.query('SELECT COUNT(*) FROM services');
    if (parseInt(servicesCheck.rows[0].count) === 0) {
      const defaultServices = [
        ['Limpeza de Pele Profunda', 'Deep Facial Cleansing', 'Higienização completa com extração e hidratação, adequada a todos os tipos de pele.', 'Complete cleansing with extraction and hydration, suitable for all skin types.', 60, 45],
        ['Tratamento de Acne', 'Acne Treatment', 'Protocolo direcionado para peles com acne ativa, reduzindo inflamação e prevenindo marcas.', 'Targeted protocol for active acne skin, reducing inflammation and preventing scarring.', 60, 50],
        ['Peeling Químico', 'Chemical Peel', 'Renovação celular para uniformizar tom, textura e reduzir manchas.', 'Cellular renewal to even out tone, texture and reduce blemishes.', 45, 55],
        ['Microagulhamento', 'Microneedling', 'Estimulação de colagénio para melhorar firmeza e textura da pele.', 'Collagen stimulation to improve skin firmness and texture.', 75, 70],
        ['Hidratação Facial Profunda', 'Deep Facial Hydration', 'Reposição intensiva de água e nutrientes para peles desidratadas.', 'Intensive water and nutrient replenishment for dehydrated skin.', 50, 40],
        ['Radiofrequência Facial', 'Facial Radiofrequency', 'Tecnologia para firmeza, lifting não invasivo e estímulo de colagénio.', 'Technology for firmness, non-invasive lifting and collagen stimulation.', 45, 60],
      ];
      for (let i = 0; i < defaultServices.length; i++) {
        const [namePt, nameEn, descPt, descEn, dur, price] = defaultServices[i];
        await client.query(
          `INSERT INTO services (name_pt, name_en, description_pt, description_en, duration_minutes, price, display_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [namePt, nameEn, descPt, descEn, dur, price, i]
        );
      }
      console.log('Serviços padrão inseridos.');
    }

    // Seed placeholder team members
    const teamCheck = await client.query('SELECT COUNT(*) FROM team_members');
    if (parseInt(teamCheck.rows[0].count) === 0) {
      const defaultTeam = [
        ['Katia Arnaut', 'Fundadora & Especialista em Estética Facial', 'Founder & Facial Aesthetics Specialist', 'Apaixonada por cuidar da pele há mais de uma década, a Katia combina técnica e sensibilidade em cada tratamento.', 'Passionate about skincare for over a decade, Katia combines technique and sensitivity in every treatment.'],
        ['Equipa Técnica', 'Esteticistas Certificadas', 'Certified Aestheticians', 'Profissionais qualificadas que acompanham cada cliente com rigor e cuidado personalizado.', 'Qualified professionals who accompany each client with rigor and personalized care.'],
        ['Parceiros de Imagem', 'Fotógrafos Profissionais', 'Professional Photographers', 'Colaboramos com fotógrafos profissionais para documentar resultados e a experiência no espaço.', 'We collaborate with professional photographers to document results and the space experience.'],
      ];
      for (let i = 0; i < defaultTeam.length; i++) {
        const [name, rolePt, roleEn, bioPt, bioEn] = defaultTeam[i];
        await client.query(
          `INSERT INTO team_members (name, role_pt, role_en, bio_pt, bio_en, display_order)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [name, rolePt, roleEn, bioPt, bioEn, i]
        );
      }
      console.log('Equipa padrão inserida.');
    }

    console.log('Base de dados inicializada com sucesso.');
  } catch (err) {
    console.error('Erro ao inicializar base de dados:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  initDb()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initDb;
