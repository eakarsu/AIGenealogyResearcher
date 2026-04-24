const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const createCrudRouter = require('./routes/crud');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// CRUD routes for all tables
const tableConfigs = {
  persons: ['first_name', 'last_name', 'birth_date', 'death_date', 'birth_place', 'death_place', 'gender', 'notes'],
  family_trees: ['name', 'description'],
  historical_records: ['title', 'record_type', 'date', 'location', 'description', 'source', 'person_name'],
  dna_matches: ['match_name', 'relationship', 'confidence_pct', 'shared_cm', 'shared_segments', 'platform', 'notes'],
  census_records: ['year', 'state', 'county', 'city', 'head_of_household', 'members', 'occupation', 'address', 'notes'],
  immigration_records: ['immigrant_name', 'origin_country', 'destination', 'arrival_date', 'ship_name', 'port_of_arrival', 'age_at_arrival', 'occupation', 'notes'],
  birth_death_records: ['person_name', 'record_type', 'event_date', 'location', 'county', 'state', 'certificate_number', 'notes'],
  marriage_records: ['spouse1_name', 'spouse2_name', 'marriage_date', 'location', 'county', 'state', 'officiant', 'witnesses', 'certificate_number', 'notes'],
  military_records: ['service_member', 'branch', 'rank_val', 'service_start', 'service_end', 'war_conflict', 'unit', 'decorations', 'notes'],
  newspaper_archives: ['title', 'newspaper_name', 'publish_date', 'location', 'category', 'content', 'url', 'notes'],
  land_records: ['owner_name', 'property_desc', 'location', 'county', 'state', 'deed_date', 'acreage', 'transaction_type', 'price', 'notes'],
  church_records: ['person_name', 'church_name', 'denomination', 'record_type', 'event_date', 'location', 'notes'],
  ship_manifests: ['ship_name', 'departure_port', 'arrival_port', 'departure_date', 'arrival_date', 'passenger_name', 'age', 'nationality', 'occupation', 'notes'],
  documents: ['title', 'doc_type', 'description', 'file_path', 'person_name', 'date_created', 'notes'],
  research_notes: ['title', 'category', 'content', 'source', 'person_name'],
  source_citations: ['title', 'source_type', 'author', 'publication', 'date_published', 'url', 'repository', 'notes'],
  ai_results: ['feature', 'query', 'result'],
};

for (const [table, columns] of Object.entries(tableConfigs)) {
  const routePath = `/api/${table.replace(/_/g, '-')}`;
  app.use(routePath, createCrudRouter(table, columns));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
