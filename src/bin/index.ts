#!/usr/bin/env node
import { Command } from "commander";
import { generateEntities } from "./generate-entities";
import { generateSchema } from "./generate-schema";

const program = new Command();

program
  .command("generate")
  .description("generate entities")
  .action(generateEntities);

program
  .command("schema")
  .description("generate graphql schema")
  .action(generateSchema);

program.parse(process.argv);
