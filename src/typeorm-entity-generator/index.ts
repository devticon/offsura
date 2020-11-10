import { EntityGenerateParams } from "./interfaces";
import * as fs from "fs";
import { EntityGenerator } from "./generators";

export function writeEntity(path: string, params: EntityGenerateParams) {
  const p = path.split("/");
  p.pop();
  fs.mkdirSync(p.join("/"), { recursive: true });
  fs.writeFileSync(path, new EntityGenerator(params).toString());
}
