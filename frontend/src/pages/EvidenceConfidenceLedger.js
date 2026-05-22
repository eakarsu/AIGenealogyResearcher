import React, { useEffect, useState } from 'react';

export default function EvidenceConfidenceLedger() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/evidence-confidence-ledger').then((r) => r.json()).then(setData).catch(() => {});
  }, []);
  return (
    <div style={{ padding: 24 }}>
      <h1>Evidence Confidence Ledger</h1>
      <p>Scores citations by source class, directness, informant quality, and conflict state.</p>
      {data?.entries?.map((entry) => (
        <div key={entry.title} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 12 }}>
          <h3>{entry.title}</h3>
          <p>{entry.status} - {entry.confidence_score}</p>
          <p>{entry.source_type} - {entry.directness}</p>
        </div>
      ))}
    </div>
  );
}
