import { createConnection } from "typeorm/browser";
import { ReplicationCursor } from "./entities/ReplicationCursor";
import { TypeormConfig } from "./interfaces";

export async function initConnection(config: TypeormConfig) {
  config.entities = [...config.entities, ReplicationCursor];
  const connection = await createConnection(config);
  return connection;
  // try {
  //   const { version } = await connection
  //     .get(offsuraConfig.versionTable)
  //     .first();
  //   const fileVersion = await getVersionName();
  //   if (version !== fileVersion) {
  //     console.log("new db version found. upgrading...", {
  //       old: version,
  //       new: fileVersion,
  //     });
  //     await connection.destroy();
  //     // @ts-ignore
  //     await fs.unlink(offsuraConfig.typeorm.connection.filename); // TODO
  //     const upgradeKnex = Knex(offsuraConfig.typeorm);
  //     await setup(upgradeKnex);
  //     await upgradeKnex.destroy();
  //     return initConnection();
  //   }
  //   console.log("db ready", { version });
  // } catch (e) {
  //   console.log(e);
  //   await setup(connection);
  // }
}
//
// async function setup(knex: Knex) {
//   await knex.transaction(async (trx) => {
//     const version = await getVersionName();
//
//     console.log("installing new version", { version });
//     await trx.schema.createTable(offsuraConfig.versionTable, (tableBuilder) => {
//       tableBuilder.string("version").primary();
//       tableBuilder.timestamp("upgraded_at");
//     });
//     await trx.schema.createTable(offsuraConfig.cursorsTable, (tableBuilder) => {
//       tableBuilder.string("table").primary();
//       tableBuilder.string("cursor");
//     });
//
//     for (const table of offsuraConfig.replication.tables) {
//       const tableMetadata = await getTableMetadata(table);
//       await trx.schema.createTable(tableMetadata.table, (tableBuilder) => {
//         for (const column of tableMetadata.columns) {
//           const col = tableBuilder.specificType(column.name, column.type);
//           if (column.isNullable) {
//             col.nullable();
//           }
//         }
//         tableBuilder.primary(tableMetadata.primaryKeys);
//       });
//     }
//     await trx(offsuraConfig.versionTable).insert({
//       version: version,
//       upgraded_at: new Date().toISOString(),
//     });
//   });
//   console.log("version installed");
//
//   if (offsuraConfig.waitForFirstReplication) {
//     console.log("start replication");
//     const replications: Promise<void>[] = [];
//     for (const table of offsuraConfig.replication.tables) {
//       replications.push(replicate(table));
//     }
//     await Promise.all(replications);
//   }
// }
