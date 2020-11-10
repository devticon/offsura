import { SelectionNode } from "graphql/language/ast";
import { EntityMetadata } from "typeorm";

interface QuerySelectionSet {
  columns: string[];
  oneToMany: QuerySelectionSet[];
  manyToOne: QuerySelectionSet[];
}

export function parseNode(
  node: SelectionNode,
  entityMetadata: EntityMetadata
) {}
