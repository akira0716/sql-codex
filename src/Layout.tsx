import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Database, Plus, Search, Settings, User as UserIcon, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useUnsavedChanges } from './UnsavedChangesContext';

export const Layout: React.FC = () => {
    const location = useLocation();
    const { user, signOut, signInWithGoogle } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { checkNavigation } = useUnsavedChanges();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname === path;

    // Hide sidebar on mobile for new/edit pages only
    const isEditorPage = location.pathname === '/new' || location.pathname.startsWith('/edit');

    const handleSwitchAccount = async () => {
        // Sign out then sign in
        await signOut();
        await signInWithGoogle();
    };

    const handleNavClick = (e: React.MouseEvent, to: string) => {
        e.preventDefault();
        if (checkNavigation()) {
            navigate(to);
        }
    };

    return (
        <div style={{
            display: 'flex',
            height: '100svh',
            width: '100vw',
            overflow: 'hidden',
            paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
            {/* Sidebar */}
            <nav className={isEditorPage ? 'sidebar sidebar-hide-mobile' : 'sidebar'} style={{
                width: '64px',
                backgroundColor: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '1rem 0',
                gap: '1.5rem',
                zIndex: 50
            }}>
                <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>
                    <Database size={28} />
                </div>

                <a href="/" onClick={(e) => handleNavClick(e, '/')} style={{
                    color: isActive('/') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    backgroundColor: isActive('/') ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                }}>
                    <Search size={24} />
                </a>

                <a href="/new" onClick={(e) => handleNavClick(e, '/new')} style={{
                    color: isActive('/new') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    backgroundColor: isActive('/new') ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                }}>
                    <Plus size={24} />
                </a>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative' }}>

                    {/* User Profile / Menu */}
                    {user && (
                        <>
                            {/* Backdrop to close menu */}
                            {isMenuOpen && (
                                <div
                                    style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                                    onClick={() => setIsMenuOpen(false)}
                                />
                            )}

                            <div
                                style={{ position: 'relative', zIndex: 91 }}
                            >
                                <div
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: isActive('/settings') ? '2px solid var(--accent-primary)' : '2px solid transparent'
                                    }}
                                >
                                    {user.user_metadata.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Profile" style={{ width: '100%', height: '100%' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <UserIcon size={20} color="var(--text-primary)" />
                                        </div>
                                    )}
                                </div>

                                {/* Menu Popover */}
                                {isMenuOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        left: '48px',
                                        backgroundColor: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        padding: '0.5rem',
                                        minWidth: '220px',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                                        zIndex: 100,
                                        cursor: 'default'
                                    }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Signed in as</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {user.email}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                handleSwitchAccount();
                                                setIsMenuOpen(false);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                width: '100%',
                                                padding: '0.5rem',
                                                color: 'var(--text-primary)',
                                                textAlign: 'left',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                            className="hover-bg"
                                        >
                                            <RefreshCw size={16} />
                                            Switch Account
                                        </button>

                                        <button
                                            onClick={() => {
                                                signOut();
                                                setIsMenuOpen(false);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                width: '100%',
                                                padding: '0.5rem',
                                                color: '#ef4444',
                                                textAlign: 'left',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                            className="hover-bg"
                                        >
                                            <LogOut size={16} />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <a href="/settings" onClick={(e) => handleNavClick(e, '/settings')} style={{ color: 'var(--text-secondary)', padding: '0.5rem' }}>
                        <Settings size={24} />
                    </a>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ flex: 1, overflow: 'auto', backgroundColor: 'var(--bg-primary)' }}>
                <Outlet />
            </main>
        </div>
    );
};
