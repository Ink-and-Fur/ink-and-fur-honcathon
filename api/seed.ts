import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users } from "./src/db/schema.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

// biome-ignore lint/style/noNonNullAssertion: error from neon client is helpful enough to fix
const sql = neon(env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  await db.insert(users).values([
    {
      name: "Meowthful Whiskers",
    },
  ]);
}

async function main() {
  try {
    await seed();
    console.log("Seeding completed");
  } catch (error) {
    console.error("Error during seeding:", error);
    Deno.exit(1);
  }
}
main();