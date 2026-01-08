import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { QAItemDraft, AuditLogEntry, QAStatus } from '../../types';

const statuses: QAStatus[] = ['draft', 'pending_review', 'approved', 'rejected', 'published'];

function djb2(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export const ManagePanel: React.FC = () => {
  const [drafts, setDrafts] = useState<QAItemDraft[]>(() => {
    const d = localStorage.getItem('qa_drafts');
    return d ? JSON.parse(d) : [];
  });
  const [actor, setActor] = useState<string>('admin');
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => {
    const l = localStorage.getItem('audit_logs');
    return l ? JSON.parse(l) : [];
  });
  const [filter, setFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<QAStatus | ''>('');
  const [idSeq, setIdSeq] = useState<number>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string>('');
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem('qa_drafts', JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    localStorage.setItem('audit_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (action: string, details: Record<string, unknown>) => {
    const entry: AuditLogEntry = {
      id: `log-${idSeq}`,
      actor,
      action,
      timestamp: idSeq,
      details
    };
    setLogs(prev => [entry, ...prev]);
    setIdSeq(s => s + 1);
  };

  const newDraft = (): QAItemDraft => ({
    id: `draft-${idSeq}`,
    question: '',
    answer: '',
    paper: '',
    topic: '',
    tags: [],
    marks: undefined,
    keywords: [],
    status: 'draft',
    createdAt: idSeq,
    updatedAt: idSeq,
    hash: '',
    version: 1
  });

  const saveDraft = (item: QAItemDraft) => {
    const payload = JSON.stringify({
      q: item.question, a: item.answer, p: item.paper, t: item.topic,
      tags: item.tags, marks: item.marks, keywords: item.keywords
    });
    const hash = djb2(payload);
    const withHash = { ...item, hash, updatedAt: idSeq };
    setDrafts(prev => {
      const exists = prev.find(d => d.id === item.id);
      if (exists) {
        return prev.map(d => d.id === item.id ? withHash : d);
      }
      return [withHash, ...prev];
    });
    addLog('save_draft', { id: item.id, hash });
  };

  const updateStatus = (id: string, status: QAStatus) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    addLog('update_status', { id, status });
  };

  const filtered = useMemo(() => {
    return drafts.filter(d => {
      const hit = !filter || d.question.toLowerCase().includes(filter.toLowerCase()) || d.paper.toLowerCase().includes(filter.toLowerCase());
      const sh = !statusFilter || d.status === statusFilter;
      return hit && sh;
    });
  }, [drafts, filter, statusFilter]);
 
  const tree = useMemo(() => {
    const byPaper: Record<string, Record<string, QAItemDraft[]>> = {};
    for (const d of filtered) {
      const p = d.paper || 'Unassigned';
      const t = d.topic || 'General';
      if (!byPaper[p]) byPaper[p] = {};
      if (!byPaper[p][t]) byPaper[p][t] = [];
      byPaper[p][t].push(d);
    }
    return byPaper;
  }, [filtered]);
 
  const selected = useMemo(() => drafts.find(d => d.id === selectedId) || null, [drafts, selectedId]);
 
  const exec = (cmd: string) => {
    if (editorRef.current) {
      document.execCommand(cmd);
      setSuggestion(editorRef.current.innerHTML);
    }
  };
 
  const sendSuggestion = () => {
    if (!selected) return;
    const ts = new Date().toISOString();
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const subject = `[Suggestion] ${selected.paper || 'Unspecified'} · ${selected.topic || 'Unspecified'} · ${selected.id}`;
    const bodyLines = [
      `Question ID: ${selected.id}`,
      `Paper: ${selected.paper || ''}`,
      `Topic: ${selected.topic || ''}`,
      `Suggestion:`,
      `${suggestion || ''}`,
      ``,
      `Submitted at: ${ts}`,
      `User: ${actor}`,
      `Client: ${ua}`,
      `Hash: ${selected.hash.slice(0,8)}`
    ];
    const mailto = [
      'mailto:isabella.sun@ulink.cn',
      `?subject=${encodeURIComponent(subject)}`,
      `&body=${encodeURIComponent(bodyLines.join('\n'))}`
    ].join('');
    addLog('send_suggestion', { id: selected.id, ts, actor, suggestionLength: (suggestion || '').length });
    window.location.href = mailto;
  };

  return (
    <div className="content">
      <div className="content-header">
        <div className="header-main">
          <h1>Question Management</h1>
          <p className="muted">Add, edit, review, and publish Q&A entries.</p>
        </div>
        <div className="filters">
          <input placeholder="Actor" value={actor} onChange={e => setActor(e.target.value)} />
          <input placeholder="Search..." value={filter} onChange={e => setFilter(e.target.value)} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as QAStatus | '')}>
            <option value="">All statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="confusions-toggle" onClick={() => setDrafts([newDraft(), ...drafts])}>
            New Question
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <div className="term-card" style={{ padding: 0 }}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Question Tree</div>
          <div style={{ maxHeight: 520, overflow: 'auto' }}>
            {Object.keys(tree).length === 0 && (
              <div className="muted" style={{ padding: 12 }}>No data</div>
            )}
            {Object.entries(tree).map(([paper, byTopic]) => (
              <div key={paper}>
                <div style={{ padding: '8px 12px', fontWeight: 600 }}>{paper}</div>
                {Object.entries(byTopic).map(([topic, items]) => (
                  <div key={topic} style={{ paddingLeft: 12 }}>
                    <div style={{ padding: '6px 12px', color: 'var(--muted)' }}>{topic} · {items.length}</div>
                    {items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => { setSelectedId(item.id); setSuggestion(''); if (editorRef.current) editorRef.current.innerHTML = ''; }}
                        className={`unit-item ${selectedId === item.id ? 'active' : ''}`}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 16px', border: 'none', background: 'transparent' }}
                      >
                        {item.question ? item.question.slice(0, 40) : '(No question text)'}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          {selected ? (
            <div className="term-card" style={{ gridColumn: '1/-1' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value as QAStatus)}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="chip">{selected.version}</span>
                <span className="chip">{selected.hash.slice(0, 8)}</span>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                <input placeholder="Paper code (e.g., S24P12)" value={selected.paper} onChange={e => saveDraft({ ...selected, paper: e.target.value })} />
                <input placeholder="Topic" value={selected.topic} onChange={e => saveDraft({ ...selected, topic: e.target.value })} />
                <textarea placeholder="Question" value={selected.question} onChange={e => saveDraft({ ...selected, question: e.target.value })} rows={3} />
                <textarea placeholder="Answer (MS exact)" value={selected.answer} onChange={e => saveDraft({ ...selected, answer: e.target.value })} rows={6} />
                <input placeholder="Marks" type="number" value={selected.marks ?? ''} onChange={e => saveDraft({ ...selected, marks: Number(e.target.value) || undefined })} />
                <input placeholder="Tags (comma)" value={(selected.tags || []).join(',')} onChange={e => saveDraft({ ...selected, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                <input placeholder="Keywords (comma)" value={(selected.keywords || []).join(',')} onChange={e => saveDraft({ ...selected, keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button className="confusions-toggle" onClick={() => exec('bold')}>Bold</button>
                  <button className="confusions-toggle" onClick={() => exec('italic')}>Italic</button>
                  <button className="confusions-toggle" onClick={() => exec('insertUnorderedList')}>Bulleted List</button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  style={{ minHeight: 120, padding: 10, border: '1px solid var(--border)', borderRadius: 8 }}
                  onInput={e => setSuggestion((e.target as HTMLDivElement).innerHTML)}
                  aria-label="Suggestion Editor"
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="sidebar-toggle" onClick={sendSuggestion}>Send Suggestion</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="term-card" style={{ padding: 16 }}>
              <div className="muted">Select a question on the left to edit and send a suggestion</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Audit Logs</h2>
        <div className="terms">
          {logs.map(l => (
            <div key={l.id} className="term-card" style={{ gridColumn: 'span 1' }}>
              <div style={{ fontWeight: 600 }}>{l.action}</div>
              <div className="muted">{new Date(l.timestamp).toLocaleString()} · {l.actor}</div>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(l.details, null, 2)}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
