import { schemaComposer } from "graphql-compose";
import { InputTypeComposer } from "graphql-compose/lib/InputTypeComposer";

function generate(type: string) {
  return schemaComposer.createInputTC({
    name: `${type}_comparison_exp`,
    fields: {
      _eq: type,
      _like: type,
      _ilike: type,
      _qt: type,
      _qte: type,
      _lt: type,
      _lte: type,
      _in: `[${type}!]`,
      _is_nul: "Boolean",
      _neq: type,
      _nilike: type,
      _nin: `[${type}!]`,
    },
  });
}
const comparisonExpMap: Record<string, InputTypeComposer> = {
  uuid: generate("uuid"),
  String: generate("String"),
  Int: generate("Int"),
  Boolean: generate("Boolean"),
};

export function getComparisonExp(type: string) {
  if (!comparisonExpMap[type]) {
    throw new Error(`cannot found comparisonExp ${type}`);
  }
  return comparisonExpMap[type];
}
