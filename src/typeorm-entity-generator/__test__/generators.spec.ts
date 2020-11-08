import { EntityGenerator } from "../generators";

test("EntityGenerator", () => {
  const generator = new EntityGenerator({
    name: "TestEntity",
    importTypeormFrom: "typorm",
    relations: [
      {
        type: "OneToMany",
        name: "testArray",
        target: "Test1",
        inverseField: "test",
        joinColumn: "test_id",
        import: {
          get: ["Test1"],
          from: "./test-entity",
        },
      },
      {
        type: "ManyToOne",
        name: "test",
        target: "Test2",
        inverseField: "tests",
        import: {
          get: ["Test2"],
          from: "./test-entity",
        },
      },
    ],
    extend: {
      name: "BaseEntity",
      import: {
        get: ["BaseEntity"],
        from: "./base-entity",
      },
    },
    columns: [
      {
        name: "id",
        columnName: "uuid",
        type: "uuid",
        primary: true,
        primaryGenerated: true,
      },
      {
        name: "title",
        columnName: "name",
        type: "string",
        nullable: true,
      },
      {
        name: "count",
        type: "int",
        default: 100,
      },
    ],
  });

  expect(generator.toString()).toBe(`import * as Typeorm from "typorm";
import { BaseEntity } from "./base-entity";
import { Test1, Test2 } from "./test-entity";

export class TestEntity extend BaseEntity {
\t@Typeorm.Column({"name":"uuid","type":"uuid"})
\tid: String;

\t@Typeorm.Column({"name":"name","type":"string","nullable":true})
\ttitle?: String;

\t@Typeorm.Column({"type":"int","default":100})
\tcount: String;

\t@Typeorm.OneToMany(() => Test1, target => target.test)
\t@JoinColumn({"name":"test_id"})
\ttestArray: Test1[];

\t@Typeorm.ManyToOne(() => Test2, target => target.tests)
\ttest: Test2;
}`);
});
