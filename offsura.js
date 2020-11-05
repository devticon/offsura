module.exports = {
  hasura: {
    url: "https://hasura.test.novitus.devticon.com"
  },
  replication: {
    tables: ["product_categories", "products", "products_product_categories"],
  },
  knexConfig: {
    client: "sqlite3",
      useNullAsDefault: false,
      connection: {
      filename: "sqlite"
    }
  }
}
