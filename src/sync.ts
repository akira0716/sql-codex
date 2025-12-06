import { db } from './db';
import { supabase } from './supabase';

export async function syncData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
        await syncFunctions(user.id);
        await syncOptions(user.id);
        return { success: true };
    } catch (error) {
        console.error('Sync failed:', error);
        return { success: false, error };
    }
}

async function syncFunctions(userId: string) {
    // 1. Fetch all local and cloud data
    const localFunctions = await db.functions.toArray();
    const { data: cloudFunctions, error } = await supabase.from('functions').select('*');

    if (error) throw error;
    if (!cloudFunctions) return;

    // 2. Push Local -> Cloud (New Items)
    const newLocalFunctions = localFunctions.filter(f => !f.cloud_id);
    for (const f of newLocalFunctions) {
        const { data, error } = await supabase.from('functions').insert({
            name: f.name,
            description: f.description,
            usage: f.usage,
            dbms: f.dbms,
            tags: f.tags,
            created_at: f.createdAt.toISOString(),
            updated_at: f.updatedAt.toISOString(),
            user_id: userId
        }).select().single();

        if (data && !error) {
            await db.functions.update(f.id!, { cloud_id: data.id });
        }
    }

    // 3. Push Local -> Cloud (Updates)
    // For simplicity, we assume local edits are significant. 
    // real sync needs timestamp comparison
    const existingLocalFunctions = localFunctions.filter(f => f.cloud_id);
    for (const f of existingLocalFunctions) {
        // Find corresponding cloud item to check timestamp? 
        // For now, let's just push local state to cloud to ensure cloud matches local
        await supabase.from('functions').update({
            name: f.name,
            description: f.description,
            usage: f.usage,
            dbms: f.dbms,
            tags: f.tags,
            updated_at: f.updatedAt.toISOString()
        }).eq('id', f.cloud_id);
    }

    // 4. Pull Cloud -> Local (New Items from other devices)
    const localCloudIds = new Set(localFunctions.map(f => f.cloud_id).filter(Boolean));
    const newCloudFunctions = cloudFunctions.filter(f => !localCloudIds.has(f.id));

    for (const f of newCloudFunctions) {
        await db.functions.add({
            cloud_id: f.id,
            name: f.name,
            description: f.description || '',
            usage: f.usage || '',
            dbms: f.dbms || [],
            tags: f.tags || [],
            createdAt: new Date(f.created_at),
            updatedAt: new Date(f.updated_at)
        });
    }
}

async function syncOptions(userId: string) {
    // Sync DBMS Options
    const localDbms = await db.dbms_options.toArray();
    const { data: cloudDbms } = await supabase.from('dbms_options').select('*');

    if (cloudDbms) {
        // Push missing local to cloud
        const missingInCloud = localDbms.filter(l => !l.cloud_id);
        for (const l of missingInCloud) {
            // Check if exists by name to prevent duplicates
            const existing = cloudDbms.find(c => c.name === l.name);
            if (existing) {
                await db.dbms_options.update(l.id!, { cloud_id: existing.id });
            } else {
                const { data } = await supabase.from('dbms_options').insert({ name: l.name, user_id: userId }).select().single();
                if (data) await db.dbms_options.update(l.id!, { cloud_id: data.id });
            }
        }

        // Pull missing cloud to local
        const localCloudIds = new Set(localDbms.map(l => l.cloud_id).filter(Boolean));
        // Also check by name to prevent local duplicates if name matches but no cloud_id yet (edge case)
        const localNames = new Set(localDbms.map(l => l.name));

        const missingInLocal = cloudDbms.filter(c => !localCloudIds.has(c.id));
        for (const c of missingInLocal) {
            if (!localNames.has(c.name)) {
                await db.dbms_options.add({ cloud_id: c.id, name: c.name });
            } else {
                // If local has name but no cloud_id, update it
                const localMatch = localDbms.find(l => l.name === c.name);
                if (localMatch && !localMatch.cloud_id) {
                    await db.dbms_options.update(localMatch.id!, { cloud_id: c.id });
                }
            }
        }
    }

    // Sync Tag Options
    const localTags = await db.tag_options.toArray();
    const { data: cloudTags } = await supabase.from('tag_options').select('*');

    if (cloudTags) {
        // Push missing local to cloud
        const missingInCloud = localTags.filter(l => !l.cloud_id);
        for (const l of missingInCloud) {
            // Check if exists by name
            const existing = cloudTags.find(c => c.name === l.name);
            if (existing) {
                await db.tag_options.update(l.id!, { cloud_id: existing.id });
            } else {
                const { data } = await supabase.from('tag_options').insert({ name: l.name, user_id: userId }).select().single();
                if (data) await db.tag_options.update(l.id!, { cloud_id: data.id });
            }
        }

        // Pull missing cloud to local
        const localCloudIds = new Set(localTags.map(l => l.cloud_id).filter(Boolean));
        const localNames = new Set(localTags.map(l => l.name));

        const missingInLocal = cloudTags.filter(c => !localCloudIds.has(c.id));
        for (const c of missingInLocal) {
            if (!localNames.has(c.name)) {
                await db.tag_options.add({ cloud_id: c.id, name: c.name });
            } else {
                const localMatch = localTags.find(l => l.name === c.name);
                if (localMatch && !localMatch.cloud_id) {
                    await db.tag_options.update(localMatch.id!, { cloud_id: c.id });
                }
            }
        }
    }
}
