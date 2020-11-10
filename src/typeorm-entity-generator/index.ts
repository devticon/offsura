import {
  EntityGenerateImportParams,
  EntityGenerateParams,
  GenerateEntitiesIndexProps,
  Naming,
} from "./interfaces";
import * as fs from "fs";
import { EntitiesIndexGenerator, EntityGenerator } from "./generators";

function writeEntity(path: string, params: EntityGenerateParams) {
  const p = path.split("/");
  p.pop();
  fs.mkdirSync(p.join("/"), { recursive: true });
  fs.writeFileSync(path, new EntityGenerator(params).toString());
}

function writeIndex(path: string, params: GenerateEntitiesIndexProps) {
  fs.writeFileSync(
    `${path}/index.ts`,
    new EntitiesIndexGenerator(params).toString()
  );
}

export function writeEntities(
  path: string,
  params: EntityGenerateParams[],
  naming?: Naming
) {
  fs.mkdirSync(path, { recursive: true });
  const entityImports: EntityGenerateImportParams[] = [];
  for (const p of params) {
    const filename = naming ? naming.tableToFilename(p.table) : p.name;
    entityImports.push({
      from: `./${filename}`,
      get: [p.name],
    });
    writeEntity(`${path}/${filename}.ts`, p);
  }
  writeIndex(path, { exports: entityImports });
}
