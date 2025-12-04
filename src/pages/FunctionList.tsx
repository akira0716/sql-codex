import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Link } from 'react-router-dom';
import { Search, Tag, Database } from 'lucide-react';

export const FunctionList: React.FC = () => {
    const [search, setSearch] = useState('');

    const functions = useLiveQuery(async () => {
        if (!search) return await db.functions.toArray();

        // Simple search implementation
        const all = await db.functions.toArray();
        const lowerSearch = search.toLowerCase();
        return all.filter(f =>
            f.name.toLowerCase().includes(lowerSearch) ||
            f.tags.some(t => t.toLowerCase().includes(lowerSearch)) ||
            f.dbms.some(d => d.toLowerCase().includes(lowerSearch))
        );
    }, [search]);

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
                    <Link key={func.id} to={`/edit/${func.id}`} style={{ display: 'block' }}>
                        <div style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            border: '1px solid var(--border-color)',
                            height: '100%',
                            transition: 'transform 0.2s, border-color 0.2s'
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{func.name}</h3>
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
                            </div>

                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem',
                                marginBottom: '1.5rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {func.description}
                            </p>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                    </Link>
                ))}
            </div>

            {functions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <Database size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No functions found. Create one to get started.</p>
                </div>
            )}
        </div>
    );
};
