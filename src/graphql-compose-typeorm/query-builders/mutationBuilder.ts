import {
  DeleteQueryBuilder,
  EntityMetadata,
  In,
  InsertQueryBuilder,
  QueryBuilder as BaseQueryBuilder,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from "typeorm/browser";
import { ObjectLiteral } from "typeorm/browser";
import { InsertOnConflictArg, MutationResponse } from "../interfaces";
import { QueryBuilder } from "./QueryBuilder";
import { QueryDeepPartialEntity } from "typeorm/browser/query-builder/QueryPartialEntity";

class MutationBuilder<T = any> extends QueryBuilder<T> {
  protected queryBuilder:
    | InsertQueryBuilder<T>
    | UpdateQueryBuilder<T>
    | DeleteQueryBuilder<T>
    | SelectQueryBuilder<T>;

  insert() {
    this.queryBuilder = this.queryBuilder.insert();
    return this;
  }

  update() {
    this.queryBuilder = this.queryBuilder.update();
    return this;
  }

  delete() {
    this.queryBuilder = this.queryBuilder.delete();
    return this;
  }

  values(values: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[]) {
    if (!(this.queryBuilder instanceof InsertQueryBuilder)) {
      throw new Error("values can use only on InsertQuery");
    }
    this.queryBuilder.values(
      Array.isArray(values) ? [...values] : { ...values }
    );
    return this;
  }

  set(values: QueryDeepPartialEntity<T>) {
    if (!(this.queryBuilder instanceof UpdateQueryBuilder)) {
      throw new Error("values can use only on InsertQuery");
    }
    this.queryBuilder.set(values);
    return this;
  }

  onConflict(params?: InsertOnConflictArg) {
    if (!(this.queryBuilder instanceof InsertQueryBuilder)) {
      throw new Error("values can use only on InsertQuery");
    }
    if (params) {
      this.queryBuilder.orUpdate({
        columns: params.update_columns,
        conflict_target: this.entityMetadata.primaryColumns.map(
          (p) => p.propertyName
        ),
      });
    }
    return this;
  }

  async getMutationResponse(): Promise<MutationResponse> {
    const { identifiers } = await this.queryBuilder.execute();

    return {
      affected_rows: identifiers.length,
      returning: await this.getRepository().find({
        where: identifiers,
      }),
    };
  }

  async getOne(): Promise<T> {
    const {
      identifiers: [id],
    } = await this.queryBuilder.execute();
    return this.getRepository().findOneOrFail(id);
  }
}

export function createMutationBuilder(entityMetadata: EntityMetadata) {
  return new MutationBuilder(entityMetadata);
}
