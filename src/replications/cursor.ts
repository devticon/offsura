import { getConnection } from "../db";
import { offsuraConfig } from "../config";

export async function saveCursor(table: string, cursor: string) {
  console.log(table, cursor);
  const updatedCount = await getConnection()(offsuraConfig.cursorsTable)
    .where("table", "=", table)
    .update({ cursor });
  if (!updatedCount) {
    await getConnection()(offsuraConfig.cursorsTable).insert({ table, cursor });
  }
}

export async function getCursor(table: string) {
  const { cursor } =
    (await getConnection()(offsuraConfig.cursorsTable)
      .where("table", "=", table)
      .first()) || {};
  return cursor;
}
