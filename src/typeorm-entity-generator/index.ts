import { EntityGenerateParams } from "./interfaces";
import * as fs from "fs";
import { EntityGenerator } from "./generators";

export function writeEntity(path: string, params: EntityGenerateParams) {
  fs.writeFileSync(path, new EntityGenerator(params).toString());
}
