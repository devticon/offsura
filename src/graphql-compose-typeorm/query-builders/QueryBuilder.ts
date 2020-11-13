import {
  Brackets,
  DeleteQueryBuilder,
  EntityMetadata,
  In,
  InsertQueryBuilder,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  ObjectLiteral,
  QueryBuilder as BaseQueryBuilder,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from "typeorm/browser";
import { StringExp, WhereArg } from "../interfaces";
import { Equal } from "typeorm";

enum ExpType {
  and = "_and",
  or = "_or",
}

export abstract class QueryBuilder<T> {
  protected queryBuilder:
    | SelectQueryBuilder<T>
    | InsertQueryBuilder<T>
    | UpdateQueryBuilder<T>
    | DeleteQueryBuilder<T>;
  protected alias: string;

  constructor(protected entityMetadata: EntityMetadata) {
    this.alias = entityMetadata.name;
    this.queryBuilder = this.getRepository().createQueryBuilder(this.alias);
  }

  toNative() {
    return this.queryBuilder;
  }

  applyWhere(where: WhereArg) {
    for (const [column, exp] of Object.entries(where)) {
      this.applyColumnWhere(column, exp);
    }
    return this;
  }

  applyPk(pk?: ObjectLiteral) {
    if (this.queryBuilder instanceof InsertQueryBuilder) {
      throw new Error("Cannot apply where to InsertQueryBuilder");
    }
    if (pk) {
      for (const [column, value] of Object.entries(pk)) {
        this.queryBuilder.andWhere({ [column]: Equal(value) } as any);
      }
    }
    return this;
  }

  protected getRepository() {
    return this.entityMetadata.connection.getRepository<T>(
      this.entityMetadata.name
    );
  }

  protected prefix(field: string) {
    return `${this.entityMetadata.name}.${field}`;
  }

  private applyColumnWhere<T = any>(
    column: string | ExpType,
    exp: StringExp | StringExp[],
    type = ExpType.and
  ) {
    if (this.queryBuilder instanceof InsertQueryBuilder) {
      throw new Error("Cannot apply where to InsertQueryBuilder");
    }
    if (column === ExpType.or || column === ExpType.and) {
      this.queryBuilder.where(
        new Brackets((_queryBuilder) => {
          for (const _exp of exp as StringExp[]) {
            for (const _column of Object.keys(_exp)) {
              this.applyColumnWhere(_column, _exp[_column], column as ExpType);
            }
          }
        })
      );
    }

    const where = (parameters: any) => {
      if (type === ExpType.and) {
        // @ts-ignore
        this.queryBuilder.andWhere(parameters);
      } else {
        // @ts-ignore
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
