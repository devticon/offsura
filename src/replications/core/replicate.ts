import { knex } from "../../db";
import { query } from "./query";

export interface ToApply {
  table: string;
  data: any[];
}

export async function apply(data: ToApply[]) {
  for (const item of data) {
    if (item.data.length) {
    }
  }
}
export async function replicate(
  name: string,
  updatedAtCol: string = "updated_at",
  modify?: (data: any) => Promise<ToApply[]>
) {
  while (true) {
    const doc = await knex(name)
      .select(updatedAtCol)
      .orderBy(updatedAtCol, "desc")
      .first();

    const timestamp = doc ? doc[updatedAtCol] : new Date(0).toISOString();
    const { data, errors } = await query(name, { timestamp });
    if (errors) {
      console.log(errors);
      throw new Error("gql error");
    }
    const [key] = Object.keys(data);
    await apply(data[key]);
  }
}
