import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TagSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
}

export const TagSelectorModal: React.FC<TagSelectorModalProps> = ({ isOpen, onClose, options, value, onChange }) => {
    const toggleTag = (tag: string) => {
        if (value.includes(tag)) {
            onChange(value.filter(v => v !== tag));
        } else {
            onChange([...value, tag]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 200, // Higher than search modal (100)
                    display: 'flex',
                    alignItems: 'end', // Slide up from bottom or center
                    justifyContent: 'center'
                }}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(2px)'
                        }}
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            width: '100%',
                            height: '80vh', // Take up most of the screen height
                            backgroundColor: 'var(--bg-primary)',
                            borderTopLeftRadius: '16px',
                            borderTopRightRadius: '16px',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1rem',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Select Tags</h2>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tag List */}
                        <div style={{
                            padding: '1rem',
                            overflowY: 'auto',
                            flex: 1,
                            overscrollBehavior: 'contain'
                        }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {options.map(tag => {
                                    const isSelected = value.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '50px',
                                                border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)',
                                                color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                                                fontSize: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer / Confirm */}
                        <div style={{
                            padding: '1rem',
                            borderTop: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-secondary)'
                        }}>
                            <button
                                onClick={onClose}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--accent-primary)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }}
                            >
                                Done ({value.length} selected)
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
