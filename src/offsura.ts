import * as path from "path";
interface OffsuraConfig {
  dumpDir: string;
  versionTable: string;
  postgresSchemaName: string;
  tables: string[];
}

export const offsuraConfig: OffsuraConfig = {
  dumpDir: path.resolve("var/dump"),
  postgresSchemaName: "public",
  versionTable: "offsura_version",
  tables: ["products"]
};
