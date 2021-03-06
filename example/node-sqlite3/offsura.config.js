module.exports = {
  versionFilePath: ".offsura",
  usePlainRelayId: true,
  replication: {
    hasura: {
      url: "https://hasura.test.novitus.devticon.com",
    },
    entitiesDir: "entities",
    tables: [
      "product_categories",
      "products",
      "products_product_categories",
      "orders",
      "orders_items",
      "payment_methods",
      "partners",
    ],
  },
  typeorm: {
    type: "sqlite",
    database: "sqlite",
    synchronize: true,
    logging: true,
  },
};
