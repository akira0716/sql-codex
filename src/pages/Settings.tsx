import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export const Settings: React.FC = () => {
    const [dbmsInput, setDbmsInput] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [saved, setSaved] = useState(false);

    // Fetch existing options
    const dbmsOptions = useLiveQuery(() => db.dbms_options.toArray());
    const tagOptions = useLiveQuery(() => db.tag_options.toArray());

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

    const handleSave = async () => {
        const newDbmsList = dbmsInput.split(',').map(s => s.trim()).filter(Boolean);
        const newTagsList = tagsInput.split(',').map(s => s.trim()).filter(Boolean);

        await db.transaction('rw', db.dbms_options, db.tag_options, async () => {
            // Clear and re-add (simple sync strategy)
            await db.dbms_options.clear();
            await db.dbms_options.bulkAdd(newDbmsList.map(name => ({ name })));

            await db.tag_options.clear();
            await db.tag_options.bulkAdd(newTagsList.map(name => ({ name })));
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
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
