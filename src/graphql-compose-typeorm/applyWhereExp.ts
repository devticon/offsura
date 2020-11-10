import {
  Brackets,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  SelectQueryBuilder,
} from "typeorm/browser";
import { WhereExpression } from "typeorm/query-builder/WhereExpression";

export interface GraphqlWhereExp {
  _eq?: string;
  _like?: string;
  _ilike?: string;
  _qt?: string;
  _qte?: string;
  _lt?: string;
  _lte?: string;
  _in?: string[];
  _is_nul?: boolean;
  _neq?: string;
  _nilike?: string;
  _nin?: string[];
}

enum ExpType {
  and = "_and",
  or = "_or",
}
export function applyWhereExp<T = any>(
  queryBuilder: SelectQueryBuilder<T> | WhereExpression,
  column: string | ExpType,
  exp: GraphqlWhereExp | GraphqlWhereExp[],
  type = ExpType.and
) {
  if (column === ExpType.or || column === ExpType.and) {
    queryBuilder.orWhere(
      new Brackets((_queryBuilder) => {
        for (const _exp of exp as GraphqlWhereExp[]) {
          for (const _column of Object.keys(_exp)) {
            applyWhereExp(
              _queryBuilder,
              _column,
              _exp[_column],
              column as ExpType
            );
          }
        }
      })
    );
  }

  function where(parameters: any) {
    if (type === ExpType.and) {
      queryBuilder.andWhere(parameters);
    } else {
      queryBuilder.orWhere(parameters);
    }
  }
  for (const expType of Object.keys(exp)) {
    const value = exp[expType];
    switch (expType) {
      case "_eq":
        where({ [column]: value });
        break;
      case "_like":
        where({ [column]: Like(value) });
        break;
      case "_ilike":
        where({ [column]: Like(value) });
        break;
      case "_qt":
        where({ [column]: MoreThan(value) });
        break;
      case "_qte":
        where({ [column]: MoreThanOrEqual(value) });
        break;
      case "_lt":
        where({ [column]: LessThan(value) });
        break;
      case "_lte":
        where({ [column]: LessThanOrEqual(value) });
        break;
      case "_in":
        where({ [column]: In(value) });
        break;
      case "_is_nul":
        where({ [column]: IsNull() });
        break;
      case "_neq":
        where(Not({ [column]: value }));
        break;
      case "_nilike":
        where(Not({ [column]: Like(value) }));
        break;
      case "_nin":
        where(Not({ [column]: In(value) }));
        break;
    }
  }
}
