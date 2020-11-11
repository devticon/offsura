import { initOffsura } from "../index";
import { getConnection } from "typeorm/browser";
import { getSchema } from "../schema";
import { writeFileSync } from "fs";
import { printSchema } from "graphql";
import { tsImport } from "ts-import";
import { OffsuraConfig } from "../interfaces";

export async function generateSchema(config: OffsuraConfig) {
  const { entities } = await tsImport.compile(
    config.replication.entitiesDir + "/index.ts"
  );
  if (config.typeorm.type === "react-native") {
    config.typeorm = {
      type: "sqlite",
      database: config.versionFilePath + "/sqlite",
      synchronize: true,
    };
  }
  await initOffsura(
    {
      ...config,
      typeorm: {
        ...config.typeorm,
        logging: false,
      },
    },
    { entities }
  );
  const connection = getConnection();
  const schema = getSchema(connection);
  await connection.close();
  writeFileSync("schema.graphql", printSchema(schema));
}
