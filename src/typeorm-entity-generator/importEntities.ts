import { exec } from "child_process";
import { resolve, join } from "path";
import { OffsuraConfig } from "../interfaces";
import { ObjectType } from "typeorm";

export async function importEntities(
  config: OffsuraConfig
): Promise<ObjectType<any>[]> {
  const input = resolve(join(config.replication.entitiesDir, "index.ts"));
  const output = resolve(join(config.versionFilePath, "entities"));
  return new Promise((done, reject) => {
    const cmd = `npx typescript  "${input}" -outDir "${output}"`;
    console.log(cmd);
    exec(cmd, (error) => {
      if (error) console.log(error);
      const { entities } = require(output);
      done(entities);
    });
  });
}
