const camelcase = require("camelcase");

export function toCamelCase(str: string) {
  return camelcase(str);
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
