import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Local LibSQL/SQLite database file (pre-compiled driver, zero node-gyp builds on Windows)
const client = createClient({
  url: "file:db.sqlite",
});

export const db = drizzle(client, { schema });
