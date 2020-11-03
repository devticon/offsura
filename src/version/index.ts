import { promises as fs } from "fs";
import { offsuraConfig } from "../offsura";
import { TableMetadata } from "./interfaces";

let metadata: any;

export function getVersionName() {
  return fs
    .readFile(`${offsuraConfig.versionFilePath}/version`)
    .then(buf => buf.toString());
}

export function getVersionMetadata(): Promise<Record<string, TableMetadata>> {
  if (metadata) {
    return metadata;
  }
  return fs
    .readFile(`${offsuraConfig.versionFilePath}/metadata.json`)
    .then(buf => buf.toString())
    .then(str => JSON.parse(str))
    .then(json => {
      metadata = json;
      return json;
    });
}

export async function getTableMetadata(table: string) {
  const meta = await getVersionMetadata();
  const tableMeta = meta[table];
  if (!tableMeta) {
    throw new Error(`Table metadata ${table} not found`);
  }
  return tableMeta;
}
