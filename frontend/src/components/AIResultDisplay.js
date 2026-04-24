import React from 'react';
import { FaBrain, FaClock } from 'react-icons/fa';

const AIResultDisplay = ({ result, timestamp }) => {
  if (!result) return null;

  const parseContent = (text) => {
    if (typeof text !== 'string') {
      // If it's an object, try to extract meaningful content
      if (text && typeof text === 'object') {
        if (text.result) return parseContent(text.result);
        if (text.analysis) return parseContent(text.analysis);
        if (text.response) return parseContent(text.response);
        if (text.data) return parseContent(text.data);
        if (text.message) return parseContent(text.message);
        // Fallback: stringify nicely
        return formatObjectAsHtml(text);
      }
      return `<p>${String(text)}</p>`;
    }

    let html = text;

    // Convert markdown headers
    html = html.replace(/^### (.+)$/gm, '<h4 class="ai-h4">$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3 class="ai-h3">$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2 class="ai-h2">$1</h2>');

    // Convert bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Convert bullet points
    html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> tags in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul class="ai-list">$1</ul>');

    // Convert numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ai-numbered">$1</li>');

    // Convert line breaks to paragraphs (but not within lists)
    const parts = html.split('\n\n');
    html = parts
      .map((part) => {
        if (
          part.trim().startsWith('<h') ||
          part.trim().startsWith('<ul') ||
          part.trim().startsWith('<li') ||
          part.trim() === ''
        ) {
          return part;
        }
        return `<p>${part.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('');

    return html;
  };

  const formatObjectAsHtml = (obj) => {
    let html = '<div class="ai-object">';
    for (const [key, value] of Object.entries(obj)) {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      if (Array.isArray(value)) {
        html += `<h4 class="ai-h4">${label}</h4><ul class="ai-list">`;
        value.forEach((item) => {
          if (typeof item === 'object') {
            html += `<li>${JSON.stringify(item, null, 2)}</li>`;
          } else {
            html += `<li>${item}</li>`;
          }
        });
        html += '</ul>';
      } else if (typeof value === 'object' && value !== null) {
        html += `<h4 class="ai-h4">${label}</h4>`;
        html += formatObjectAsHtml(value);
      } else {
        html += `<p><strong>${label}:</strong> ${value}</p>`;
      }
    }
    html += '</div>';
    return html;
  };

  const content = parseContent(result);

  return (
    <div style={styles.wrapper} className="animate-fade-in-up">
      <div style={styles.card}>
        <div style={styles.gradientBorder} />
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <FaBrain style={styles.icon} />
            <span style={styles.headerText}>AI Analysis Result</span>
          </div>
          {timestamp && (
            <div style={styles.timestamp}>
              <FaClock style={{ fontSize: '0.7rem' }} />
              <span>{new Date(timestamp).toLocaleString()}</span>
            </div>
          )}
        </div>
        <div
          style={styles.content}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      <style>{cssStyles}</style>
    </div>
  );
};

const cssStyles = `
  .ai-h2 {
    color: #6c63ff;
    font-size: 1.2rem;
    margin: 20px 0 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #2a2e45;
  }
  .ai-h3 {
    color: #00d4aa;
    font-size: 1.05rem;
    margin: 16px 0 8px;
  }
  .ai-h4 {
    color: #a78bfa;
    font-size: 0.95rem;
    margin: 14px 0 6px;
    font-weight: 600;
  }
  .ai-list {
    list-style: none;
    padding: 0;
    margin: 8px 0 16px;
  }
  .ai-list li {
    position: relative;
    padding: 6px 0 6px 20px;
    color: #e4e4e7;
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .ai-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 14px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6c63ff, #00d4aa);
  }
  .ai-numbered {
    counter-increment: ai-counter;
  }
  .ai-numbered::before {
    content: counter(ai-counter) '.' !important;
    position: absolute;
    left: 0;
    top: 6px;
    width: auto !important;
    height: auto !important;
    border-radius: 0 !important;
    background: none !important;
    color: #6c63ff;
    font-weight: 700;
    font-size: 0.85rem;
  }
  .ai-object p {
    margin: 4px 0;
  }
  .ai-object p strong {
    color: #a1a1aa;
  }
`;

const styles = {
  wrapper: {
    marginTop: '24px',
  },
  card: {
    position: 'relative',
    background: '#1a1d2e',
    borderRadius: '16px',
    padding: '28px',
    overflow: 'hidden',
  },
  gradientBorder: {
    position: 'absolute',
    inset: 0,
    borderRadius: '16px',
    padding: '1px',
    background: 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 50%, #6c63ff 100%)',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 4s ease infinite',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #2a2e45',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  icon: {
    color: '#6c63ff',
    fontSize: '1.2rem',
  },
  headerText: {
    fontSize: '1rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  timestamp: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: '#71717a',
  },
  content: {
    fontSize: '0.9rem',
    lineHeight: '1.7',
    color: '#e4e4e7',
    counterReset: 'ai-counter',
  },
};

export default AIResultDisplay;
