import * as path from "path";
interface OffsuraConfig {
  versionFilePath: string;
  versionTable: string;
  cursorsTable: string;
  postgresSchemaName: string;
  tables: string[];
  waitForFirstReplication: boolean;
}

export const offsuraConfig: OffsuraConfig = {
  waitForFirstReplication: true,
  versionFilePath: path.resolve("var/version"),
  postgresSchemaName: "public",
  versionTable: "offsura_version",
  cursorsTable: "offsura_cursors",
  tables: ["products", "product_categories", "products_product_categories"]
};
