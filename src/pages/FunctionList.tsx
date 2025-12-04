import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SQLFunction } from '../db';
import { useNavigate } from 'react-router-dom';
import { Search, Tag, Database, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';

export const FunctionList: React.FC = () => {
    const [search, setSearch] = useState('');
    const [selectedFunction, setSelectedFunction] = useState<SQLFunction | null>(null);
    const navigate = useNavigate();

    const functions = useLiveQuery(async () => {
        if (!search) return await db.functions.toArray();

        const all = await db.functions.toArray();
        const lowerSearch = search.toLowerCase();
        return all.filter(f =>
            f.name.toLowerCase().includes(lowerSearch) ||
            f.tags.some(t => t.toLowerCase().includes(lowerSearch)) ||
            f.dbms.some(d => d.toLowerCase().includes(lowerSearch))
        );
    }, [search]);

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this function?')) {
            await db.functions.delete(id);
            if (selectedFunction?.id === id) setSelectedFunction(null);
        }
    };

    const handleEdit = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        navigate(`/edit/${id}`);
    };

    if (!functions) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Library</h1>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search functions, tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', paddingLeft: '36px' }}
                    />
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {functions.map(func => (
                    <div
                        key={func.id}
                        onClick={() => setSelectedFunction(func)}
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, border-color 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '180px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{func.name}</h3>

                                {/* DBMS Tooltip Container */}
                                <div
                                    style={{ position: 'relative', cursor: 'help' }}
                                    className="dbms-tooltip-container"
                                >
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {func.dbms.slice(0, 2).map(d => (
                                            <span key={d} style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                color: 'var(--accent-primary)'
                                            }}>
                                                {d}
                                            </span>
                                        ))}
                                        {func.dbms.length > 2 && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>+{func.dbms.length - 2}</span>}
                                    </div>

                                    {/* Tooltip Content */}
                                    <div className="dbms-tooltip" style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        right: 0,
                                        marginBottom: '8px',
                                        backgroundColor: 'var(--bg-tertiary)',
                                        border: '1px solid var(--border-color)',
                                        padding: '0.5rem',
                                        borderRadius: '4px',
                                        width: 'max-content',
                                        maxWidth: '200px',
                                        zIndex: 10,
                                        display: 'none', // Handled by CSS hover
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '4px' }}>Supported DBMS:</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {func.dbms.map(d => (
                                                <span key={d} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {func.tags.map(tag => (
                                    <span key={tag} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        backgroundColor: 'var(--bg-tertiary)',
                                        padding: '2px 8px',
                                        borderRadius: '12px'
                                    }}>
                                        <Tag size={12} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <button
                                onClick={(e) => handleEdit(e, func.id!)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    color: 'var(--text-secondary)',
                                    transition: 'color 0.2s, background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                    e.currentTarget.style.color = 'var(--accent-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                                title="Edit"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={(e) => handleDelete(e, func.id!)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    color: 'var(--text-secondary)',
                                    transition: 'color 0.2s, background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                    e.currentTarget.style.color = '#ef4444';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {functions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <Database size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No functions found. Create one to get started.</p>
                </div>
            )}

            <Modal
                isOpen={!!selectedFunction}
                onClose={() => setSelectedFunction(null)}
                title={selectedFunction?.name || ''}
            >
                {selectedFunction && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h3>
                            <p style={{ lineHeight: '1.6' }}>{selectedFunction.description}</p>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supported DBMS</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {selectedFunction.dbms.map(d => (
                                    <span key={d} style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        color: 'var(--accent-primary)',
                                        fontSize: '0.9rem'
                                    }}>
                                        {d}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usage</h3>
                            <div style={{
                                backgroundColor: '#0d1117',
                                padding: '1rem',
                                borderRadius: '6px',
                                fontFamily: 'var(--font-mono)',
                                color: '#c9d1d9',
                                overflowX: 'auto',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {selectedFunction.usage}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {selectedFunction.tags.map(tag => (
                                    <span key={tag} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        backgroundColor: 'var(--bg-tertiary)',
                                        padding: '2px 8px',
                                        borderRadius: '12px'
                                    }}>
                                        <Tag size={12} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
