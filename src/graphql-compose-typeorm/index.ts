import { Connection } from "typeorm/browser";
import { schemaComposer } from "graphql-compose";
import { buildType } from "./buildType";
import { buildRelations } from "./buildRelations";
import { buildConnection } from "./buildConnection";
import { buildMutations } from "./buildMutations";
import { ReplicationCursor } from "../entities/ReplicationCursor";
import { ReplicationMutation } from "../entities/ReplicationMutation";
import { buildScalars } from "./scalars";

export function buildSchema(connection: Connection) {
  buildScalars();
  const entityMetadatas = connection.entityMetadatas.filter(
    (meta) =>
      ![ReplicationCursor.name, ReplicationMutation.name].includes(meta.name)
  );
  for (const entityMetadata of entityMetadatas) {
    buildType(entityMetadata);
  }
  for (const entityMetadata of entityMetadatas) {
    buildConnection(entityMetadata);
  }
  for (const entityMetadata of entityMetadatas) {
    buildRelations(entityMetadata);
  }
  for (const entityMetadata of entityMetadatas) {
    buildMutations(entityMetadata);
  }
  return schemaComposer.buildSchema();
}
