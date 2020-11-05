import {QueryBuilder, Value} from "knex";

export interface GraphqlWhereExp {
  _eq?: string,
  _like?: string,
  _ilike?: string,
  _qt?: string,
  _qte?: string,
  _lt?: string,
  _lte?: string,
  _in?: string[],
  _is_nul?: boolean,
  _neq?: string,
  _nilike?: string,
  _nin?: string[],
}

enum ExpType {
  and = "_and",
  or = "_or"
}
export function applyWhereExp(queryBuilder: QueryBuilder, column: string | ExpType, exp: GraphqlWhereExp | GraphqlWhereExp[], type = ExpType.and) {
  switch (column) {
    case ExpType.and:
    case ExpType.or:
      // console.log(column, exp);
      queryBuilder.where(qb => {
      for (const _exp of exp as GraphqlWhereExp[]) {
          for (const _column of Object.keys(_exp)) {
            console.log(_column, _exp[_column], column);
            applyWhereExp(qb, _column, _exp[_column], column as ExpType)
          }
        }
      });
      return;
  }
  for (const expType of Object.keys(exp)) {
    const value = exp[expType];
    const apply = {
      where(columnName: string, operator: string, value: Value | null) {
        if (type === ExpType.and) {
          queryBuilder.where(columnName, operator, value);
        } else {
          queryBuilder.orWhere(columnName, operator, value);
        }
      },
      whereNot(columnName: string, operator: string, value: Value | null) {
        if (type === ExpType.and) {
          queryBuilder.whereNot(columnName, operator, value);
        } else {
          queryBuilder.orWhereNot(columnName, operator, value);
        }
      },
      whereNull(columnName: string) {
        if (type === ExpType.and) {
          queryBuilder.whereNull(columnName);
        } else {
          queryBuilder.orWhereNull(columnName);
        }
      },
      whereIn(columnName: string, value: any[]) {
        if (type === ExpType.and) {
          queryBuilder.whereIn(columnName, value);
        } else {
          queryBuilder.orWhereIn(columnName, value);
        }
      },
      whereNotIn(columnName: string, value: any[]) {
        if (type === ExpType.and) {
          queryBuilder.whereNotIn(columnName, value);
        } else {
          queryBuilder.orWhereNotIn(columnName, value);
        }
      }
    }
    switch (expType) {
      case "_eq":
        apply.where(column, '=', value)
        break;
      case "_like":
        apply.where(column, 'like', value)
        break;
      case "_ilike":
        apply.where(column, 'ilike', value)
        break;
      case "_qt":
        apply.where(column, '>', value)
        break;
      case "_qte":
        apply.where(column, '>=', value)
        break;
      case "_lt":
        apply.where(column, '<', value)
        break;
      case "_lte":
        apply.where(column, '<=', value)
        break;
      case "_in":
        apply.whereIn(column, value)
        break;
      case "_is_nul":
        apply.whereNull(column)
        break;
      case "_neq":
        apply.where(column, '<>', value)
        break;
      case "_nilike":
        apply.whereNot(column, 'ilike', value)
        break;
      case "_nin":
        apply.whereNotIn(column, value);
        break;
    }
  }
}
