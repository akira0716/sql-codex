import React, { useState, useEffect } from 'react';
import { Save, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncData } from '../sync';
import { useAuth } from '../AuthContext';

export const Settings: React.FC = () => {
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Settings</h1>
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
                    {saved ? 'Saved!' : 'Save'}
                </button>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Account Section */}
                {/* Account Section */}
                <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Account & Sync</h2>
                    {authLoading ? (
                        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <RefreshCw className="spin" />
                        </div>
                    ) : user ? (
                        <div>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                Logged in as: <span style={{ color: 'var(--text-primary)' }}>{user.email}</span>
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
                                    {isSyncing ? 'Syncing...' : 'Sync Now'}
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
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                Sign in to sync your data to the cloud.
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
                                Sign in with Google
                            </button>
                        </div>
                    )}
                </section>
                <section>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>DBMS Options</h2>
                    <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Enter available DBMS options, separated by commas.
                    </p>
                    <textarea
                        value={dbmsInput}
                        onChange={(e) => setDbmsInput(e.target.value)}
                        placeholder="e.g., PostgreSQL, MySQL, SQLite, Oracle, SQL Server"
                        style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                    />
                </section>

                <section>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Tag Options</h2>
                    <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Enter available tags, separated by commas.
                    </p>
                    <textarea
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="e.g., date, string, aggregation, window-function, json"
                        style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                    />
                </section>
            </div>
        </div>
    );
};
