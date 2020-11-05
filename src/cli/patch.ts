import { hasuraClient } from "../husura/hasuraClient";
import { offsuraConfig } from "../offsura";
import * as fs from "fs/promises";

(async () => {
  const { tables } = offsuraConfig;
  const hasuraMetadata = await hasuraClient.metadata(tables);

  await fs.rmdir(offsuraConfig.versionFilePath, { recursive: true });
  await fs.mkdir(offsuraConfig.versionFilePath);

  const version = Date.now() + "";

  await fs.writeFile(`${offsuraConfig.versionFilePath}/version`, version);

  const metadata = {};
  for (const table of offsuraConfig.tables) {
    const [columns, fks, pks] = await Promise.all([
      await hasuraClient.runSql(`
        SELECT column_name,  data_type, is_nullable
        FROM  information_schema.columns
        WHERE  table_name = '${table}';
      `),
      await hasuraClient.runSql(`
       SELECT
            tc.constraint_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='${table}';
      `),
      await hasuraClient.runSql(`
        SELECT c.column_name
        FROM information_schema.table_constraints tc 
        JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
        JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
          AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
        WHERE constraint_type = 'PRIMARY KEY' AND tc.table_name = '${table}';
      `)
    ]);
    metadata[table] = {
      table,
      primaryKeys: pks.map(([col]) => col),
      foreignKeys: fks.map(
        ([name, column, referenceTable, referenceColumn]) => ({
          name,
          column,
          referenceTable,
          referenceColumn
        })
      ),
      columns: columns.map(([name, type, is_nullable]) => ({
        name,
        type,
        isNullable: is_nullable === "YES"
      })),
      hasuraMetadata: hasuraMetadata.tables.find(t => t.table.name === table)
    };
  }
  await fs.writeFile(
    `${offsuraConfig.versionFilePath}/metadata.json`,
    JSON.stringify(metadata, null, 2)
  );
  console.log("version saved", { version });
})();
