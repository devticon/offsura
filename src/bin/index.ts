#!/usr/bin/env node
import { loadOffsuraConfig } from "./load-config";

const moduleAlias = require("module-alias");
moduleAlias.addAlias("typeorm/browser", "typeorm");

import { Command } from "commander";
import { generateSchema } from "./generate-schema";
import { generateEntities } from "../typeorm-hasura-replication/generate-entities";

const program = new Command();
const config = loadOffsuraConfig();

program
  .command("generate")
  .description("generate entities")
  .action(() => generateEntities(config));

program
  .command("schema")
  .description("generate graphql schema")
  .action(generateSchema);

program.parse(process.argv);
