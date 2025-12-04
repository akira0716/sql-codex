import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Database, Plus, Search, Settings } from 'lucide-react';

export const Layout: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Sidebar */}
            <nav style={{
                width: '64px',
                backgroundColor: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '1rem 0',
                gap: '1.5rem'
            }}>
                <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>
                    <Database size={28} />
                </div>

                <Link to="/" style={{
                    color: isActive('/') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    backgroundColor: isActive('/') ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                }}>
                    <Search size={24} />
                </Link>

                <Link to="/new" style={{
                    color: isActive('/new') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    backgroundColor: isActive('/new') ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                }}>
                    <Plus size={24} />
                </Link>

                <div style={{ marginTop: 'auto' }}>
                    <Link to="/settings" style={{ color: 'var(--text-secondary)', padding: '0.5rem' }}>
                        <Settings size={24} />
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ flex: 1, overflow: 'auto', backgroundColor: 'var(--bg-primary)' }}>
                <Outlet />
            </main>
        </div>
    );
};
