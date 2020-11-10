import { EntityMetadata, In } from "typeorm/browser";
import { schemaComposer } from "graphql-compose";
import { useDataloader } from "./dataloaders";

export function buildRelations(entityMetadata: EntityMetadata) {
  const otc = schemaComposer.getOTC(entityMetadata.name);
  for (const relation of entityMetadata.manyToOneRelations) {
    const type = relation.inverseEntityMetadata.name;
    otc.setField(relation.propertyName, {
      type: `${type}${relation.isNullable ? "" : "!"}`,
      resolve(source) {
        const where = {};
        const joinColumn = relation.joinColumns[0];
        const dataloader = useDataloader(
          `${entityMetadata.name}_${relation.propertyName}`,
          (keys: string[]) => {
            where[joinColumn.referencedColumn.propertyName] = In(keys);
            return entityMetadata.connection
              .getRepository(type)
              .find(where)
              .then((docs) => {
                const grouped = Array(keys.length);
                for (const doc of docs) {
                  const index = keys.indexOf(
                    doc[joinColumn.referencedColumn.propertyName]
                  );
                  grouped[index] = doc;
                }

                return grouped;
              });
          }
        );
        return dataloader.load(source[joinColumn.propertyName]);
      },
    });
  }
  for (const relation of entityMetadata.oneToManyRelations) {
    const type = relation.inverseEntityMetadata.name;
    // otc.setField(relation.propertyName, {
    //   type:,
    // });
    const relationConnection = schemaComposer.Query.getField(
      `${type}_connection`
    );
    const relationOTC = schemaComposer.getOTC(type);

    // otc.setField(relation.propertyName, {})
    otc.addFields({
      [`${relation.propertyName}_connection`]: relationConnection,
      // [relation.propertyName]: relationOTC
      //   .getResolver("findMany")
      //   .wrap((newResolver) => {
      //     newResolver.type = relationOTC;
      //     return newResolver;
      //   }),
    });
  }
}
