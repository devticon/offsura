export interface EntityGenerateColumnParams {
  name?: string;
  type: string;
  default?: any;
  nullable?: boolean;
  columnName?: string;
  primary?: boolean;
  primaryGenerated?: boolean;
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
  importTypeormFrom: string;
  extend?: {
    name: string;
    import?: EntityGenerateImportParams;
  };
  imports?: EntityGenerateImportParams[];
  columns: EntityGenerateColumnParams[];
  relations: EntityGenerateRelationParams[];
}
