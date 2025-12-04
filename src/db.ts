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

export class SQLCodexDB extends Dexie {
    functions!: Table<SQLFunction>;

    constructor() {
        super('SQLCodexDB');
        this.version(1).stores({
            functions: '++id, name, *dbms, *tags, createdAt, updatedAt'
        });
    }
}

export const db = new SQLCodexDB();
