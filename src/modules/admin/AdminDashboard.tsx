import React, { useState, useMemo } from 'react';
import { Download, Trash2, RefreshCw, TrendingUp, Users, Activity, Calendar } from 'lucide-react';
import {
  getStatsForDateRange,
  getAllTrackedPages,
  getPageStats,
  exportStatsAsCSV,
  exportStatsAsJSON,
  getStatsSummary,
  clearOldStats
} from '../../utils/analytics';
import { format, subDays } from 'date-fns';

type DateRange = '7d' | '30d' | '90d' | 'custom';

export const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const allPages = useMemo(() => getAllTrackedPages(), [refreshKey]);

  const getDateRange = (): [string, string] => {
    const today = new Date();
    let start: Date;

    switch (dateRange) {
      case '7d':
        start = subDays(today, 6);
        break;
      case '30d':
        start = subDays(today, 29);
        break;
      case '90d':
        start = subDays(today, 89);
        break;
      case 'custom':
        if (!customStart || !customEnd) {
          start = subDays(today, 6);
          break;
        }
        return [customStart, customEnd];
      default:
        start = subDays(today, 6);
    }

    return [
      start.toISOString().slice(0, 10),
      today.toISOString().slice(0, 10)
    ];
  };

  const [startDate, endDate] = getDateRange();
  const stats = useMemo(
    () => getStatsForDateRange(startDate, endDate),
    [startDate, endDate, refreshKey]
  );

  const summary = useMemo(
    () => getStatsSummary(
      Math.min(7,
        Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      )
    ),
    [startDate, endDate, refreshKey]
  );

  const pageStats = useMemo(
    () => selectedPage ? getPageStats(selectedPage) : [],
    [selectedPage, refreshKey]
  );

  const totalVisits = stats.reduce((sum, s) => sum + s.total, 0);
  const totalSessions = stats.reduce((sum, s) => sum + s.sessions, 0);

  const handleExportJSON = () => {
    const data = exportStatsAsJSON(startDate, endDate);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `stats-${startDate}-to-${endDate}.json`);
  };

  const handleExportCSV = () => {
    const csv = exportStatsAsCSV(startDate, endDate);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `stats-${startDate}-to-${endDate}.csv`);
  };

  const handleClearOldStats = () => {
    if (window.confirm('Clear statistics older than 90 days? This action cannot be undone.')) {
      const cleared = clearOldStats(90);
      alert(`Cleared ${cleared} old statistics entries.`);
      setRefreshKey(k => k + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="admin-dashboard">
      {/* Summary Cards */}
      <div className="admin-summary-cards">
        <SummaryCard
          icon={<TrendingUp size={24} />}
          title="Total Visits"
          value={totalVisits}
          subtitle={`in ${stats.length} days`}
          color="blue"
        />
        <SummaryCard
          icon={<Users size={24} />}
          title="Sessions"
          value={totalSessions}
          subtitle={`avg ${(totalVisits / (stats.length || 1)).toFixed(1)}/day`}
          color="green"
        />
        <SummaryCard
          icon={<Activity size={24} />}
          title="Pages Tracked"
          value={allPages.length}
          subtitle={`active pages`}
          color="purple"
        />
        <SummaryCard
          icon={<Calendar size={24} />}
          title="Date Range"
          value={`${startDate} → ${endDate}`}
          subtitle={`${stats.length} days`}
          color="orange"
        />
      </div>

      {/* Controls */}
      <div className="admin-controls">
        <div className="admin-date-range">
          <label>Date Range:</label>
          <div className="admin-range-buttons">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`admin-range-btn ${dateRange === range ? 'active' : ''}`}
              >
                {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </button>
            ))}
            <button
              onClick={() => setDateRange('custom')}
              className={`admin-range-btn ${dateRange === 'custom' ? 'active' : ''}`}
            >
              Custom
            </button>
          </div>

          {dateRange === 'custom' && (
            <div className="admin-custom-dates">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                placeholder="Start date"
              />
              <span>→</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                placeholder="End date"
              />
            </div>
          )}
        </div>

        <div className="admin-actions">
          <button onClick={handleRefresh} className="admin-action-btn" title="Refresh data">
            <RefreshCw size={18} />
            Refresh
          </button>
          <button onClick={handleExportJSON} className="admin-action-btn" title="Export as JSON">
            <Download size={18} />
            JSON
          </button>
          <button onClick={handleExportCSV} className="admin-action-btn" title="Export as CSV">
            <Download size={18} />
            CSV
          </button>
          <button onClick={handleClearOldStats} className="admin-action-btn danger" title="Clear old data">
            <Trash2 size={18} />
            Clear Old
          </button>
        </div>
      </div>

      {/* Statistics Table */}
      <div className="admin-stats-section">
        <h2>Daily Statistics</h2>
        <div className="admin-table-container">
          <table className="admin-stats-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Visits</th>
                <th>Sessions</th>
                <th>Top Pages</th>
              </tr>
            </thead>
            <tbody>
              {stats.length > 0 ? (
                stats.map((stat) => (
                  <tr key={stat.date}>
                    <td className="admin-date-cell">
                      <span>{format(new Date(stat.date), 'MMM dd, yyyy')}</span>
                      <span className="admin-date-secondary">{stat.date}</span>
                    </td>
                    <td className="admin-number-cell">{stat.total}</td>
                    <td className="admin-number-cell">{stat.sessions}</td>
                    <td className="admin-pages-cell">
                      {Object.entries(stat.pages)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([page, count]) => (
                          <span key={page} className="admin-page-badge">
                            {page}: {count}
                          </span>
                        ))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="admin-empty-state">
                    No statistics data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Page Selection */}
      <div className="admin-page-filter">
        <h2>Page Analysis</h2>
        <div className="admin-page-selector">
          <label>Select Page:</label>
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="admin-page-select"
          >
            <option value="">-- All Pages --</option>
            {allPages.map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
        </div>

        {selectedPage && pageStats.length > 0 && (
          <div className="admin-page-stats">
            <h3>{selectedPage} - Last 30 days</h3>
            <div className="admin-mini-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {pageStats.map((stat) => (
                    <tr key={stat.date}>
                      <td>{format(new Date(stat.date), 'MMM dd')}</td>
                      <td className="admin-number-cell">{stat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Top Pages Summary */}
      {summary.topPages.length > 0 && (
        <div className="admin-top-pages">
          <h2>Top Pages</h2>
          <div className="admin-pages-list">
            {summary.topPages.map(([page, count], index) => (
              <div key={page} className="admin-page-item">
                <span className="admin-page-rank">#{index + 1}</span>
                <span className="admin-page-name">{page}</span>
                <span className="admin-page-count">{count} visits</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  color
}) => (
  <div className={`admin-summary-card admin-summary-${color}`}>
    <div className="admin-card-icon">{icon}</div>
    <div className="admin-card-content">
      <h3>{title}</h3>
      <p className="admin-card-value">{value}</p>
      <p className="admin-card-subtitle">{subtitle}</p>
    </div>
  </div>
);

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
