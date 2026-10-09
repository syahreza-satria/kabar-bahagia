import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

function client() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diatur");
  // prepare:false agar kompatibel dengan connection pooler Supabase
  return (globalForDb.pg ??= postgres(process.env.DATABASE_URL, { prepare: false, max: 5 }));
}

let instance: ReturnType<typeof drizzle<typeof schema>> | undefined;
export function getDb() {
  return (instance ??= drizzle(client(), { schema }));
}
export { schema };
