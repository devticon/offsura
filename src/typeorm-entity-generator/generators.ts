import {
  EntityGenerateColumnParams,
  EntityGenerateImportParams,
  EntityGenerateParams,
  EntityGenerateRelationParams,
  GenerateEntitiesIndexProps,
} from "./interfaces";

export class EntityImportGenerator {
  private _get: Set<string> = new Set<string>();
  constructor(private params: EntityGenerateImportParams) {
    for (const item of params.get || []) {
      this._get.add(item);
    }
  }

  get(item: string) {
    this._get.add(item);
  }

  toString() {
    let get: string = "";
    if (this.params.default) {
      get = this.params.default;
    } else if (this.params.allAs) {
      get = `* as ${this.params.allAs}`;
    }
    get += this._get.size
      ? `{ ${Array.from(this._get.values()).join(", ")} }`
      : "";
    return `import ${get} from "${this.params.from}";`;
  }
}

export class EntityColumnGenerator {
  constructor(private params: EntityGenerateColumnParams) {}

  toString() {
    const decorators: string[] = [];
    if (this.params.primary) {
      if (this.params.primaryGenerated) {
        decorators.push(
          `\t@Typeorm.PrimaryGeneratedColumn(${this.columnOptions()})`
        );
      } else {
        decorators.push(`\t@Typeorm.PrimaryColumn(${this.columnOptions()})`);
      }
    } else {
      decorators.push(`\t@Typeorm.Column(${this.columnOptions()})`);
    }
    const isNullable = this.params.nullable ? "?" : "";
    return `${decorators.join("\n")}\n\t${
      this.params.name
    }${isNullable}: ${this.tsType()};`;
  }

  private tsType() {
    switch (this.params.type) {
      default:
        return "string";
    }
  }
  private columnOptions() {
    const type = this.params.typeMapper
      ? this.params.typeMapper(this.params.type)
      : this.params.type;
    const options = {
      name: this.params.columnName,
      type,
      nullable: this.params.nullable,
      default: this.params.default,
    };
    if (this.params.primary) {
      return `"${type}", ${JSON.stringify({ name: this.params.columnName })}`;
    }
    return JSON.stringify(options);
  }
}

export class EntityRelationGenerator {
  constructor(private params: EntityGenerateRelationParams) {}

  toString() {
    const isNullable = this.params.nullable ? "?" : "";
    const joinColumn =
      this.params.type === "ManyToOne" && this.params.joinColumn
        ? `\n\t@Typeorm.JoinColumn(${this.joinColumnOptions()})`
        : "";
    return `\t@Typeorm.${
      this.params.type
    }(${this.relationOptions()})${joinColumn}\n\t${
      this.params.name
    }${isNullable}: ${this.tsType()};`;
  }

  private tsType() {
    switch (this.params.type) {
      case "ManyToOne":
        return `${this.params.target}`;
      case "OneToMany":
        return `${this.params.target}[]`;
    }
  }

  private joinColumnOptions() {
    return JSON.stringify({ name: this.params.joinColumn });
  }
  private relationOptions() {
    const inverse = this.params.inverseField
      ? `, target => target.${this.params.inverseField}`
      : "";
    return `() => ${this.params.target}${inverse}`;
  }
}

export class EntityGenerator {
  private imports: Map<string, EntityImportGenerator> = new Map<
    string,
    EntityImportGenerator
  >();
  private columns: EntityColumnGenerator[] = [];
  private relations: EntityRelationGenerator[] = [];

  constructor(private params: EntityGenerateParams) {
    const primaries = this.primaries();
    this.addImport({
      allAs: "Typeorm",
      from: this.params.importTypeormFrom,
    });
    for (const importParams of params.imports || []) {
      this.addImport(importParams);
    }
    if (this.params.extend?.import) {
      this.addImport(this.params.extend.import);
    }
    for (const columnParams of params.columns) {
      this.columns.push(
        new EntityColumnGenerator({
          typeMapper: this.params.typeMapper,
          primaryGenerated: primaries.length < 2,
          ...columnParams,
        })
      );
    }
    for (const relationParams of params.relations) {
      this.relations.push(new EntityRelationGenerator(relationParams));
      if (relationParams.import) {
        this.addImport(relationParams.import);
      }
    }
  }

  toString() {
    const imports = Array.from(this.imports.values())
      .map((im) => im.toString())
      .join("\n");
    const fields = [
      ...this.columns.map((col) => col.toString()),
      ...this.relations.map((rel) => rel.toString()),
    ].join("\n\n");
    const extend = this.params.extend
      ? ` extend ${this.params.extend.name} `
      : " ";
    const decorators = [`@Typeorm.Entity(${this.options()})`];
    const index = this.index();
    if (index) {
      decorators.push(index);
    }

    const ignore = `/* tslint:disable */\n/* eslint-disable */\n// @ts-nocheck`;
    return `${ignore}\n${imports}\n\n${decorators.join("\n")}\nexport class ${
      this.params.name
    }${extend}{\n${fields}\n}`;
  }

  private options() {
    return this.params.table ? `"${this.params.table}"` : "";
  }

  private index() {
    const primaries = this.primaries();
    if (primaries.length >= 2) {
      return `@Typeorm.Index(${JSON.stringify(primaries)}, ${JSON.stringify({
        unique: true,
      })})`;
    }
  }

  private primaries() {
    return this.params.columns
      .filter((col) => col.primary)
      .map((col) => col.name);
  }

  private addImport(params: EntityGenerateImportParams) {
    const from = params.from;
    const exist = this.imports.get(from);
    if (exist) {
      for (const item of params.get || []) {
        exist.get(item);
      }
    } else {
      this.imports.set(from, new EntityImportGenerator(params));
    }
  }
}

export class EntitiesIndexGenerator {
  private imports: EntityImportGenerator[] = [];
  constructor(private props: GenerateEntitiesIndexProps) {
    this.imports = this.props.exports.map((p) => new EntityImportGenerator(p));
  }

  entities() {
    const entities: string[] = [];
    for (const e of this.props.exports) {
      for (const entity of e.get) {
        entities.push(entity);
      }
    }
    return `[\n\t${entities.join(",\n\t")}\n]`;
  }
  toString() {
    const imports = this.imports.map((i) => i.toString()).join("\n");
    const entities = this.entities();
    return `${imports}\n\nexport const entities = ${entities};`;
  }
}
