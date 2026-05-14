import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers, FaTree, FaSearch, FaDna, FaFileAlt, FaShip, FaChurch,
  FaNewspaper, FaMedal, FaLandmark, FaHeart, FaBaby, FaGlobeAmericas,
  FaBook, FaStickyNote, FaQuoteRight, FaBrain, FaFont, FaClock,
  FaFileInvoice, FaBalanceScale
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { getAll } from '../services/api';

const iconMap = {
  FaUsers, FaTree, FaSearch, FaDna, FaFileAlt, FaShip, FaChurch,
  FaNewspaper, FaMedal, FaLandmark, FaHeart, FaBaby, FaGlobeAmericas,
  FaBook, FaStickyNote, FaQuoteRight, FaBrain, FaFont, FaClock,
  FaFileInvoice, FaBalanceScale
};

const features = [
  { path: 'persons', table: 'persons', name: 'Person Records', icon: 'FaUsers', description: 'Manage individual person records in your family tree', color: '#6c63ff' },
  { path: 'family-trees', table: 'family_trees', name: 'Family Trees', icon: 'FaTree', description: 'Create and manage family tree structures', color: '#10b981' },
  { path: 'historical-records', table: 'historical_records', name: 'Historical Records', icon: 'FaSearch', description: 'Search and analyze historical records with AI', color: '#f59e0b' },
  { path: 'dna-matches', table: 'dna_matches', name: 'DNA Matches', icon: 'FaDna', description: 'Analyze DNA match data and discover relationships', color: '#ec4899' },
  { path: 'census-records', table: 'census_records', name: 'Census Records', icon: 'FaFileAlt', description: 'Browse and analyze census records', color: '#8b5cf6' },
  { path: 'immigration-records', table: 'immigration_records', name: 'Immigration Records', icon: 'FaGlobeAmericas', description: 'Track immigration and naturalization records', color: '#06b6d4' },
  { path: 'birth-death-records', table: 'birth_death_records', name: 'Birth & Death Records', icon: 'FaBaby', description: 'Manage vital records - births and deaths', color: '#14b8a6' },
  { path: 'marriage-records', table: 'marriage_records', name: 'Marriage Records', icon: 'FaHeart', description: 'Track marriage records and ceremonies', color: '#f43f5e' },
  { path: 'military-records', table: 'military_records', name: 'Military Records', icon: 'FaMedal', description: 'Research military service records', color: '#78716c' },
  { path: 'newspaper-archives', table: 'newspaper_archives', name: 'Newspaper Archives', icon: 'FaNewspaper', description: 'Search historical newspaper archives', color: '#a3a3a3' },
  { path: 'land-records', table: 'land_records', name: 'Land & Property Records', icon: 'FaLandmark', description: 'Research property and land deed records', color: '#d97706' },
  { path: 'church-records', table: 'church_records', name: 'Church Records', icon: 'FaChurch', description: 'Browse religious and parish records', color: '#7c3aed' },
  { path: 'ship-manifests', table: 'ship_manifests', name: 'Ship Manifests', icon: 'FaShip', description: 'Search passenger ship manifests', color: '#0284c7' },
  { path: 'documents', table: 'documents', name: 'Documents', icon: 'FaFileInvoice', description: 'Manage genealogy documents and files', color: '#64748b' },
  { path: 'research-notes', table: 'research_notes', name: 'Research Notes', icon: 'FaStickyNote', description: 'Keep track of your research notes', color: '#eab308' },
  { path: 'source-citations', table: 'source_citations', name: 'Source Citations', icon: 'FaQuoteRight', description: 'Manage source citations and references', color: '#84cc16' },
];

const aiOnlyFeatures = [
  { path: 'ethnicity-estimation', name: 'Ethnicity Estimation', icon: 'FaBrain', description: 'AI-powered ethnic origin estimation', color: '#6c63ff' },
  { path: 'name-origin', name: 'Name Origin Analysis', icon: 'FaFont', description: 'Discover the origin and meaning of names', color: '#00d4aa' },
  { path: 'timeline-generator', name: 'Timeline Generator', icon: 'FaClock', description: 'Generate life timelines from records', color: '#f59e0b' },
  { path: 'relationship-graph', name: 'Relationship Graph', icon: 'FaUsers', description: 'Visualize and manage person relationships', color: '#ec4899' },
  { path: 'ai-advanced', name: 'AI Advanced (Conflict / Roadmap)', icon: 'FaBalanceScale', description: 'Conflict resolution + research roadmap', color: '#a855f7' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Fetch counts for each table (paginated response)
    features.forEach(async (f) => {
      try {
        const data = await getAll(f.table, 1, 1);
        const count = data && data.pagination ? data.pagination.total : (Array.isArray(data) ? data.length : 0);
        setCounts((prev) => ({ ...prev, [f.table]: count }));
      } catch {
        setCounts((prev) => ({ ...prev, [f.table]: 0 }));
      }
    });
  }, [navigate]);

  const renderCard = (feature, isAI = false) => {
    const IconComponent = iconMap[feature.icon];
    const count = counts[feature.table];

    return (
      <div
        key={feature.path}
        style={styles.card}
        className="dashboard-card"
        onClick={() => navigate(`/${feature.path}`)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = feature.color;
          e.currentTarget.style.boxShadow = `0 8px 30px ${feature.color}20, 0 0 20px ${feature.color}10`;
          e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#2a2e45';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {isAI && <div style={styles.aiBadge}>AI</div>}
        <div style={{ ...styles.iconCircle, background: `${feature.color}15` }}>
          {IconComponent && <IconComponent style={{ ...styles.icon, color: feature.color }} />}
        </div>
        <h3 style={styles.cardTitle}>{feature.name}</h3>
        <p style={styles.cardDesc}>{feature.description}</p>
        {count !== undefined && !isAI && (
          <div style={styles.countBadge}>
            {count} record{count !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Dashboard</h1>
          <p style={styles.headerSubtitle}>
            Explore your genealogy research with AI-powered tools
          </p>
        </div>

        <h2 style={styles.sectionTitle}>Research Collections</h2>
        <div style={styles.grid}>
          {features.map((f) => renderCard(f))}
        </div>

        <h2 style={{ ...styles.sectionTitle, marginTop: '48px' }}>
          <FaBrain style={{ color: '#6c63ff', marginRight: '10px' }} />
          AI-Powered Analysis
        </h2>
        <div style={styles.grid}>
          {aiOnlyFeatures.map((f) => renderCard(f, true))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f1117',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 24px 60px',
  },
  header: {
    marginBottom: '40px',
  },
  headerTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#e4e4e7',
    letterSpacing: '-0.5px',
  },
  headerSubtitle: {
    color: '#71717a',
    fontSize: '1rem',
    marginTop: '6px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    position: 'relative',
    background: '#1a1d2e',
    border: '1px solid #2a2e45',
    borderRadius: '16px',
    padding: '28px 24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
  },
  aiBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '3px 10px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  iconCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  icon: {
    fontSize: '1.3rem',
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#e4e4e7',
    marginBottom: '6px',
  },
  cardDesc: {
    fontSize: '0.8rem',
    color: '#71717a',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  countBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: 'rgba(108, 99, 255, 0.1)',
    borderRadius: '20px',
    fontSize: '0.75rem',
    color: '#a1a1aa',
    fontWeight: '600',
  },
};

export default Dashboard;
