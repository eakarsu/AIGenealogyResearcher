import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AppSidebar.css';

const STATIC_LINKS = [
  { to: '/insights/timeline', label: 'Timeline View', group: 'Insights' },
  { to: '/codex/custom-viz', label: 'Custom Viz', group: 'Insights' },
  { to: '/codex/operations', label: 'Operations', group: 'Insights' },
  { to: '/dashboard', label: 'Dashboard', group: 'Workspace' },
  { to: '/ethnicity-estimation', label: 'AI Only', group: 'Workspace' },
  { to: '/name-origin', label: 'AI Only', group: 'Workspace' },
  { to: '/timeline-generator', label: 'AI Only', group: 'Workspace' },
  { to: '/ai-advanced', label: 'AI Advanced', group: 'AI tools' },
  { to: '/relationship-graph', label: 'Relationship Graph', group: 'Workspace' },
  { to: '/documents-and-plan', label: 'Documents And Plan', group: 'Workspace' },
  { to: '/cf-agentic-researcher-autonomy-conducting-g', label: 'Cf Agentic Researcher Autonomy Conducting G', group: 'Workspace' },
  { to: '/cf-multi-evidence-fusion-weighing-conflicti', label: 'Cf Multi Evidence Fusion Weighing Conflicti', group: 'Workspace' },
  { to: '/cf-dna-document-fusion-linking-matches-to', label: 'Cf Dna Document Fusion Linking Matches To', group: 'Workspace' },
  { to: '/cf-tiered-privacy-with-ai-redaction-when', label: 'Cf Tiered Privacy With Ai Redaction When', group: 'Workspace' },
  { to: '/cf-paywall-expert-genealogist-review-market', label: 'Cf Paywall Expert Genealogist Review Market', group: 'Workspace' },
  { to: '/cf-international-archives-expansion-uk-cana', label: 'Cf International Archives Expansion Uk Cana', group: 'Workspace' },
  { to: '/gap-no-conflict-resolution-endpoint-for-disa', label: 'Gap No Conflict Resolution Endpoint For Disa', group: 'Workspace' },
  { to: '/gap-no-research-roadmap-recommender-for-next', label: 'Gap No Research Roadmap Recommender For Next', group: 'Workspace' },
  { to: '/gap-no-record-source-citation-generator', label: 'Gap No Record Source Citation Generator', group: 'Workspace' },
  { to: '/gap-no-family-tree-visualization-ui-module', label: 'Gap No Family Tree Visualization Ui Module', group: 'Workspace' },
  { to: '/gap-no-real-time-collaboration-on-shared', label: 'Gap No Real Time Collaboration On Shared', group: 'Workspace' },
  { to: '/gap-no-expert-review-workflow-professional-g', label: 'Gap No Expert Review Workflow Professional G', group: 'Workspace' },
  { to: '/gap-no-audit-log-0-references-found', label: 'Gap No Audit Log0 References Found', group: 'Workspace' },
  { to: '/gap-no-notification-engine-0-references', label: 'Gap No Notification Engine0 References', group: 'Workspace' },
  { to: '/gap-limited-support-for-non-us-archives', label: 'Gap Limited Support For Non Us Archives', group: 'Workspace' },
  { to: '/custom-views', label: 'Custom Views', group: 'Workspace' },
  { to: '/evidence-confidence-ledger', label: 'Evidence Confidence Ledger', group: 'Workspace' },
];

export default function AppSidebar({ extraLinks = [] }) {
  const LINKS = [...STATIC_LINKS, ...extraLinks];
  const [query, setQuery] = useState('');
  const visible = LINKS.filter(link => link.label.toLowerCase().includes(query.toLowerCase().trim()));
  return <aside className="codex-side" aria-label="Application navigation">
    <div className="codex-side-brand"><strong>AIGenealogy Researcher</strong><span>Workspace</span></div>
    <label className="codex-side-search-label" htmlFor="codex-side-search">Find a section</label>
    <input id="codex-side-search" className="codex-side-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search navigation" />
    <nav className="codex-side-links" aria-label="Sections">
      {['Workspace', 'AI tools', 'Insights'].map(group => {
        const items = visible.filter(link => link.group === group);
        return items.length ? <div className="codex-side-group" key={group}>
          <span className="codex-side-heading">{group}</span>
          {items.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `codex-side-link${isActive ? ' active' : ''}`}>{link.label}</NavLink>)}
        </div> : null;
      })}
      {visible.length === 0 && <p className="codex-side-empty">No matching sections</p>}
    </nav>
  </aside>;
}
