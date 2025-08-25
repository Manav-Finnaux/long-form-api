import { db } from '@/db';
import { longFormTable } from '@/db/schemas/long-form';
import { tokenTable } from '@/db/schemas/token';
import { deleteGarbageFiles } from '@/utils';
import { CronJob } from 'cron';
import { and, eq, lt } from 'drizzle-orm';
import { Logger } from './logger';

export const job = new CronJob(
  '0 0 23 * * *', // cronTime
  purge,
  null, // onComplete
  true // start
);
const cronJobLogger = new Logger('CronJob')

async function purge() {
  cronJobLogger.info("Purging the DB from inferior rows")
  await db.transaction(async (tx) => {
    await tx.delete(tokenTable).where(lt(tokenTable.tokenExpireAt, new Date().toISOString()))
    // const garbage = await tx.delete(longFormTable).where(eq(longFormTable.isFullyFilled, false)).returning();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const garbage = await tx
      .delete(longFormTable)
      .where(
        and(
          eq(longFormTable.isFullyFilled, false),
          lt(longFormTable.createdAt, tenDaysAgo.toISOString())
        )
      )
      .returning({ id: longFormTable.id });
    const ids: string[] = garbage.map((row) => row.id);

    if (ids.length > 0) {
      cronJobLogger.info("Deleted rows:" + ids.toString())
      await deleteGarbageFiles(ids)
      cronJobLogger.info("DB is pure now")
    }
    else {
      cronJobLogger.info("DB is pure")
    }
  })
}