import { db } from '@/db';
import { longFormTable } from '@/db/schemas/long-form';
import { tokenTable } from '@/db/schemas/token';
import { CronJob } from 'cron';
import { eq, or } from 'drizzle-orm';
import { readdir, unlink } from 'fs/promises';

export const job = new CronJob(
  '* * 23 * * *', // cronTime
  // '* * * * * *',
  purge,
  null, // onComplete
  true // start
);

async function purge() {
  console.log("Purging the DB from inferior rows")
  await db.transaction(async (tx) => {
    const garbage = await tx.delete(longFormTable).where(eq(longFormTable.isFullyFilled, false)).returning();
    const ids: string[] = garbage.map((row) => row.id);

    if (ids.length > 0) {
      await Promise.all(garbage.map(async (row) => {
        if (row.mobileNo) {
          await tx.delete(tokenTable).where(eq(tokenTable.target, row.mobileNo))
        }
        if (row.personalEmail) {
          await tx.delete(tokenTable).where(eq(tokenTable.target, row.personalEmail))
        }
        if (row.officeEmail) {
          await tx.delete(tokenTable).where(eq(tokenTable.target, row.officeEmail))
        }
      }))

      console.log("Deleted rows:", ids)
      await deleteGarbageFiles(ids)
      console.log("DB is pure now")
    }
    else {
      console.log("DB is pure")
    }
  })
}

async function deleteGarbageFiles(ids: string[]) {
  const BASE_PATH = './src/uploads';
  const filesToDelete = await getFilePathsFromIDs(ids, BASE_PATH);

  await Promise.all(filesToDelete.map(async (fileName) => {
    const filePath = `${BASE_PATH}/${fileName}`;

    try {
      await unlink(filePath)
      console.log(`${fileName} deleted.`)
    }
    catch (e) {
      console.log(`Encountered an error when deleting file: ${fileName}`, e);
    }
  }))
}

async function getFilePathsFromIDs(ids: string[], basePath: string) {
  const allFiles = await readdir(basePath)
  const filesArr: string[] = [];

  for (let id of ids) {
    const fileList = allFiles.filter((file) => file.includes(id))

    if (fileList.length > 0) {
      fileList.forEach((file) => filesArr.push(file))
    }
  }
  return filesArr;
}