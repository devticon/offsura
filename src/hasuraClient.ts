import fetch from "node-fetch";

const URL = "https://hasura.test.novitus.devticon.com";

interface DumpProps {
  tables: string[];
  schemaName: string;
}

export const hasuraClient = {
  dump({ tables, schemaName }: DumpProps) {
    const opts = ["-O", "-x", "--schema-only", "--schema", schemaName];
    for (const table of tables) {
      opts.push("-t", table);
    }
    return fetch(URL + "/v1alpha1/pg_dump", {
      method: "POST",
      body: JSON.stringify({ opts, clean_output: true })
    })
      .then(res => res.text())
      .then(text => {
        return text
          .replace(new RegExp(`${schemaName}\.`, "g"), "")
          .replace(
            new RegExp("DEFAULT now\\(\\)", "g"),
            "DEFAULT CURRENT_TIMESTAMP"
          )
          .replace(new RegExp("DEFAULT gen_random_uuid\\(\\)", "g"), "");
      });
  }
};
