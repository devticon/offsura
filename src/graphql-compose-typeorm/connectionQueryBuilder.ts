import { SelectQueryBuilder } from "typeorm/browser";
import { OrderByArg, StringExp, WhereArg } from "./interfaces";
import { WhereExpression } from "typeorm/query-builder/WhereExpression";
import {
  Brackets,
  EntityMetadata,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from "typeorm/browser";
import { GraphqlWhereExp } from "../../dist/src/graphql-compose-typeorm/applyWhereExp";

enum ExpType {
  and = "_and",
  or = "_or",
}
export class ConnectionQueryBuilder<T = any> {
  constructor(protected queryBuilder: SelectQueryBuilder<T>) {}

  applyOrderBy(orderBy?: OrderByArg) {
    if (!orderBy) {
      for (const [column, sort] of Object.entries(orderBy)) {
        this.queryBuilder.addOrderBy(column, sort);
      }
    }
    return this;
  }

  applyWhere(where: WhereArg) {
    for (const [column, exp] of Object.entries(where)) {
      this.applyColumnWhere(column, exp);
    }
  }

  private applyColumnWhere<T = any>(
    column: string | ExpType,
    exp: StringExp | StringExp[],
    type = ExpType.and
  ) {
    if (column === ExpType.or || column === ExpType.and) {
      this.queryBuilder.where(
        new Brackets((_queryBuilder) => {
          for (const _exp of exp as GraphqlWhereExp[]) {
            for (const _column of Object.keys(_exp)) {
              this.applyColumnWhere(_column, _exp[_column], column as ExpType);
            }
          }
        })
      );
    }

    const where = (parameters: any) => {
      if (type === ExpType.and) {
        this.queryBuilder.andWhere(parameters);
      } else {
        this.queryBuilder.orWhere(parameters);
      }
    };
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
}

export function createConnectionQueryBuilder(entityMetadata: EntityMetadata) {
  return new ConnectionQueryBuilder(
    entityMetadata.connection
      .getRepository(entityMetadata.name)
      .createQueryBuilder(entityMetadata.name)
  );
}
