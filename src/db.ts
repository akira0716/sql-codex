import Dexie, { type Table } from 'dexie';

export interface SQLFunction {
    id?: number;
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
    name: string;
}

export interface TagOption {
    id?: number;
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
    }
}

export const db = new SQLCodexDB();
