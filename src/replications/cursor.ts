import { Connection } from "typeorm/browser";
import { ReplicationCursor } from "../entities/ReplicationCursor";

export async function saveCursor(
  connection: Connection,
  type: string,
  cursor: string
) {
  const repository = connection.getRepository<ReplicationCursor>(
    ReplicationCursor.name
  );
  let cursorEntity = await repository.findOne({
    where: { type },
  });

  if (!cursorEntity) {
    cursorEntity = repository.create({ type });
  }
  cursorEntity.cursor = cursor;
  await repository.save(cursorEntity);
}

export async function getCursor(connection: Connection, type: string) {
  const { cursor } =
    (await connection
      .getRepository<ReplicationCursor>(ReplicationCursor.name)
      .findOne({ where: { type } })) || {};
  return cursor;
}
