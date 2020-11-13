import { initConnection } from "./db";
import { ExecutionResult, graphql } from "graphql";
import { setGlobalConfig } from "./config";
import { OffsuraConfig, OffsuraRuntimeConfig } from "./interfaces";
import { Connection } from "typeorm/browser";
import { getOffsuraSchema } from "./schema";
export { startReplication } from "./typeorm-hasura-replication";
export * from "./interfaces";
export { getOffsuraSchema };

let connection: Connection;
export async function initOffsura(
  config: OffsuraConfig,
  runtimeConfig: OffsuraRuntimeConfig
) {
  config.typeorm.entities = runtimeConfig.entities;
  config.replication.webSocketImpl = runtimeConfig.webSocketImpl;
  setGlobalConfig(config);
  connection = await initConnection(config.typeorm);
  getOffsuraSchema(connection);

  return { connection };
}

export function offsura(
  source: string,
  variableValues = {}
): Promise<ExecutionResult> {
  const schema = getOffsuraSchema(connection);
  return graphql({ schema, source, variableValues });
}
