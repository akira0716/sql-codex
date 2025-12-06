import Dexie, { type Table } from 'dexie';

export interface SQLFunction {
    id?: number;
    cloud_id?: string;
    name: string;
    description: string;
    usage: string;
    dbms: string[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DBMSOption {
    id?: number;
    cloud_id?: string;
    name: string;
}

export interface TagOption {
    id?: number;
    cloud_id?: string;
    name: string;
}

export class SQLCodexDB extends Dexie {
    functions!: Table<SQLFunction>;
    dbms_options!: Table<DBMSOption>;
    tag_options!: Table<TagOption>;

    constructor() {
        super('SQLCodexDB');
        this.version(1).stores({
            functions: '++id, name, *dbms, *tags, createdAt, updatedAt'
        });
        this.version(2).stores({
            dbms_options: '++id, &name',
            tag_options: '++id, &name'
        });
        this.version(3).stores({
            functions: '++id, cloud_id, name, *dbms, *tags, createdAt, updatedAt',
            dbms_options: '++id, cloud_id, &name',
            tag_options: '++id, cloud_id, &name'
        });
    }
}

export const db = new SQLCodexDB();
