import React, { useState, useEffect } from 'react';
import { Users, Globe, Activity, BarChart3 } from 'lucide-react';
import { incrementVisitsToday, getCurrentVisitors, getAllPageVisits, updateSessionActivity } from '../../utils/visits.ts';

interface VisitStatsData {
  visitsToday: number;
  currentVisitors: number;
  pageVisits: Record<string, number>;
  ipAddress: string;
  loading: boolean;
}

export const VisitStats: React.FC = () => {
  const [stats, setStats] = useState<VisitStatsData>({
    visitsToday: 0,
    currentVisitors: 1,
    pageVisits: {},
    ipAddress: 'Loading...',
    loading: true
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Increment visit count on component mount
    incrementVisitsToday();
    
    const fetchStats = async () => {
      try {
        // Get today's visits from localStorage
        const today = new Date().toISOString().slice(0, 10);
        const visitsKey = `visits:${today}`;
        const visitsToday = Number(localStorage.getItem(visitsKey) || '0');
        
        // Get per-page visits
        const pageVisits = getAllPageVisits();
        
        // Get current visitors
        const currentVisitors = getCurrentVisitors();

        // Fetch user's IP address
        let ipAddress = 'Unknown';
        try {
          const response = await fetch('https://api.ipify.org?format=json', {
            headers: { 'Accept': 'application/json' }
          });
          if (response.ok) {
            const data = await response.json();
            ipAddress = data.ip;
          }
        } catch (error) {
          // Fallback to alternative IP service
          try {
            const response = await fetch('https://checkip.amazonaws.com/');
            ipAddress = (await response.text()).trim();
          } catch {
            ipAddress = 'N/A';
          }
        }

        setStats({
          visitsToday,
          currentVisitors,
          pageVisits,
          ipAddress,
          loading: false
        });
        
        // Update session activity
        updateSessionActivity();
      } catch (error) {
        console.error('Failed to fetch visit stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          ipAddress: 'Error'
        }));
      }
    };

    fetchStats();
    // Refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="visit-stats-container" style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="visit-stats-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          color: 'var(--text)',
          transition: 'all 0.2s ease',
          fontFamily: 'monospace'
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
          (e.currentTarget as HTMLElement).style.color = 'white';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
          (e.currentTarget as HTMLElement).style.color = 'var(--text)';
        }}
      >
        <Activity size={16} />
        <span style={{ fontWeight: 600 }}>{stats.visitsToday}</span>
      </button>

      {showDetails && (
        <div
          className="visit-stats-popup"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '280px',
            zIndex: 50,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Daily Visits */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Today Visits</span>
            </div>
            <span
              style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#3b82f6',
                fontFamily: 'monospace'
              }}
            >
              {stats.visitsToday}
            </span>
          </div>

          {/* Online Users */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Current Visitors</span>
            </div>
            <span
              style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#10b981',
                fontFamily: 'monospace'
              }}
            >
              {stats.currentVisitors}
            </span>
          </div>

          {/* Page Visits */}
          {Object.keys(stats.pageVisits).length > 0 && (
            <div
              style={{
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <BarChart3 size={16} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '600' }}>Page Visits Today</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '24px' }}>
                {Object.entries(stats.pageVisits).map(([page, count]) => (
                  <div
                    key={page}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      color: 'var(--text)'
                    }}
                  >
                    <span style={{ color: 'var(--muted)' }}>{page}:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: '500', color: '#f59e0b' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IP Address */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}
              >
                Your IP
              </span>
            </div>
            <code
              style={{
                fontSize: '0.85rem',
                background: 'var(--background)',
                padding: '4px 8px',
                borderRadius: '4px',
                color: '#ef4444',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                textAlign: 'right',
                maxWidth: '150px'
              }}
            >
              {stats.loading ? 'Loading...' : stats.ipAddress}
            </code>
          </div>

          {/* Footer Info */}
          <div
            style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border)',
              fontSize: '0.75rem',
              color: 'var(--muted)',
              textAlign: 'center'
            }}
          >
            Updates every 5s
          </div>
        </div>
      )}
    </div>
  );
};
