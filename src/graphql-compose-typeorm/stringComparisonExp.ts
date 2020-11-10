import { schemaComposer } from "graphql-compose";

export const stringComparisonExp = schemaComposer.createInputTC({
  name: "String_comparison_exp",
  fields: {
    _eq: "String",
    _like: "String",
    _ilike: "String",
    _qt: "String",
    _qte: "String",
    _lt: "String",
    _lte: "String",
    _in: "[String!]",
    _is_nul: "Boolean",
    _neq: "String",
    _nilike: "String",
    _nin: "[String!]",
  },
});
