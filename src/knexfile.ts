import * as path from "path";

console.log(path.resolve("sqlite3"));
export default {
  development: {
    client: "sqlite3",
    useNullAsDefault: false,
    migrations: {
      directory: __dirname + "/migrations",
      extension: "ts"
    },
    connection: {
      filename: "sqlite"
    }
  }
};
