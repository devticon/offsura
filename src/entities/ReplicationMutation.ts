import { Entity, PrimaryColumn } from "typeorm/browser";

@Entity()
export class ReplicationMutation {
  @PrimaryColumn("varying character")
  type: string;

  @PrimaryColumn("varying character")
  id: string;
}
