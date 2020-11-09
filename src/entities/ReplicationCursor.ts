import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class ReplicationCursor {
  @PrimaryColumn("varying character")
  type: string;

  @Column("varying character")
  cursor: string;
}
