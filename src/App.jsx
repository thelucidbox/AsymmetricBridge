import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CommandCenter from './components/CommandCenter';
import SourceMaterials from './components/SourceMaterials';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div
          style={{
            minHeight: '100vh',
            background: '#0D0D0F',
            color: '#E8E4DF',
            fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
          }}
        >
          <nav
            style={{
              padding: '12px 14px',
              maxWidth: 920,
              margin: '0 auto',
              display: 'flex',
              gap: 8,
            }}
          >
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#E8E4DF' : 'rgba(255,255,255,0.35)',
                background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                border:
                  '1px solid ' +
                  (isActive ? 'rgba(255,255,255,0.1)' : 'transparent'),
                borderRadius: 7,
                textDecoration: 'none',
                transition: 'all 0.2s',
              })}
            >
              Command Center
            </NavLink>
            <NavLink
              to="/sources"
              style={({ isActive }) => ({
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#E8E4DF' : 'rgba(255,255,255,0.35)',
                background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                border:
                  '1px solid ' +
                  (isActive ? 'rgba(255,255,255,0.1)' : 'transparent'),
                borderRadius: 7,
                textDecoration: 'none',
                transition: 'all 0.2s',
              })}
            >
              Source Materials
            </NavLink>
          </nav>
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/sources" element={<SourceMaterials />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
