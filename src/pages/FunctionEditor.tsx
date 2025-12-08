import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Save, ArrowLeft, Trash2 } from 'lucide-react';
import { MultiSelect } from '../components/MultiSelect';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAuth } from '../AuthContext';
import { syncData } from '../sync';
import { useLanguage } from '../i18n';

export const FunctionEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const { t } = useLanguage();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [usage, setUsage] = useState('');

    const [selectedDbms, setSelectedDbms] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Auth context
    const { user } = useAuth();

    // Mobile check
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch options from DB
    const dbmsOptionsData = useLiveQuery(() => db.dbms_options.toArray());
    const tagOptionsData = useLiveQuery(() => db.tag_options.toArray());

    const dbmsOptions = dbmsOptionsData?.map(o => o.name) || [];
    const tagsOptions = tagOptionsData?.map(o => o.name) || [];

    useEffect(() => {
        if (isEdit && id) {
            db.functions.get(Number(id)).then(func => {
                if (func) {
                    setName(func.name);
                    setDescription(func.description);
                    setUsage(func.usage);
                    setSelectedDbms(func.dbms);
                    setSelectedTags(func.tags);
                }
            });
        }
    }, [isEdit, id]);

    const handleSave = async () => {
        const data = {
            name,
            description,
            usage,
            dbms: selectedDbms,
            tags: selectedTags,
            updatedAt: new Date(),
        };

        if (isEdit && id) {
            await db.functions.update(Number(id), data);
        } else {
            await db.functions.add({
                ...data,
                createdAt: new Date(),
            });
        }

        // Auto sync if logged in
        if (user) {
            syncData(); // Fire and forget, don't await to block navigation
        }
        navigate('/');
    };

    const handleDelete = () => {
        if (isEdit && id) {
            setShowDeleteConfirm(true);
        }
    };

    const confirmDelete = async () => {
        if (isEdit && id) {
            // Soft delete
            await db.functions.update(Number(id), {
                is_deleted: true,
                updatedAt: new Date() // Update timestamp to trigger sync
            });

            // Auto sync if logged in
            if (user) syncData();

            navigate('/');
        }
        setShowDeleteConfirm(false);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{isEdit ? t('editor.editFunction') : t('editor.newFunction')}</h1>
                </div>
                <div className="editor-buttons" style={{ display: 'flex', gap: '1rem' }}>
                    {isEdit && (
                        <button onClick={handleDelete} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Trash2 size={20} />
                            <span style={{ marginLeft: '0.5rem' }}>{t('editor.delete')}</span>
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 500
                        }}
                    >
                        <Save size={20} />
                        {t('editor.save')}
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('editor.functionName')}</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                        placeholder={t('editor.functionNamePlaceholder')}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('editor.dbms')}</label>
                        <MultiSelect
                            options={dbmsOptions}
                            value={selectedDbms}
                            onChange={setSelectedDbms}
                            placeholder={t('editor.selectDbms')}
                            autoFocus={!isMobile}
                        />
                        {dbmsOptions.length === 0 && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate('/settings')}>{t('editor.configureInSettings')}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('editor.tags')}</label>
                        <MultiSelect
                            options={tagsOptions}
                            value={selectedTags}
                            onChange={setSelectedTags}
                            placeholder={t('editor.selectTags')}
                            autoFocus={!isMobile}
                        />
                        {tagsOptions.length === 0 && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate('/settings')}>{t('editor.configureInSettings')}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('editor.description')}</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                        placeholder={t('editor.descriptionPlaceholder')}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('editor.usageExample')}</label>
                    <textarea
                        value={usage}
                        onChange={e => setUsage(e.target.value)}
                        style={{
                            width: '100%',
                            minHeight: '300px',
                            fontFamily: 'var(--font-mono)',
                            backgroundColor: '#0d1117',
                            color: '#c9d1d9',
                            lineHeight: '1.6'
                        }}
                        placeholder={t('editor.usagePlaceholder')}
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title={t('dialog.deleteTitle')}
                message={t('editor.confirmDelete')}
                confirmText={t('dialog.delete')}
                cancelText={t('dialog.cancel')}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="danger"
            />
        </div>
    );
};
