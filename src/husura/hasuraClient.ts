import fetch from "node-fetch";
import {offsuraConfig} from "../config";

export const hasuraClient = {
  metadata(tables: string[]) {
    return fetch(offsuraConfig.hasura.url + "/v1/query", {
      method: "POST",
      body: JSON.stringify({ type: "export_metadata", args: {} })
    })
      .then(res => res.json())
      .then(meta => {
        meta.tables = meta.tables.filter(t => tables.includes(t.table.name));
        return meta;
      });
  },

  runSql(sql: string) {
    return fetch(offsuraConfig.hasura.url + "/v1/query", {
      method: "POST",
      body: JSON.stringify({ type: "run_sql", args: { sql } })
    })
      .then(res => res.json())
      .then(({ result }) => {
        result.shift();
        return result;
      });
  }
};
