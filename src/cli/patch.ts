import { hasuraClient } from "../hasuraClient";
import { offsuraConfig } from "../offsura";
import * as fs from "fs/promises";

(async () => {
  const {tables, postgresSchemaName} = offsuraConfig;

  const metadata = await hasuraClient.metadata(tables);
  const dump = await hasuraClient.dump({tables, schemaName: postgresSchemaName});

  await fs.rmdir(offsuraConfig.versionFilePath, { recursive: true });
  await fs.mkdir(offsuraConfig.versionFilePath);

  const filename = `version_${Date.now()}.json`;
  await fs.writeFile(`${offsuraConfig.versionFilePath}/${filename}`, JSON.stringify({
    metadata,
    dump
  }));
  console.log("version saved", { filename });
})();
