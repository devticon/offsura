import { schemaComposer } from "graphql-compose";

export function buildScalars() {
  schemaComposer.createScalarTC({
    name: "uuid",
  });
}
