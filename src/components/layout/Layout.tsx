import { useState } from 'react';
import { VISITS_ENABLED } from '../../config/featureFlags';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { VisitStats } from './VisitStats';
import { Menu } from 'lucide-react';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          {VISITS_ENABLED && <VisitStats />}
        </div>
        <Outlet />
      </main>
    </div>
  );
};
