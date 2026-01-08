import { useState, useEffect } from 'react';
import { VISITS_ENABLED } from '../../config/featureFlags';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Hooks kept unconditionally; feature gate controls side effects and rendering
  const [visitsToday, setVisitsToday] = useState<number | null>(null);
  const [visitsStats, setVisitsStats] = useState<any | null>(null);
  const [showVisitsDetails, setShowVisitsDetails] = useState(false);

  useEffect(() => {
    if (!VISITS_ENABLED) return;
    import('../../utils/visits').then(({ incrementVisitsToday, getVisitsStats }) => {
      try {
        const n = incrementVisitsToday();
        setVisitsToday(n || null);
        const stats = getVisitsStats();
        setVisitsStats(stats);
      } catch {
        setVisitsToday(null);
        setVisitsStats(null);
      }
    }).catch(() => { setVisitsToday(null); setVisitsStats(null); });
  }, []);

  return (
    <div className="app tech-theme">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
          <button 
            className="sidebar-toggle" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ marginBottom: '0' }}
          >
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }} />
          {VISITS_ENABLED && (
            <div className="chip visits-chip" title="Visits statistics" style={{ position: 'relative' }}>
              <button aria-expanded={showVisitsDetails} aria-controls="visits-pop" aria-label={`Visits: ${visitsToday ?? '—'}`} onClick={() => setShowVisitsDetails(s => !s)} style={{ background: 'transparent', border: 0, color: 'inherit', cursor: 'pointer' }}>
                <strong style={{ marginLeft: 6 }}>{visitsToday ?? '—'}</strong>
              </button>

              {showVisitsDetails && visitsStats && (
                <div id="visits-pop" className="visits-pop" role="dialog" aria-label="Visits statistics" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', padding: 12, borderRadius: 8, minWidth: 220, zIndex: 40 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Yesterday</div>
                    <div style={{ fontWeight: 700 }}>{visitsStats.yesterday}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Today</div>
                    <div style={{ fontWeight: 700 }}>{visitsStats.today}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>This week</div>
                    <div style={{ fontWeight: 700 }}>{visitsStats.weekTotal}</div>
                  </div>

                  <div className="visits-spark" style={{ display: 'flex', gap: 6, alignItems: 'end', height: 40 }}>
                    {Array.isArray(visitsStats.week) && visitsStats.week.map((d: any, i: number) => {
                      const max = Math.max(...visitsStats.week.map((w: any) => w.count), 1);
                      const h = Math.round((d.count / max) * 36) || 2;
                      return (
                        <div
                          key={i}
                          className="spark-item"
                          role="img"
                          aria-label={`${d.day}: ${d.count}`}
                          title={`${d.day}: ${d.count}`}
                          style={{ width: 12, height: h, background: 'linear-gradient(180deg,var(--accent-2),var(--accent))', borderRadius: 4 }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <button 
          className="sidebar-toggle" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ marginBottom: '16px' }}
        >
          <Menu size={20} />
        </button>
        <Outlet />
      </main>
    </div>
  );
};
