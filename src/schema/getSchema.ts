import {getConnection} from "../db";

export interface TableSchema {
    table: string
    columns: {name: string, type: string}[]
}
export async function getSchema(table: string): Promise<TableSchema> {
    const columns = await getConnection().raw(`PRAGMA table_info("${table}");`);
    return {table, columns}
}
