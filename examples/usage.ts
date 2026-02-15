/**
 * Example: Using the OpenAPI parser to transform x-db metadata
 * into the dual-view schema structure (tables + models)
 */

import { parseOpenAPISchema } from "../src/lib/parser";
import openapi from "../data/openapi.json";

// Parse the OpenAPI spec
const schema = parseOpenAPISchema(openapi);

// ============================================
// View 1: Flat array of all tables
// ============================================
console.log("📋 FLAT TABLES VIEW");
console.log("-------------------");

schema.tables.forEach((table) => {
  console.log(`\nTable: ${table.table}`);
  console.log(`  Namespace: ${table.namespace}`);
  console.log(`  Schema Name: ${table.schemaName}`);
  console.log(`  Columns: ${table.columns.map((c) => c.name).join(", ")}`);
});

// Use case: Generate a single TypeScript models file
function generateAllModels(tables: typeof schema.tables): string {
  return tables
    .map((table) => {
      const fields = table.columns
        .map((col) => `  ${col.name}: ${mapTypeToTS(col.type)};`)
        .join("\n");

      return `export interface ${table.name} {\n${fields}\n}`;
    })
    .join("\n\n");
}

// ============================================
// View 2: Tables grouped by namespace
// ============================================
console.log("\n\n📦 GROUPED MODELS VIEW");
console.log("---------------------");

for (const [namespace, tables] of Object.entries(schema.models)) {
  console.log(`\nNamespace: ${namespace}`);
  tables.forEach((table) => {
    console.log(`  - ${table.name} (${table.table})`);
  });
}

// Use case: Generate separate files per namespace
function generateNamespacedFiles(models: typeof schema.models): Record<string, string> {
  const files: Record<string, string> = {};

  for (const [namespace, tables] of Object.entries(models)) {
    // Create models file for this namespace
    const modelsContent = tables
      .map((table) => {
        const fields = table.columns
          .map((col) => `  ${col.name}: ${mapTypeToTS(col.type)};`)
          .join("\n");

        return `export interface ${table.name} {\n${fields}\n}`;
      })
      .join("\n\n");

    files[`${namespace}/models.ts`] = modelsContent;

    // Create router file for this namespace
    const routerContent = `import { ${tables.map((t) => t.name).join(", ")} } from "./models";\n\nexport const ${namespace}Router = {\n  // Your routes here\n};\n`;

    files[`${namespace}/router.ts`] = routerContent;
  }

  return files;
}

// Helper function
function mapTypeToTS(type?: string): string {
  const mapping: Record<string, string> = {
    string: "string",
    integer: "number",
    number: "number",
    boolean: "boolean",
    object: "Record<string, any>",
  };
  return mapping[type || "string"] || "unknown";
}

// Demo output
console.log("\n\n🎯 EXAMPLE OUTPUTS");
console.log("------------------");

console.log("\n1. Single file with all models:");
console.log(generateAllModels(schema.tables));

console.log("\n\n2. Separate files per namespace:");
const files = generateNamespacedFiles(schema.models);
Object.entries(files).forEach(([path, content]) => {
  console.log(`\n--- ${path} ---`);
  console.log(content);
});
