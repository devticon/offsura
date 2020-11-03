import { getConnection, initConnection } from "./db";
import { replicate } from "./replications/core/replicate";
import { offsuraConfig } from "./offsura";

async function main() {
  console.time("db init");
  await initConnection();
  console.timeEnd("db init");

  for (const table of offsuraConfig.tables) {
    const count = await getConnection()(table).count();
    console.log(`${table} count`, count);
  }
}
main();
