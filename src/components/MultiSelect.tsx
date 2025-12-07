import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiSelectProps {
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange, placeholder = 'Select...', autoFocus = true }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const [filter, setFilter] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, autoFocus]);

    const toggleOption = (option: string) => {
        if (value.includes(option)) {
            onChange(value.filter(v => v !== option));
        } else {
            onChange([...value, option]);
        }
    };

    const removeOption = (e: React.MouseEvent, option: string) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== option));
    };

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(filter.toLowerCase())
    );

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: 'fixed',
                top: `${rect.bottom + 4}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                zIndex: 9999, // Ensure it's above everything including modals
            });
        }
    }, [isOpen]);

    // Use a Portal to render the dropdown outside the current DOM hierarchy
    // This requires a portal root in index.html or creating one dynamically, 
    // but for simplicity here we can just render fixed. 
    // Actually, pure fixed without portal works if no parent has transform/filter.
    // Given the modal uses transform, we probably need a Portal or ensure fixed works.
    // Let's try pure fixed first, but if the modal has transform, fixed will be relative to it.
    // The Modal uses framer-motion which often applies transform.
    // SAFE BET: Use React Portal.

    // START PORTAL IMPLEMENTATION
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
    useEffect(() => {
        let el = document.getElementById('dropdown-portal');
        if (!el) {
            el = document.createElement('div');
            el.id = 'dropdown-portal';
            document.body.appendChild(el);
        }
        setPortalContainer(el);
    }, []);

    // ...

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    minHeight: '42px',
                    padding: '0.5rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: `1px solid ${isOpen ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    alignItems: 'center',
                    transition: 'border-color 0.2s'
                }}
            >
                {/* ... trigger content ... */}
                {value.length === 0 && (
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>{placeholder}</span>
                )}

                {value.map(v => (
                    <motion.span
                        key={v}
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--accent-primary)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.9rem'
                        }}
                    >
                        {v}
                        <X
                            size={14}
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => removeOption(e, v)}
                        />
                    </motion.span>
                ))}

                <div style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown size={16} />
                    </motion.div>
                </div>
            </div>

            {/* Render Dropdown in Portal */}
            {isOpen && portalContainer && ReactDOM.createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            ...dropdownStyle,
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            maxHeight: '250px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Sticky Header */}
                        <div style={{ flexShrink: 0, borderBottom: '1px solid var(--border-color)' }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                placeholder="Filter options..."
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    outline: 'none',
                                    color: 'var(--text-primary)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {/* Scrollable Content */}
                        <div style={{
                            overflowY: 'auto',
                            overscrollBehavior: 'contain',
                            flex: 1
                        }}>
                            {filteredOptions.length === 0 ? (
                                <div style={{ padding: '0.5rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                    No options found
                                </div>
                            ) : (
                                filteredOptions.map(option => (
                                    <div
                                        key={option}
                                        onClick={() => toggleOption(option)}
                                        style={{
                                            padding: '0.5rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            backgroundColor: value.includes(option) ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                            color: value.includes(option) ? 'var(--accent-primary)' : 'var(--text-primary)',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = value.includes(option) ? 'rgba(59, 130, 246, 0.05)' : 'transparent';
                                        }}
                                    >
                                        {option}
                                        {value.includes(option) && <Check size={16} />}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>,
                portalContainer
            )}
        </div>
    );
};
