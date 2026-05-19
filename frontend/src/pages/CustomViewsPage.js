import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import FamilyTreeView from '../components/FamilyTreeView';
import SourceCoverageHeatmap from '../components/SourceCoverageHeatmap';
import ResearchReportPanel from '../components/ResearchReportPanel';
import CitationRulesEditor from '../components/CitationRulesEditor';

const TABS = [
  { key: 'family-tree', label: 'Family Tree (VIZ)' },
  { key: 'coverage', label: 'Source Coverage Heatmap (VIZ)' },
  { key: 'report', label: 'Research Report (PDF)' },
  { key: 'rules', label: 'Citation Rules Editor' },
];

const CustomViewsPage = () => {
  const [tab, setTab] = useState('family-tree');

  return (
    <div style={S.page}>
      <Navbar title="Genealogy Views" showBack breadcrumb="Genealogy Views" />
      <div style={S.container} data-testid="custom-views-page">
        <h1 style={S.h1}>Genealogy Views</h1>
        <p style={S.sub}>
          Custom analytical views for genealogy research: family tree visualization, source
          coverage heatmap, research report PDF, and citation/source rule configuration.
        </p>

        <div style={S.tabs}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ ...S.tab, ...(tab === t.key ? S.tabActive : {}) }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={S.content}>
          {tab === 'family-tree' && <FamilyTreeView />}
          {tab === 'coverage' && <SourceCoverageHeatmap />}
          {tab === 'report' && <ResearchReportPanel />}
          {tab === 'rules' && <CitationRulesEditor />}
        </div>
      </div>
    </div>
  );
};

const S = {
  page: { background: '#0f1226', minHeight: '100vh' },
  container: { maxWidth: 1400, margin: '0 auto', padding: '24px' },
  h1: { color: '#e4e4e7', margin: '0 0 4px', fontSize: '1.6rem' },
  sub: { color: '#a1a1aa', marginBottom: 18, fontSize: '0.95rem' },
  tabs: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tab: { padding: '8px 14px', background: '#1a1d2e', color: '#a1a1aa', border: '1px solid #2a2e45', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  tabActive: { background: '#6c63ff', color: 'white', borderColor: '#6c63ff' },
  content: { marginTop: 8 },
};

export default CustomViewsPage;
