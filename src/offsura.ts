import * as path from "path";
interface OffsuraConfig {
  versionFilePath: string;
  versionTable: string;
  postgresSchemaName: string;
  tables: string[];
}

export const offsuraConfig: OffsuraConfig = {
  versionFilePath: path.resolve("var/version"),
  postgresSchemaName: "public",
  versionTable: "offsura_version",
  tables: ["products"]
};
