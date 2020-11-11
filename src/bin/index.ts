#!/usr/bin/env node
import { loadOffsuraConfig } from "./load-config";

const moduleAlias = require("module-alias");
moduleAlias.addAlias("typeorm/browser", "typeorm");

import { Command } from "commander";
import { generateEntities } from "../typeorm-hasura-replication/generate-entities";
import { generateSchema } from "../typeorm-entity-generator/generate-schema";

const program = new Command();
const config = loadOffsuraConfig();

program
  .command("generate")
  .description("generate entities")
  .action(() => generateEntities(config));

program
  .command("schema")
  .description("generate graphql schema")
  .action(() => generateSchema(config));

program.parse(process.argv);
