import { singular } from "pluralize";
import { capitalize, toCamelCase } from "../utils/string";

export const naming = {
  tableToEntityName(table: string) {
    return capitalize(toCamelCase(singular(table)));
  },

  tableToFilename(table: string) {
    return capitalize(toCamelCase(singular(table))) + ".entity";
  },
};
