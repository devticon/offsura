import { hasuraClient } from "../hasuraClient";
import { offsuraConfig } from "../offsura";
import * as fs from "fs/promises";

(async () => {
  const content = await hasuraClient.dump({
    tables: offsuraConfig.tables,
    schemaName: offsuraConfig.postgresSchemaName
  });

  await fs.rmdir(offsuraConfig.dumpDir, { recursive: true });
  await fs.mkdir(offsuraConfig.dumpDir);

  const filename = `version_${Date.now()}.sql`;
  await fs.writeFile(`${offsuraConfig.dumpDir}/${filename}`, content);
  console.log("dump saved", { filename });
})();
