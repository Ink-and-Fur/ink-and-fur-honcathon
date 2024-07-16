import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { load } from "env";

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