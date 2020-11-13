import {
  Brackets,
  EntityMetadata,
  Equal,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  ObjectLiteral,
  SelectQueryBuilder,
} from "typeorm/browser";
import {
  ConnectionArgs,
  ConnectionResult,
  OrderByArg,
  StringExp,
  WhereArg,
} from "../interfaces";
import { QueryBuilder } from "./QueryBuilder";

enum ExpType {
  and = "_and",
  or = "_or",
}
export class ConnectionQueryBuilder<T = any> extends QueryBuilder<T> {
  protected _last: number;
  protected _first: number;
  protected _before: string;
  protected _after: string;
  protected _order_fields: string[] = [];
  protected queryBuilder: SelectQueryBuilder<T>;

  applyArgs({ order_by, where, last, first, after, before }: ConnectionArgs) {
    if (order_by) this.applyOrderBy(order_by);
    if (where) this.applyWhere(where);
    if (first) this.applyFirst(first);
    if (last) this.applyLast(last);
    if (after) this.applyAfter(after);
    if (before) this.applyBefore(before);
    return this;
  }

  applySource(source?: ObjectLiteral) {
    if (!source) {
      return this;
    }
    const relation = this.entityMetadata.relations.find((relation) => {
      return relation.inverseEntityMetadata.name === source.constructor.name;
    });
    if (!relation) {
      throw new Error(
        `Cannot find relation by source: ${source.constructor.name}`
      );
    }
    for (const joinColumn of relation.joinColumns) {
      this.queryBuilder.andWhere({
        [joinColumn.propertyName]: Equal(
          source[joinColumn.referencedColumn.propertyName]
        ),
      } as any);
    }

    return this;
  }

  applyFirst(first: number) {
    if (first < 0) throw new Error("first cannot by less ten 0");
    this.queryBuilder.limit(first + 1);
    this._first = first;
  }

  applyLast(last: number) {
    this._last = last;
    throw new Error("last is not supported right now");
  }

  applyAfter(after: string) {
    const pre: string[] = [];
    const decoded = this.decodeCursor(after);
    let sql: string;
    for (const [field, value] of Object.entries(decoded)) {
      const preSql = pre.map(
        (preField) => `${this.prefix(preField)} = '${decoded[preField]}'`
      );
      if (pre.length === 0) {
        sql = `(${this.prefix(field)} > '${value}')`;
      } else {
        sql = `((${preSql.join(" AND ")}) AND ${this.prefix(
          field
        )} > '${value}' OR ${this.prefix(pre[0])} > '${decoded[pre[0]]}')`;
      }
      pre.push(field);
    }
    this.queryBuilder.andWhere(sql);
    this._after = after;
  }

  applyBefore(before: string) {
    for (const [field, value] of Object.entries(this.decodeCursor(before))) {
      this.queryBuilder.andWhere({
        [field]: LessThan(value),
      } as any);
    }
    this._before = before;
  }

  applyOrderBy(orderBy: OrderByArg) {
    const [field, sort] = Object.entries(orderBy)[0];
    this.queryBuilder.addOrderBy(this.prefix(field), sort);
    this._order_fields.push(field);
    for (const { propertyName } of this.entityMetadata.primaryColumns) {
      this.queryBuilder.addOrderBy(this.prefix(propertyName), sort);
      this._order_fields.push(propertyName);
    }
    return this;
  }

  async getConnection(): Promise<ConnectionResult<T>> {
    const entities = await this.queryBuilder.getMany();
    let endCursor: string;
    let hasNextPage = false;
    let hasPreviousPage = true;
    if (this._last && this._last > entities.length) {
      entities.shift();
      hasPreviousPage = true;
    }
    if (this._first && this._first < entities.length) {
      entities.pop();
      hasNextPage = true;
    }
    return {
      edges: entities.map((entity) => {
        endCursor = this.encodeCursor(entity);
        return {
          cursor: endCursor,
          node: entity,
        };
      }),
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        endCursor,
      },
    };
  }

  protected encodeCursor(entity: T) {
    let payload: Record<string, any> = {};
    for (const column of this._order_fields) {
      payload[column] = entity[column];
    }
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }

  protected decodeCursor(cursor: string) {
    return JSON.parse(Buffer.from(cursor, "base64").toString());
  }
}

export function createConnectionQueryBuilder(entityMetadata: EntityMetadata) {
  return new ConnectionQueryBuilder(entityMetadata);
}
