import { initOffsura } from "../index";
import { getConnection } from "typeorm/browser";
import { getSchema } from "../schema";
import { writeFileSync } from "fs";
import { printSchema } from "graphql";
import { loadOffsuraConfig } from "./load-config";
import { tsImport } from "ts-import";

export async function generateSchema() {
  const config = loadOffsuraConfig();
  const { entities } = await tsImport.compile(
    config.replication.entitiesDir + "/index.ts"
  );
  if (config.typeorm.type === "react-native") {
    config.typeorm = {
      type: "sqlite",
      database: config.versionFilePath + "/sqlite",
      synchronize: true,
      entities: entities,
    };
  }
  // @ts-ignore
  config.typeorm.entities = entities;
  await initOffsura({
    ...config,
    typeorm: {
      ...config.typeorm,
      logging: false,
    },
  });
  const connection = getConnection();
  const schema = getSchema(connection);
  await connection.close();
  writeFileSync("schema.graphql", printSchema(schema));
}
