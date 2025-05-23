import path from "node:path";
import camelCase from "camelcase";
import fs from "fs-extra";
import knex from "knex";
function extractZodExpression(comment) {
  const zodStart = comment.indexOf("@zod(");
  if (zodStart === -1)
    return null;
  let openParens = 0;
  let position = zodStart + 5;
  while (position < comment.length) {
    if (comment[position] === "(") {
      openParens++;
    } else if (comment[position] === ")") {
      if (openParens === 0) {
        return comment.substring(zodStart + 5, position);
      }
      openParens--;
    }
    position++;
  }
  return null;
}
const dateTypes = ["date", "datetime", "timestamp"];
const stringTypes = [
  "tinytext",
  "text",
  "mediumtext",
  "longtext",
  "json",
  "decimal",
  "time",
  "year",
  "char",
  "varchar"
];
const numberTypes = [
  "smallint",
  "mediumint",
  "int",
  "bigint",
  "float",
  "double"
];
const booleanTypes = ["tinyint"];
const enumTypes = ["enum"];
function getType(op, desc, config) {
  const { Default, Extra, Null, Type, Comment } = desc;
  const isNullish = config.nullish && config.nullish === true;
  const isTrim = config.useTrim && config.useTrim === true && op !== "selectable";
  const hasDefaultValue = Default !== null && op !== "selectable";
  const isGenerated = ["DEFAULT_GENERATED", "auto_increment"].includes(Extra);
  const isNull = Null === "YES";
  if (isGenerated && !isNull && ["insertable", "updateable"].includes(op))
    return;
  const isRequiredString = config.requiredString && config.requiredString === true && op !== "selectable";
  const isUseDateType = config.useDateType && config.useDateType === true;
  const type = Type.split("(")[0].split(" ")[0];
  const zDate = [
    "z.union([z.number(), z.string(), z.date()]).pipe(z.coerce.date())"
  ];
  const string = [isTrim ? "z.string().trim()" : "z.string()"];
  const number = ["z.number()"];
  const boolean = [
    "z.union([z.number(),z.string(),z.boolean()]).pipe(z.coerce.boolean())"
  ];
  const dateField = isUseDateType ? zDate : string;
  const nullable = isNullish && op !== "selectable" ? "nullish()" : "nullable()";
  const optional = "optional()";
  const nonnegative = "nonnegative()";
  const isUpdateableFormat = op === "updateable" && !isNull && !hasDefaultValue;
  const min1 = "min(1)";
  const zodOverrideType = config.zodCommentTypes ? extractZodExpression(Comment) : null;
  const typeOverride = zodOverrideType ?? config.overrideTypes?.[type];
  const generateDateLikeField = () => {
    const field = typeOverride ? [typeOverride] : dateField;
    if (isNull && !typeOverride)
      field.push(nullable);
    else if (hasDefaultValue)
      field.push(optional);
    if (hasDefaultValue && !isGenerated)
      field.push(`default('${Default}')`);
    if (isUpdateableFormat)
      field.push(optional);
    return field.join(".");
  };
  const generateStringLikeField = () => {
    const field = typeOverride ? [typeOverride] : string;
    if (isNull && !typeOverride)
      field.push(nullable);
    else if (hasDefaultValue)
      field.push(optional);
    else if (isRequiredString && !typeOverride)
      field.push(min1);
    if (hasDefaultValue && !isGenerated)
      field.push(`default('${Default}')`);
    if (isUpdateableFormat)
      field.push(optional);
    return field.join(".");
  };
  const generateBooleanLikeField = () => {
    const field = typeOverride ? [typeOverride] : boolean;
    if (isNull && !typeOverride)
      field.push(nullable);
    else if (hasDefaultValue)
      field.push(optional);
    if (hasDefaultValue && !isGenerated)
      field.push(`default(${Boolean(+Default)})`);
    if (isUpdateableFormat)
      field.push(optional);
    return field.join(".");
  };
  const generateNumberLikeField = () => {
    const unsigned = Type.endsWith(" unsigned");
    const field = typeOverride ? [typeOverride] : number;
    if (unsigned && !typeOverride)
      field.push(nonnegative);
    if (isNull && !typeOverride)
      field.push(nullable);
    else if (hasDefaultValue)
      field.push(optional);
    if (hasDefaultValue && !isGenerated)
      field.push(`default(${Default})`);
    if (isUpdateableFormat)
      field.push(optional);
    return field.join(".");
  };
  const generateEnumLikeField = () => {
    const value = Type.replace("enum(", "").replace(")", "").replace(/,/g, ",");
    const field = [`z.enum([${value}])`];
    if (isNull)
      field.push(nullable);
    else if (hasDefaultValue)
      field.push(optional);
    if (hasDefaultValue && !isGenerated)
      field.push(`default('${Default}')`);
    if (isUpdateableFormat)
      field.push(optional);
    return field.join(".");
  };
  if (dateTypes.includes(type))
    return generateDateLikeField();
  if (stringTypes.includes(type))
    return generateStringLikeField();
  if (numberTypes.includes(type))
    return generateNumberLikeField();
  if (booleanTypes.includes(type))
    return generateBooleanLikeField();
  if (enumTypes.includes(type))
    return generateEnumLikeField();
  throw new Error(`Unsupported column type: ${type}`);
}
async function generate(config) {
  const db = knex({
    client: "mysql2",
    connection: {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl
    }
  });
  const isCamelCase = config.camelCase && config.camelCase === true;
  const t = await db.raw(
    "SELECT table_name as table_name FROM information_schema.tables WHERE table_schema = ?",
    [config.database]
  );
  let tables = t[0].map((row) => row.table_name).sort();
  const dests = [];
  const includedTables = config.tables;
  if (includedTables?.length)
    tables = tables.filter((table) => includedTables.includes(table));
  const allIgnoredTables = config.ignore;
  const ignoredTablesRegex = allIgnoredTables?.filter((ignoreString) => {
    return ignoreString.startsWith("/") && ignoreString.endsWith("/");
  });
  const ignoredTableNames = allIgnoredTables?.filter(
    (table) => !ignoredTablesRegex?.includes(table)
  );
  if (ignoredTableNames?.length)
    tables = tables.filter((table) => !ignoredTableNames.includes(table));
  if (ignoredTablesRegex?.length) {
    tables = tables.filter((table) => {
      let useTable = true;
      for (const text of ignoredTablesRegex) {
        const pattern = text.substring(1, text.length - 1);
        if (table.match(pattern) !== null)
          useTable = false;
      }
      return useTable;
    });
  }
  for (let table of tables) {
    const d = await db.raw(`SHOW FULL COLUMNS FROM ${table}`);
    const describes = d[0];
    if (isCamelCase)
      table = camelCase(table);
    let content = `import { z } from 'zod'

export const ${table} = z.object({`;
    for (const desc of describes) {
      const field = isCamelCase ? camelCase(desc.Field) : desc.Field;
      const type = getType("table", desc, config);
      if (type) {
        content = `${content}
	${field}: ${type},`;
      }
    }
    content = `${content}
})

export const insertable_${table} = z.object({`;
    for (const desc of describes) {
      const field = isCamelCase ? camelCase(desc.Field) : desc.Field;
      const type = getType("insertable", desc, config);
      if (type) {
        content = `${content}
  ${field}: ${type},`;
      }
    }
    content = `${content}
})

export const updateable_${table} = z.object({`;
    for (const desc of describes) {
      const field = isCamelCase ? camelCase(desc.Field) : desc.Field;
      const type = getType("updateable", desc, config);
      if (type) {
        content = `${content}
  ${field}: ${type},`;
      }
    }
    content = `${content}
})

export const selectable_${table} = z.object({`;
    for (const desc of describes) {
      const field = isCamelCase ? camelCase(desc.Field) : desc.Field;
      const type = getType("selectable", desc, config);
      if (type) {
        content = `${content}
  ${field}: ${type},`;
      }
    }
    content = `${content}
})

export type ${camelCase(`${table}Type`, {
      pascalCase: true
    })} = z.infer<typeof ${table}>
export type Insertable${camelCase(`${table}Type`, {
      pascalCase: true
    })} = z.infer<typeof insertable_${table}>
export type Updateable${camelCase(`${table}Type`, {
      pascalCase: true
    })} = z.infer<typeof updateable_${table}>
export type Selectable${camelCase(`${table}Type`, {
      pascalCase: true
    })} = z.infer<typeof selectable_${table}>
`;
    const dir = config.folder && config.folder !== "" ? config.folder : ".";
    const file = config.suffix && config.suffix !== "" ? `${table}.${config.suffix}.ts` : `${table}.ts`;
    const dest = path.join(dir, file);
    dests.push(dest);
    if (!config.silent)
      console.log("Created:", dest);
    fs.outputFileSync(dest, content);
  }
  await db.destroy();
  return dests;
}
export {
  generate,
  getType
};
