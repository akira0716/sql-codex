import React from 'react';
import { Search } from 'lucide-react';
import { MultiSelect } from './MultiSelect';

interface SearchFilterProps {
    searchName: string;
    onSearchNameChange: (value: string) => void;
    selectedDbms: string[];
    onDbmsChange: (value: string[]) => void;
    dbmsOptions: string[];
    selectedTags: string[];
    onTagsChange: (value: string[]) => void;
    tagOptions: string[];
    isMobile?: boolean; // To control autoFocus
    layout?: 'row' | 'column'; // New prop for layout direction
    className?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
    searchName,
    onSearchNameChange,
    selectedDbms,
    onDbmsChange,
    dbmsOptions,
    selectedTags,
    onTagsChange,
    tagOptions,
    isMobile = false,
    layout = 'column',
    className
}) => {
    return (
        <div className={`search-filter ${className || ''}`} style={{
            display: 'flex',
            flexDirection: layout,
            gap: '1rem',
            alignItems: layout === 'row' ? 'flex-end' : 'stretch' // Align bottom for row to match input/labels
        }}>
            {/* Function Name Search */}
            <div style={{ position: 'relative', flex: layout === 'row' ? 2 : 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                    type="text"
                    placeholder="Search by function name..."
                    value={searchName}
                    onChange={(e) => onSearchNameChange(e.target.value)}
                    autoFocus={!isMobile} // Specific requirement: No autoFocus on mobile
                    style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 40px',
                        fontSize: '1rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        borderRadius: '4px'
                    }}
                />
            </div>

            {/* DBMS Filter */}
            <div style={{ flex: layout === 'row' ? 1 : 'auto' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>DBMS</label>
                <MultiSelect
                    options={dbmsOptions}
                    value={selectedDbms}
                    onChange={onDbmsChange}
                    placeholder="Select DBMS..."
                />
            </div>

            {/* Tags Filter */}
            <div style={{ flex: layout === 'row' ? 1 : 'auto' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Tags</label>
                <MultiSelect
                    options={tagOptions}
                    value={selectedTags}
                    onChange={onTagsChange}
                    placeholder="Select Tags..."
                />
            </div>
        </div>
    );
};
