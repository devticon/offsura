import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return Promise.all([
    knex.schema.createTable("product", tableBuilder => {
      tableBuilder.uuid("id").primary();
      tableBuilder.string("name");
      tableBuilder.bigInteger("price");
      tableBuilder.timestamp("updated_at");
    }),
    knex.schema.createTable("product_category", tableBuilder => {
      tableBuilder.uuid("id").primary();
      tableBuilder.string("name");
      tableBuilder.timestamp("updatedAt");
    }),
    knex.schema.createTable("product_product_category", tableBuilder => {
      tableBuilder
        .uuid("product_id")
        .unsigned()
        .references("id")
        .inTable("product_id")
        .primary();
      tableBuilder
        .uuid("category_id")
        .unsigned()
        .references("id")
        .inTable("product_category")
        .primary();
    })
  ]).then(() => {});
}

export async function down(knex: Knex): Promise<void> {
  return Promise.all([
    knex.schema.dropTable("product"),
    knex.schema.dropTable("product_category"),
    knex.schema.dropTable("product_product_category")
  ]).then(() => {});
}
