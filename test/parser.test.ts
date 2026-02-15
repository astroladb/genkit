import { parseOpenAPISchema } from "../src/lib/parser";
import openapi from "../data/openapi.json";

// Test the parser
const schema = parseOpenAPISchema(openapi);

console.log("=== FLAT TABLES ===");
console.log(`Total tables: ${schema.tables.length}`);
schema.tables.forEach((table) => {
  console.log(`\n${table.namespace}.${table.name} -> ${table.table}`);
  console.log(`  Columns: ${table.columns.length}`);
  console.log(`  Primary Key: ${table.primaryKey.join(", ")}`);
  console.log(`  Timestamps: ${table.timestamps}`);
});

console.log("\n\n=== GROUPED MODELS ===");
Object.entries(schema.models).forEach(([namespace, tables]) => {
  console.log(`\nNamespace: ${namespace} (${tables.length} tables)`);
  tables.forEach((table) => {
    console.log(`  - ${table.name} (${table.table})`);
  });
});

console.log("\n\n=== SAMPLE COLUMN DETAILS ===");
const firstTable = schema.tables[0];
console.log(`Table: ${firstTable.name}`);
firstTable.columns.slice(0, 3).forEach((col) => {
  console.log(`\n  Column: ${col.name}`);
  console.log(`    Type: ${col.type} ${col.format ? `(${col.format})` : ""}`);
  console.log(`    Nullable: ${col.nullable}`);
  console.log(`    SQL Type: ${JSON.stringify(col.sqlType)}`);
  if (col.default !== undefined) {
    console.log(`    Default: ${JSON.stringify(col.default)}`);
  }
});
