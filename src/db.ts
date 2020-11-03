import * as Knex from "knex";
import knexfile from "./knexfile";
import { offsuraConfig } from "./offsura";
import * as fs from "fs/promises";

export async function init() {
  const knex = Knex(knexfile.development);
  try {
    const { version } = await knex(offsuraConfig.versionTable).first();
    const fileVersion = await getVersionName();
    if (version !== fileVersion) {
      console.log("new db version found. upgrading...", {
        old: version,
        new: fileVersion
      });
      await knex.destroy();
      await fs.unlink(knexfile.development.connection.filename); // TODO
      const upgradeKnex = Knex(knexfile.development);
      await setup(upgradeKnex);
      await upgradeKnex.destroy();
      return init();
    }
    console.log("db ready", { version });
  } catch (e) {
    console.log(e);
    await setup(knex);
  }
}

async function setup(knex: Knex) {
  await knex.transaction(async trx => {
    const newVersionName = await getVersionName();
    const newVersionDump = await getVersionDump(newVersionName);
    console.log("installing new version", { version: newVersionName });
    await trx.schema.createTable(offsuraConfig.versionTable, tableBuilder => {
      tableBuilder.string("version").primary();
      tableBuilder.timestamp("upgraded_at");
    });
    await trx.raw(newVersionDump);
    await trx(offsuraConfig.versionTable).insert({
      version: newVersionName,
      upgraded_at: new Date().toISOString()
    });
  });
  console.log("version installed");
}

async function getVersionName() {
  const [filename] = await fs.readdir(offsuraConfig.dumpDir);
  return filename.replace(".sql", "");
}

async function getVersionDump(versionName) {
  return (
    await fs.readFile(`${offsuraConfig.dumpDir}/${versionName}.sql`)
  ).toString();
}
