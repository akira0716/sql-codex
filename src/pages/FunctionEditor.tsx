import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db';
import { Save, ArrowLeft, Trash2 } from 'lucide-react';

export const FunctionEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [usage, setUsage] = useState('');
    const [dbmsInput, setDbmsInput] = useState('');
    const [tagsInput, setTagsInput] = useState('');

    useEffect(() => {
        if (isEdit && id) {
            db.functions.get(Number(id)).then(func => {
                if (func) {
                    setName(func.name);
                    setDescription(func.description);
                    setUsage(func.usage);
                    setDbmsInput(func.dbms.join(', '));
                    setTagsInput(func.tags.join(', '));
                }
            });
        }
    }, [isEdit, id]);

    const handleSave = async () => {
        const dbms = dbmsInput.split(',').map(s => s.trim()).filter(Boolean);
        const tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);

        const data = {
            name,
            description,
            usage,
            dbms,
            tags,
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
        navigate('/');
    };

    const handleDelete = async () => {
        if (isEdit && id && confirm('Are you sure you want to delete this function?')) {
            await db.functions.delete(Number(id));
            navigate('/');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{isEdit ? 'Edit Function' : 'New Function'}</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {isEdit && (
                        <button onClick={handleDelete} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Trash2 size={20} />
                            <span style={{ marginLeft: '0.5rem' }}>Delete</span>
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
                        Save
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Function Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                        placeholder="e.g., DATE_TRUNC"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>DBMS (comma separated)</label>
                        <input
                            type="text"
                            value={dbmsInput}
                            onChange={e => setDbmsInput(e.target.value)}
                            style={{ width: '100%' }}
                            placeholder="e.g., PostgreSQL, MySQL"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={e => setTagsInput(e.target.value)}
                            style={{ width: '100%' }}
                            placeholder="e.g., date, string, aggregation"
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                        placeholder="What does this function do?"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Usage / Example</label>
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
                        placeholder="SELECT ..."
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
};
