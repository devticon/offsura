export interface ColumnMetadata {
  name: string;
  type: string;
  isNullable: boolean;
}
export interface ForeignKeyMetadata {
  name: string;
  column: string;
  referenceTable: string;
  referenceColumn: string;
}

export interface TableMetadata {
  table: string;
  columns: ColumnMetadata[];
  foreignKeys: ForeignKeyMetadata[];
  primaryKeys: string[];
  hasuraMetadata: any;
}
