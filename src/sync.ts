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
            is_deleted: !!f.is_deleted,
            created_at: f.createdAt.toISOString(),
            updated_at: f.updatedAt.toISOString(),
            user_id: userId
        }).select().single();

        if (data && !error) {
            await db.functions.update(f.id!, { cloud_id: data.id });
        }
    }

    // 3. Push Local -> Cloud (Updates including Soft Deletes)
    const existingLocalFunctions = localFunctions.filter(f => f.cloud_id);
    for (const f of existingLocalFunctions) {
        await supabase.from('functions').update({
            name: f.name,
            description: f.description,
            usage: f.usage,
            dbms: f.dbms,
            tags: f.tags,
            is_deleted: !!f.is_deleted,
            updated_at: f.updatedAt.toISOString()
        }).eq('id', f.cloud_id);
    }

    // 4. Pull Cloud -> Local
    const localMap = new Map(localFunctions.map(f => [f.cloud_id, f]));

    for (const cf of cloudFunctions) {
        const localFunc = localMap.get(cf.id);

        if (localFunc) {
            // Update existing local item
            // ZOMBIE PROTECTION: If local is deleted, ignore cloud update (unless cloud is also deleted, then it matches)
            if (localFunc.is_deleted && !cf.is_deleted) {
                // Ignore ghost update
                continue;
            }

            // Otherwise apply update from cloud (latest wins or merging logic - here simply applying cloud)
            await db.functions.update(localFunc.id!, {
                name: cf.name,
                description: cf.description || '',
                usage: cf.usage || '',
                dbms: cf.dbms || [],
                tags: cf.tags || [],
                is_deleted: cf.is_deleted,
                updatedAt: new Date(cf.updated_at)
            });
        } else {
            // New item from cloud
            await db.functions.add({
                cloud_id: cf.id,
                name: cf.name,
                description: cf.description || '',
                usage: cf.usage || '',
                dbms: cf.dbms || [],
                tags: cf.tags || [],
                is_deleted: cf.is_deleted,
                createdAt: new Date(cf.created_at),
                updatedAt: new Date(cf.updated_at)
            });
        }
    }
}

async function syncOptions(userId: string) {
    // Shared Logic for Options
    const syncTable = async (
        localTable: any,
        cloudTableName: 'dbms_options' | 'tag_options'
    ) => {
        const localItems = await localTable.toArray();
        const { data: cloudItems } = await supabase.from(cloudTableName).select('*');

        if (!cloudItems) return;

        // Push New/Missing
        const missingInCloud = localItems.filter((l: any) => !l.cloud_id);
        for (const l of missingInCloud) {
            // Check by name
            const existing = cloudItems.find((c: any) => c.name === l.name);
            if (existing) {
                // Link
                await localTable.update(l.id, { cloud_id: existing.id });
                // If local is deleted, but cloud is not, we might want to delete cloud too?
                // Or if local is deleted, we just push that status
                if (l.is_deleted !== existing.is_deleted) {
                    await supabase.from(cloudTableName).update({ is_deleted: !!l.is_deleted }).eq('id', existing.id);
                }
            } else {
                const { data } = await supabase.from(cloudTableName).insert({
                    name: l.name,
                    user_id: userId,
                    is_deleted: !!l.is_deleted
                }).select().single();
                if (data) await localTable.update(l.id, { cloud_id: data.id });
            }
        }

        // Push Updates for existing
        const linkedLocal = localItems.filter((l: any) => l.cloud_id);
        for (const l of linkedLocal) {
            await supabase.from(cloudTableName).update({
                is_deleted: !!l.is_deleted
            }).eq('id', l.cloud_id);
        }

        // Pull Cloud -> Local
        const localMap = new Map(localItems.map((l: any) => [l.cloud_id, l]));
        const localNameMap = new Map(localItems.map((l: any) => [l.name, l]));

        for (const c of cloudItems) {
            const local = localMap.get(c.id) as any;
            if (local) {
                // Update
                if (local.is_deleted && !c.is_deleted) continue; // Zombie protection

                await localTable.update(local.id, {
                    is_deleted: c.is_deleted
                });
            } else {
                // New from cloud
                // Check if name matches existing to prevent duplicate
                const localByName = localNameMap.get(c.name) as any;
                if (localByName) {
                    await localTable.update(localByName.id, { cloud_id: c.id, is_deleted: c.is_deleted });
                } else {
                    await localTable.add({
                        cloud_id: c.id,
                        name: c.name,
                        is_deleted: c.is_deleted
                    });
                }
            }
        }
    };

    await syncTable(db.dbms_options, 'dbms_options');
    await syncTable(db.tag_options, 'tag_options');
}
