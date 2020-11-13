import * as fs from "fs/promises";
import { TableMetadata } from "../version/interfaces";
import { naming } from "../naming";
import {
  EntityGenerateColumnParams,
  EntityGenerateParams,
  EntityGenerateRelationParams,
} from "../typeorm-entity-generator/interfaces";
import { writeEntities } from "../typeorm-entity-generator";
import { psqlToSqlite } from "../typing";
import { OffsuraConfig } from "../interfaces";
import { HasuraClient } from "./hasuraClient";

export async function generateEntities(offsuraConfig: OffsuraConfig) {
  const { tables } = offsuraConfig.replication;
  const hasuraClient = new HasuraClient(
    offsuraConfig.replication.hasura.url,
    offsuraConfig.replication.webSocketImpl
  );
  const hasuraMetadata = await hasuraClient.metadata(tables);

  await fs.rmdir(offsuraConfig.versionFilePath, { recursive: true });
  await fs.mkdir(offsuraConfig.versionFilePath);

  const version = Date.now() + "";

  await fs.writeFile(`${offsuraConfig.versionFilePath}/version`, version);

  const metadata = {};
  const tableNames = tables.map((t) => (typeof t === "string" ? t : t.table));
  for (const table of tableNames) {
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
      `),
    ]);
    metadata[table] = {
      table,
      primaryKeys: pks.map(([col]) => col),
      foreignKeys: fks.map(
        ([name, column, referenceTable, referenceColumn]) => ({
          name,
          column,
          referenceTable,
          referenceColumn,
        })
      ),
      columns: columns.map(([name, type, is_nullable]) => ({
        name,
        type,
        isNullable: is_nullable === "YES",
      })),
      hasuraMetadata: hasuraMetadata.tables.find((t) => t.table.name === table),
    };
  }

  const entityGeneratorParams: EntityGenerateParams[] = [];
  for (const [table, tableMetadata] of Object.entries(metadata) as [
    string,
    TableMetadata
  ][]) {
    const entityName = naming.tableToEntityName(table);
    const entityFileName = naming.tableToFilename(table);
    const relations: EntityGenerateRelationParams[] = [];
    const customNames =
      tableMetadata.hasuraMetadata.configuration?.custom_column_names || {};
    const columns: EntityGenerateColumnParams[] = tableMetadata.columns.map(
      (col) => ({
        name: customNames[col.name] || col.name,
        columnName: col.name,
        nullable: col.isNullable,
        primaryGenerated: true,
        primary: tableMetadata.primaryKeys.includes(col.name),
        type: col.type,
      })
    );
    const oneToMany = tableMetadata.hasuraMetadata.array_relationships || [];
    const manyToOne = tableMetadata.hasuraMetadata.object_relationships || [];
    for (const relation of oneToMany) {
      const relationTable = relation.using.foreign_key_constraint_on.table.name;
      const joinColumn = relation.using.foreign_key_constraint_on.column;
      if (!tables.includes(relationTable)) {
        console.log(`missing ${relationTable}`);
        continue;
      }

      relations.push({
        name: relation.name,
        type: "OneToMany",
        target: naming.tableToEntityName(relationTable),
        import: {
          from: `./${naming.tableToFilename(relationTable)}`,
          get: [naming.tableToEntityName(relationTable)],
        },
        inverseField: metadata[
          relationTable
        ].hasuraMetadata.object_relationships.find(
          (r) => r.using.foreign_key_constraint_on === joinColumn
        ).name,
      });
    }
    for (const relation of manyToOne) {
      const joinColumn = relation.using.foreign_key_constraint_on;
      const foreignKey = tableMetadata.foreignKeys.find(
        (fk) => fk.column === joinColumn
      );
      const relationTable = foreignKey.referenceTable;
      if (!tables.includes(relationTable)) {
        console.log(`missing ${relationTable}`);
        continue;
      }
      relations.push({
        name: relation.name,
        type: "ManyToOne",
        target: naming.tableToEntityName(relationTable),
        joinColumn,
        import: {
          from: `./${naming.tableToFilename(relationTable)}`,
          get: [naming.tableToEntityName(relationTable)],
        },
      });
    }

    entityGeneratorParams.push({
      name: entityName,
      table,
      importTypeormFrom: "typeorm/browser",
      typeMapper: psqlToSqlite,
      relations,
      columns,
    });
  }
  hasuraClient.close();
  writeEntities(
    offsuraConfig.replication.entitiesDir,
    entityGeneratorParams,
    naming
  );
  console.log("version saved", { version });
}
