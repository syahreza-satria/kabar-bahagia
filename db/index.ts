import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { databaseUrl } from "@/lib/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

function client() {
  // prepare:false agar kompatibel dengan connection pooler Supabase (mode transaction)
  return (globalForDb.pg ??= postgres(databaseUrl(), { prepare: false, max: 5 }));
}

let instance: ReturnType<typeof drizzle<typeof schema>> | undefined;

/** Koneksi dibuat saat pertama dipakai (bukan saat build). */
export function getDb() {
  return (instance ??= drizzle(client(), { schema }));
}

export { schema };
