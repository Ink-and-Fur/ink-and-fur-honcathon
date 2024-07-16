import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'https://deno.land/x/postgresjs@3.4.4/mod.js';
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

const databaseUrl = drizzle(postgres(env.DATABASE_URL,
  { ssl: 'require', max: 1 }));

const main = async () => {
  try {
    await migrate(databaseUrl, { migrationsFolder: 'drizzle' });
    console.log('Migration complete');
    Deno.exit(0);
  } catch (error) {
    console.error(error);
    Deno.exit(1);
  }
};

main();