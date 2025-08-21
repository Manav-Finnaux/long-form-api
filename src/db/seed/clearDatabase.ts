import { db } from "@/db"
import { sql } from "drizzle-orm"

async function clearDatabase() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`DROP SCHEMA IF EXISTS PUBLIC CASCADE`)
    console.log('Schema Dropped')
    await tx.execute(sql`CREATE SCHEMA IF NOT EXISTS PUBLIC`)
    console.log('New Schema Created')
  })
  process.exit(0)
}
clearDatabase()