import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { MultiSelect } from './MultiSelect';
import { TagSelectorModal } from './TagSelectorModal';

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
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);

    return (
        <>
            <div className={`search-filter ${className || ''}`} style={{
                display: 'flex',
                flexDirection: layout,
                gap: '1rem',
                alignItems: layout === 'row' ? 'flex-end' : 'stretch'
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
                        autoFocus={!isMobile}
                    />
                </div>

                {/* Tags Filter */}
                <div style={{ flex: layout === 'row' ? 1 : 'auto' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Tags</label>
                    {isMobile ? (
                        <button
                            onClick={() => setIsTagModalOpen(true)}
                            style={{
                                width: '100%',
                                minHeight: '42px',
                                padding: '0.5rem',
                                backgroundColor: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                color: 'var(--text-primary)',
                                textAlign: 'left',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ color: selectedTags.length > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                {selectedTags.length > 0 ? `${selectedTags.length} selected` : 'Select Tags...'}
                            </span>
                            <ChevronRight size={16} color="var(--text-secondary)" />
                        </button>
                    ) : (
                        <MultiSelect
                            options={tagOptions}
                            value={selectedTags}
                            onChange={onTagsChange}
                            placeholder="Select Tags..."
                            autoFocus={!isMobile}
                        />
                    )}
                </div>
            </div>

            {/* Mobile Tag Selector Modal */}
            <TagSelectorModal
                isOpen={isTagModalOpen}
                onClose={() => setIsTagModalOpen(false)}
                options={tagOptions}
                value={selectedTags}
                onChange={onTagsChange}
            />
        </>
    );
};
