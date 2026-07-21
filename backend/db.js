const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'genealogy',
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS persons (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        birth_date VARCHAR(50),
        death_date VARCHAR(50),
        birth_place VARCHAR(255),
        death_place VARCHAR(255),
        gender VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS family_trees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS historical_records (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        record_type VARCHAR(100),
        date VARCHAR(50),
        location VARCHAR(255),
        description TEXT,
        source VARCHAR(255),
        person_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS dna_matches (
        id SERIAL PRIMARY KEY,
        match_name VARCHAR(255),
        relationship VARCHAR(255),
        confidence_pct DECIMAL,
        shared_cm DECIMAL,
        shared_segments INT,
        platform VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS census_records (
        id SERIAL PRIMARY KEY,
        year INT,
        state VARCHAR(100),
        county VARCHAR(100),
        city VARCHAR(100),
        head_of_household VARCHAR(255),
        members INT,
        occupation VARCHAR(255),
        address VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS immigration_records (
        id SERIAL PRIMARY KEY,
        immigrant_name VARCHAR(255),
        origin_country VARCHAR(100),
        destination VARCHAR(255),
        arrival_date VARCHAR(50),
        ship_name VARCHAR(255),
        port_of_arrival VARCHAR(255),
        age_at_arrival INT,
        occupation VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS birth_death_records (
        id SERIAL PRIMARY KEY,
        person_name VARCHAR(255),
        record_type VARCHAR(20) DEFAULT 'birth',
        event_date VARCHAR(50),
        location VARCHAR(255),
        county VARCHAR(100),
        state VARCHAR(100),
        certificate_number VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS marriage_records (
        id SERIAL PRIMARY KEY,
        spouse1_name VARCHAR(255),
        spouse2_name VARCHAR(255),
        marriage_date VARCHAR(50),
        location VARCHAR(255),
        county VARCHAR(100),
        state VARCHAR(100),
        officiant VARCHAR(255),
        witnesses TEXT,
        certificate_number VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS military_records (
        id SERIAL PRIMARY KEY,
        service_member VARCHAR(255),
        branch VARCHAR(100),
        rank_val VARCHAR(100),
        service_start VARCHAR(50),
        service_end VARCHAR(50),
        war_conflict VARCHAR(255),
        unit VARCHAR(255),
        decorations TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS newspaper_archives (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        newspaper_name VARCHAR(255),
        publish_date VARCHAR(50),
        location VARCHAR(255),
        category VARCHAR(100),
        content TEXT,
        url VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS land_records (
        id SERIAL PRIMARY KEY,
        owner_name VARCHAR(255),
        property_desc TEXT,
        location VARCHAR(255),
        county VARCHAR(100),
        state VARCHAR(100),
        deed_date VARCHAR(50),
        acreage DECIMAL,
        transaction_type VARCHAR(100),
        price DECIMAL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS church_records (
        id SERIAL PRIMARY KEY,
        person_name VARCHAR(255),
        church_name VARCHAR(255),
        denomination VARCHAR(100),
        record_type VARCHAR(100),
        event_date VARCHAR(50),
        location VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ship_manifests (
        id SERIAL PRIMARY KEY,
        ship_name VARCHAR(255),
        departure_port VARCHAR(255),
        arrival_port VARCHAR(255),
        departure_date VARCHAR(50),
        arrival_date VARCHAR(50),
        passenger_name VARCHAR(255),
        age INT,
        nationality VARCHAR(100),
        occupation VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        doc_type VARCHAR(100),
        description TEXT,
        file_path VARCHAR(500),
        person_name VARCHAR(255),
        date_created VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS research_notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        category VARCHAR(100),
        content TEXT,
        source VARCHAR(255),
        person_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS source_citations (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        source_type VARCHAR(100),
        author VARCHAR(255),
        publication VARCHAR(255),
        date_published VARCHAR(50),
        url VARCHAR(500),
        repository VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        feature VARCHAR(255),
        query TEXT,
        result TEXT,
        user_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
