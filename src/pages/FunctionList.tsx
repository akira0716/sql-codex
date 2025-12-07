import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SQLFunction } from '../db';
import { useNavigate } from 'react-router-dom';
import { Search, Tag, Database, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { SearchFilter } from '../components/SearchFilter';
import { useLanguage } from '../i18n';

export function FunctionList() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Load saved filters
    const getSavedFilters = () => {
        try {
            const saved = localStorage.getItem('sql-codex-search-filters');
            return saved ? JSON.parse(saved) : { searchName: '', selectedDbms: [], selectedTags: [] };
        } catch {
            return { searchName: '', selectedDbms: [], selectedTags: [] };
        }
    };

    const initialFilters = getSavedFilters();

    const [searchName, setSearchName] = useState(initialFilters.searchName || '');
    const [selectedDbms, setSelectedDbms] = useState<string[]>(initialFilters.selectedDbms || []);
    const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters.selectedTags || []);

    const [selectedFunction, setSelectedFunction] = useState<SQLFunction | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Save filters on change
    React.useEffect(() => {
        localStorage.setItem('sql-codex-search-filters', JSON.stringify({
            searchName,
            selectedDbms,
            selectedTags
        }));
    }, [searchName, selectedDbms, selectedTags]);

    // Fetch options
    const dbmsOptions = useLiveQuery(async () => {
        const options = await db.dbms_options.filter(o => !o.is_deleted).toArray();
        return options.map(o => o.name).sort();
    }, []) || [];

    const tagOptions = useLiveQuery(async () => {
        const options = await db.tag_options.filter(o => !o.is_deleted).toArray();
        return options.map(o => o.name).sort();
    }, []) || [];

    const functions = useLiveQuery(async () => {
        let collection = db.functions.filter(f => !f.is_deleted);

        // Optimization: If no filters, return all sorted
        if (!searchName && selectedDbms.length === 0 && selectedTags.length === 0) {
            return await collection.reverse().sortBy('updatedAt');
        }

        const all = await collection.toArray();
        const lowerSearch = searchName.toLowerCase();

        return all.filter(f => {
            // Name Filter (Partial Match)
            if (searchName && !f.name.toLowerCase().includes(lowerSearch)) return false;

            // DBMS Filter (OR logic: match ANY selected)
            if (selectedDbms.length > 0) {
                const hasMatch = f.dbms.some(d => selectedDbms.includes(d));
                if (!hasMatch) return false;
            }

            // Tags Filter (OR logic: match ANY selected)
            if (selectedTags.length > 0) {
                const hasMatch = f.tags.some(t => selectedTags.includes(t));
                if (!hasMatch) return false;
            }

            return true;
        }).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }, [searchName, selectedDbms, selectedTags]);

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm(t('library.confirmDelete'))) {
            // Soft Delete
            await db.functions.update(id, { is_deleted: true, updatedAt: new Date() });
            if (selectedFunction?.id === id) setSelectedFunction(null);
        }
    };

    const handleEdit = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        navigate(`/edit/${id}`);
    };

    if (!functions) return null;

    const clearFilters = () => {
        setSearchName('');
        setSelectedDbms([]);
        setSelectedTags([]);
    };

    const activeFiltersCount = selectedDbms.length + selectedTags.length + (searchName ? 1 : 0);

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{t('library.title')}</h1>

                {/* Mobile Search Button */}
                <button
                    className="search-mobile"
                    onClick={() => setIsSearchOpen(true)}
                    style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        backgroundColor: activeFiltersCount > 0 ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        color: activeFiltersCount > 0 ? 'white' : 'var(--text-secondary)',
                        display: 'none',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'background-color 0.2s, color 0.2s',
                        position: 'relative'
                    }}
                >
                    <Search size={20} />
                    {activeFiltersCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            fontSize: '0.7rem',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid var(--bg-primary)'
                        }}>
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </header>

            {/* Desktop Search Area - Moved here */}
            <div className="search-desktop" style={{ marginBottom: '2rem', width: '100%' }}>
                <SearchFilter
                    searchName={searchName}
                    onSearchNameChange={setSearchName}
                    selectedDbms={selectedDbms}
                    onDbmsChange={setSelectedDbms}
                    dbmsOptions={dbmsOptions}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                    tagOptions={tagOptions}
                    layout="row"
                />
            </div>

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
                    <p>{t('library.noFunctions')}</p>
                    {(searchName || selectedDbms.length > 0 || selectedTags.length > 0) && (
                        <button
                            onClick={clearFilters}
                            style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem'
                            }}
                        >
                            {t('library.clearFilters')}
                        </button>
                    )}
                </div>
            )}

            <Modal
                isOpen={!!selectedFunction}
                onClose={() => setSelectedFunction(null)}
                title={selectedFunction?.name || ''}
            >
                {/* ... existing detail modal content ... */}
                {selectedFunction && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('library.description')}</h3>
                            <p style={{ lineHeight: '1.6' }}>{selectedFunction.description}</p>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('library.supportedDbms')}</h3>
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
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('library.usage')}</h3>
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
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('library.tags')}</h3>
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

            {/* Mobile Search Modal */}
            <Modal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                title={t('library.searchFilters')}
            >
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
                        {t('library.specifyConditions')}
                    </p>
                    <SearchFilter
                        searchName={searchName}
                        onSearchNameChange={setSearchName}
                        selectedDbms={selectedDbms}
                        onDbmsChange={setSelectedDbms}
                        dbmsOptions={dbmsOptions}
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                        tagOptions={tagOptions}
                        isMobile={true}
                    />
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            onClick={clearFilters}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '6px',
                                backgroundColor: 'transparent',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.9rem'
                            }}
                        >
                            {t('library.clear')}
                        </button>
                        <button
                            onClick={() => setIsSearchOpen(false)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '6px',
                                backgroundColor: 'var(--accent-primary)',
                                color: 'white',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {t('library.showResults')} ({functions?.length || 0})
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
