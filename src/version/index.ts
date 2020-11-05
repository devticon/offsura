import { promises as fs } from "fs";
import { offsuraConfig } from "../offsura";
import { TableMetadata } from "./interfaces";

let metadata: any;

export function getVersionName() {
  return fs
    .readFile(`${offsuraConfig.versionFilePath}/version`)
    .then(buf => buf.toString());
}

export function getVersionMetadata(): Record<string, TableMetadata> {
  if (metadata) {
    return metadata;
  }
  metadata = require(`${offsuraConfig.versionFilePath}/metadata.json`);
  return metadata;
}

export function getTableMetadata(table: string) {
  const meta = getVersionMetadata();
  const tableMeta = meta[table];
  if (!tableMeta) {
    throw new Error(`Table metadata ${table} not found`);
  }
  return tableMeta;
}
