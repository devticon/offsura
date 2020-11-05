import { TableMetadata } from "../version/interfaces";

const cache: Map<string, any> = new Map();

function swapRecord(name: string, json: Record<string, string>) {
  let swapped = cache.get(name);
  if (swapped) {
    return swapped;
  }
  swapped = {};
  for (const key in json) {
    swapped[json[key]] = key;
  }
  cache.set(name, swapped);
  return swapped;
}

function getCustomColumnNames(
  tableMetadata: TableMetadata
): Record<string, string> {
  return tableMetadata.hasuraMetadata.configuration.custom_column_names;
}

export function convertToColumnName(
  tableMetadata: TableMetadata,
  fieldName: string
) {
  const names = swapRecord(
    tableMetadata.table,
    getCustomColumnNames(tableMetadata)
  );
  return names[fieldName] || fieldName;
}

export function convertToGqlName(
  tableMetadata: TableMetadata,
  columnName: string
) {
  const names = getCustomColumnNames(tableMetadata);
  return names[columnName] || columnName;
}

export function convertObjectToGql(tableMetadata: TableMetadata, obj: any) {
  const mapped: any = {};
  for (const key of Object.keys(obj)) {
    mapped[convertToGqlName(tableMetadata, key)] = obj[key];
  }
  return mapped;
}
