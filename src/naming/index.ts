import { singular } from "pluralize";
import { capitalize, toCamelCase } from "../utils/string";
import { Naming } from "../typeorm-entity-generator/interfaces";

export const naming: Naming = {
  tableToEntityName(table: string) {
    return capitalize(toCamelCase(singular(table)));
  },

  tableToFilename(table: string) {
    return capitalize(toCamelCase(singular(table))) + ".entity";
  },
};
