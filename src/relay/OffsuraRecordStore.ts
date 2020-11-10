import {
  MutableRecordSource,
  Record,
  RecordMap,
} from "relay-runtime/lib/store/RelayStoreTypes";
import { DataID, RecordState } from "relay-runtime";

export class RecordStore implements MutableRecordSource {
  private state: RecordMap;
  clear(): void {
    this.state = {};
  }

  delete(dataID: DataID): void {
    delete this.state[dataID];
  }

  get(dataID: DataID): Record | null | undefined {
    return this.state[dataID];
  }

  getRecordIDs(): DataID[] {
    return Object.keys(this.state);
  }

  getStatus(dataID: DataID): RecordState {
    return this.get(dataID) ? "EXISTENT" : "NONEXISTENT";
  }

  has(dataID: DataID): boolean {
    return !!this.get(dataID);
  }

  remove(dataID: DataID): void {
    this.delete(dataID);
  }

  set(dataID: DataID, record: Record): void {
    this.state[dataID] = record;
  }

  size(): number {
    return 0;
  }

  toJSON(): { [p: string]: Record } {
    return {};
  }
}
