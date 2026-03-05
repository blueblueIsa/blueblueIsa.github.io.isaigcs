import React from 'react';

/**
 * Parses review content to extract MS Keywords and description
 * Format: "Description\nMS Keywords: keyword1, keyword2, keyword3"
 */
export const parseReviewContent = (content: string) => {
  const lines = content.split('\n');
  let description = '';
  let msKeywords: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith('MS Keywords:')) {
      const keywordStr = line.replace(/MS Keywords:\s*/i, '').trim();
      msKeywords = keywordStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
    } else if (line.trim()) {
      if (description) description += '\n' + line;
      else description = line;
    }
  }

  return { description, msKeywords };
};

interface ReviewContentProps {
  content?: string;
}

export const ReviewContent: React.FC<ReviewContentProps> = ({ content = '' }) => {
  if (!content) return null;
  const { description, msKeywords } = parseReviewContent(content);

  return (
    <div>
      <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 14px 0', color: 'var(--text)', lineHeight: '1.6', fontSize: '14px' }}>{description}</p>
      {msKeywords.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(148,163,184,0.2)' }}>
          <div style={{
            fontSize: '15px',
            color: '#fbbf24',
            textTransform: 'uppercase',
            marginBottom: 10,
            fontWeight: '700',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🔑 MS Keywords
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {msKeywords.map((keyword, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(59,130,246,0.12)',
                  color: '#3b82f6',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: '600',
                  border: '1px solid rgba(59,130,246,0.2)',
                  display: 'inline-block'
                }}
              >
                • {keyword}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewContent;
