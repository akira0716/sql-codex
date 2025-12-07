import React, { useState, useEffect } from 'react';
import { Save, LogIn, LogOut, RefreshCw, Globe } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncData } from '../sync';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n';

export const Settings: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const [dbmsInput, setDbmsInput] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [saved, setSaved] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Get auth state from context
    const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();

    // Fetch existing options
    const dbmsOptions = useLiveQuery(() => db.dbms_options.filter(o => !o.is_deleted).toArray());
    const tagOptions = useLiveQuery(() => db.tag_options.filter(o => !o.is_deleted).toArray());

    // Initialize inputs when data is loaded
    useEffect(() => {
        if (dbmsOptions) {
            setDbmsInput(dbmsOptions.map(o => o.name).join(', '));
        }
    }, [dbmsOptions]);

    useEffect(() => {
        if (tagOptions) {
            setTagsInput(tagOptions.map(o => o.name).join(', '));
        }
    }, [tagOptions]);

    const handleSync = async () => {
        if (!user) return;
        setIsSyncing(true);
        await syncData();
        setIsSyncing(false);
    };

    const handleSave = async () => {
        const newDbmsList = dbmsInput.split(',').map(s => s.trim()).filter(Boolean);
        const newTagsList = tagsInput.split(',').map(s => s.trim()).filter(Boolean);

        await db.transaction('rw', db.dbms_options, db.tag_options, async () => {
            // DBMS Options: Soft Delete removed ones, Add new ones
            const currentDbms = await db.dbms_options.toArray();
            for (const dbms of currentDbms) {
                if (!newDbmsList.includes(dbms.name)) {
                    if (!dbms.is_deleted) await db.dbms_options.update(dbms.id!, { is_deleted: true });
                } else {
                    // If it was deleted but added back, resurrect it
                    if (dbms.is_deleted) await db.dbms_options.update(dbms.id!, { is_deleted: false });
                }
            }
            // Add strictly new ones
            const existingDbmsNames = new Set(currentDbms.map(d => d.name));
            const trulyNewDbms = newDbmsList.filter(name => !existingDbmsNames.has(name));
            await db.dbms_options.bulkAdd(trulyNewDbms.map(name => ({ name, is_deleted: false })));

            // Tag Options: Soft Delete removed ones, Add new ones
            const currentTags = await db.tag_options.toArray();
            for (const tag of currentTags) {
                if (!newTagsList.includes(tag.name)) {
                    if (!tag.is_deleted) await db.tag_options.update(tag.id!, { is_deleted: true });
                } else {
                    if (tag.is_deleted) await db.tag_options.update(tag.id!, { is_deleted: false });
                }
            }
            const existingTagNames = new Set(currentTags.map(t => t.name));
            const trulyNewTags = newTagsList.filter(name => !existingTagNames.has(name));
            await db.tag_options.bulkAdd(trulyNewTags.map(name => ({ name, is_deleted: false })));
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);

        // Auto sync if logged in
        if (user) {
            handleSync();
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{t('settings.title')}</h1>
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
                    {saved ? t('settings.saved') : t('settings.save')}
                </button>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Language Section */}
                <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={20} />
                        {t('settings.language')}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setLanguage('ja')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                backgroundColor: language === 'ja' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                color: language === 'ja' ? 'white' : 'var(--text-primary)',
                                fontWeight: language === 'ja' ? 'bold' : 'normal',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            日本語
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                backgroundColor: language === 'en' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                color: language === 'en' ? 'white' : 'var(--text-primary)',
                                fontWeight: language === 'en' ? 'bold' : 'normal',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            English
                        </button>
                    </div>
                </section>

                {/* Account Section */}
                <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('settings.accountSync')}</h2>
                    {authLoading ? (
                        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <RefreshCw className="spin" />
                        </div>
                    ) : user ? (
                        <div>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                {t('settings.loggedInAs')} <span style={{ color: 'var(--text-primary)' }}>{user.email}</span>
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'var(--bg-tertiary)',
                                        borderRadius: '6px',
                                        color: isSyncing ? 'var(--text-secondary)' : 'var(--text-primary)',
                                        cursor: isSyncing ? 'wait' : 'pointer'
                                    }}
                                >
                                    <RefreshCw size={18} className={isSyncing ? 'spin' : ''} />
                                    {isSyncing ? t('settings.syncing') : t('settings.syncNow')}
                                </button>
                                <button
                                    onClick={() => signOut()}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    <LogOut size={18} />
                                    {t('settings.logout')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                {t('settings.signInPrompt')}
                            </p>
                            <button
                                onClick={() => signInWithGoogle()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'white',
                                    color: 'black',
                                    borderRadius: '6px',
                                    fontWeight: 500
                                }}
                            >
                                <LogIn size={18} />
                                {t('settings.signInWithGoogle')}
                            </button>
                        </div>
                    )}
                </section>

                <section>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('settings.dbmsOptions')}</h2>
                    <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {t('settings.dbmsDescription')}
                    </p>
                    <textarea
                        value={dbmsInput}
                        onChange={(e) => setDbmsInput(e.target.value)}
                        placeholder={t('settings.dbmsPlaceholder')}
                        style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                    />
                </section>

                <section>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('settings.tagOptions')}</h2>
                    <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {t('settings.tagDescription')}
                    </p>
                    <textarea
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder={t('settings.tagPlaceholder')}
                        style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                    />
                </section>
            </div>
        </div>
    );
};
