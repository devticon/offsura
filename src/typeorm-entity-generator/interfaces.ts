export interface EntityGenerateColumnParams {
  name?: string;
  type: string;
  default?: any;
  nullable?: boolean;
  columnName?: string;
  primary?: boolean;
  primaryGenerated?: boolean;
  typeMapper?: (type: string) => string;
}

export interface EntityGenerateRelationParams {
  type: "OneToMany" | "ManyToOne";
  name: string;
  target: string;
  nullable?: boolean;
  inverseField?: string;
  joinColumn?: string;
  import?: EntityGenerateImportParams;
}

export interface EntityGenerateImportParams {
  default?: string;
  allAs?: string;
  get?: string[];
  from: string;
}

export interface EntityGenerateParams {
  name: string;
  table?: string;
  importTypeormFrom: string;
  extend?: {
    name: string;
    import?: EntityGenerateImportParams;
  };
  typeMapper?: (type: string) => string;
  imports?: EntityGenerateImportParams[];
  columns: EntityGenerateColumnParams[];
  relations: EntityGenerateRelationParams[];
}
