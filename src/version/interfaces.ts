export interface ColumnMetadata {
  name: string;
  type: string;
}

export interface TableMetadata {
  table: string;
  columns: ColumnMetadata[];
  primaryKeys: string[];
  hasuraMetadata: any;
}
