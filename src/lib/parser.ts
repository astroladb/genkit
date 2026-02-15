/**
 * Parse OpenAPI spec with x-db metadata into normalized schema
 * @param openapi - OpenAPI JSON object
 * @returns Normalized schema with tables
 */

export interface XDBColumnMeta {
  default?: unknown;
  sql_type?: string | Record<string, string>; // Can be string or { postgres: "...", sqlite: "..." }
  semantic?: string;
  auto_managed?: boolean;
}

export interface OpenAPIProperty {
  type?: string;
  format?: string;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  enum?: unknown[];
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  ["x-db"]?: XDBColumnMeta;
}

export interface XDBTableMeta {
  table?: string;
  namespace?: string;
  timestamps?: boolean;
  indexes?: unknown[];
  primary_key?: string[];
}

export interface OpenAPISchemaDef {
  properties?: Record<string, OpenAPIProperty>;
  ["x-db"]?: XDBTableMeta;
}

export interface OpenAPIComponents {
  schemas?: Record<string, OpenAPISchemaDef>;
}

export interface OpenAPIDocument {
  components?: OpenAPIComponents;
}

export interface NormalizedColumn {
  name: string;
  type?: string;
  format?: string;
  nullable: boolean;
  readOnly: boolean;
  writeOnly: boolean;
  enum?: unknown[];
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  default?: unknown;
  sqlType?: string | Record<string, string>; // Support both formats
  semantic?: string;
  autoManaged?: boolean;
}

export interface NormalizedTable {
  schemaName: string;
  name: string;
  table: string;
  namespace: string;
  columns: NormalizedColumn[];
  timestamps: boolean;
  indexes: unknown[];
  primaryKey: string[];
}

export interface NormalizedSchema {
  tables: NormalizedTable[];
  models: Record<string, NormalizedTable[]>;
}

export function parseOpenAPISchema(
  openapi: OpenAPIDocument
): NormalizedSchema {
  const tables: NormalizedTable[] = [];
  const schemas = openapi.components?.schemas ?? {};

  for (const [schemaName, schemaDef] of Object.entries(schemas)) {
    const xdb = schemaDef["x-db"] ?? {};
    const properties = schemaDef.properties ?? {};

    const columns: NormalizedColumn[] = [];

    for (const [propName, propDef] of Object.entries(properties)) {
      const xdbCol = propDef["x-db"] ?? {};

      columns.push({
        name: propName,
        type: propDef.type,
        format: propDef.format,
        nullable: propDef.nullable ?? false,
        readOnly: propDef.readOnly ?? false,
        writeOnly: propDef.writeOnly ?? false,
        enum: propDef.enum,
        maxLength: propDef.maxLength,
        minLength: propDef.minLength,
        pattern: propDef.pattern,
        default: xdbCol.default,
        sqlType: xdbCol.sql_type,
        semantic: xdbCol.semantic,
        autoManaged: xdbCol.auto_managed,
      });
    }

    tables.push({
      schemaName,
      name: schemaName,
      table: xdb.table ?? schemaName.toLowerCase(),
      namespace: xdb.namespace ?? "api",
      columns,
      timestamps: xdb.timestamps ?? false,
      indexes: xdb.indexes ?? [],
      primaryKey: xdb.primary_key ?? ["id"],
    });
  }

  // Group tables by namespace to create models
  const models: Record<string, NormalizedTable[]> = {};

  for (const table of tables) {
    const ns = table.namespace;
    if (!models[ns]) {
      models[ns] = [];
    }
    models[ns].push(table);
  }

  return { tables, models };
}
