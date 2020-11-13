import { initOffsura } from "../index";
import { getConnection } from "typeorm/browser";
import { getOffsuraSchema } from "../schema";
import { writeFileSync } from "fs";
import { printSchema } from "graphql";
import { OffsuraConfig } from "../interfaces";
import { importEntities } from "./importEntities";

export async function generateSchema(config: OffsuraConfig) {
  const entities = await importEntities(config);
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
  const schema = getOffsuraSchema(connection);
  await connection.close();
  writeFileSync("schema.graphql", printSchema(schema));
}
