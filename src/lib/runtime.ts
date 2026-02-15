// Runtime adapters for gen() and render()
// Works in both Node.js and AstrolaDB (with proper configuration)

/**
 * Type definition for schema object
 */
export interface Schema {
  tables: Table[];
}

export interface Table {
  schemaName: string;
  name: string;
  table: string;
  namespace: string;
  columns: Column[];
  timestamps: boolean;
  indexes?: any[];
  primaryKey?: string[];
}

export interface Column {
  name: string;
  type: string;
  format?: string;
  nullable: boolean;
  readOnly: boolean;
  writeOnly?: boolean;
  enum?: string[];
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  default?: any;
  sqlType?: Record<string, string>;
  semantic?: string;
}

/**
 * Universal gen() function
 * In Node.js: loads schema from file
 * In AstrolaDB: receives schema from runtime
 */
export function gen<T>(callback: (schema: Schema) => T): T {
  // This is just a type helper - actual implementation depends on environment
  // In Node.js: see node-cli.js
  // In AstrolaDB: provided by runtime
  throw new Error("gen() must be implemented by runtime environment");
}

/**
 * Universal render() function
 * Returns a map of files to write
 */
export function render(files: Record<string, string>): Record<string, string> {
  return files;
}

/**
 * Type for generator functions
 */
export type Generator = (schema: Schema) => Record<string, string>;
