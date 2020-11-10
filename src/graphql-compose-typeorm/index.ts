import { Connection } from "typeorm/browser";
import { schemaComposer } from "graphql-compose";
import { buildConnectionResolver } from "./buildConnectionResolver";
import { buildType } from "./buildType";
import { buildRelations } from "./buildRelations";

export function buildSchema(connection: Connection) {
  for (const entityMetadata of connection.entityMetadatas) {
    buildType(entityMetadata);
  }
  for (const entityMetadata of connection.entityMetadatas) {
    const resolver = buildConnectionResolver(entityMetadata);
    schemaComposer.Query.addFields({
      [`${entityMetadata.name}_connection`]: resolver,
    });
  }
  for (const entityMetadata of connection.entityMetadatas) {
    buildRelations(entityMetadata);
  }
  return schemaComposer.buildSchema();
}
