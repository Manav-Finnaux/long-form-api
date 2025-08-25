import { UPLOAD_DIR } from "@/constants"
import ApiError from "@/lib/error-handler"
import { Logger } from "@/lib/logger"
import { existsSync } from "fs"
import fs, { mkdir, readdir, unlink, writeFile } from "fs/promises"
import path, { dirname } from "path"

export async function storeFile(file: File, id: string, fileType: string) {
  try {
    const newFileName = id + '-' + fileType + '-' + file.name
    // const filePath = `./src/uploads/${newFileName}`
    const filePath = path.join(UPLOAD_DIR, newFileName)
    const dir = dirname(filePath)

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(filePath, buffer)

    return { message: `${newFileName} saved successfully`, filePath }
  } catch (error: any) {
    // console.error(`Error saving file:`, error)
    throw new ApiError(500, error.message ? `Failed to save file: ${error.message}` : 'Unknown Error')
  }
}

async function getData(src: string) {
  const file = (await fs.readFile(src)).toString('base64')
  const fileName = path.basename(src)

  return [file, fileName]
}

export async function filePathToBase64(src: string | null) {
  if (!src || src.length === 0) return null;

  return await getData(src)
}

export async function filePathArrayToBase64(src: string[] | string | null) {
  if (!src || src.length === 0) return null;

  if (!Array.isArray(src)) {
    const fileArray = await filePathToBase64(src)
    return [fileArray]
  }

  const returnValue = await Promise.all(src.map(
    async (src) => {
      return await getData(src)
    }
  ))

  return returnValue
}

export function fifo(array: string[], newValues: string[]) {
  if (newValues.length === 3) return newValues;

  const set = new Set([...array, ...newValues])
  const returnArray = [...set]
  while (returnArray.length > 3) {
    returnArray.shift();
  }

  return returnArray;
}

export async function deleteGarbageFiles(ids: string[]) {
  const deleteGarbageFilesLogger = new Logger('DeleteGarbageFiles')
  const filesToDelete = await getFilePathsFromIDs(ids);

  await Promise.all(filesToDelete.map(async (fileName) => {
    // const filePath = `${BASE_PATH}/${fileName}`;
    const filePath = path.join(UPLOAD_DIR, fileName)

    try {
      await unlink(filePath)
      deleteGarbageFilesLogger.info(`${fileName} deleted.`)
    }
    catch (e: any) {
      deleteGarbageFilesLogger.error(`Encountered an error when deleting file: ${fileName}\n${e.message ?? ''}`);
    }
  }))
}

export async function getFilePathsFromIDs(ids: string[]) {
  const allFiles = await readdir(UPLOAD_DIR)
  const filesArr: string[] = [];

  for (let id of ids) {
    const fileList = allFiles.filter((file) => file.includes(id))

    if (fileList.length > 0) {
      filesArr.push(...fileList)
    }
  }
  return filesArr;
}