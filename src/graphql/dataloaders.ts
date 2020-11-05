import * as Dataloader from "dataloader";
import DataLoader = require("dataloader");

const dataLoaders: Map<string, Dataloader<any, any>> = new Map();

export function useDataloader<K, V, C = K>(
  name: string,
  callback: DataLoader.BatchLoadFn<K, V>,
  options?: DataLoader.Options<K, V, C>
): DataLoader<K, V, C> {
  const existing = dataLoaders.get(name);
  if (existing) {
    return existing;
  }
  const dataloader = new DataLoader(callback, options);
  dataLoaders.set(name, dataloader);
  return dataloader;
}
