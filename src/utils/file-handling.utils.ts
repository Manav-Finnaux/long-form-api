import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import path, { dirname } from "path"
import fs from "fs/promises"
import ApiError from "@/lib/error-handler"

export async function storeFile(file: File, id: string, fileType: string) {
  try {
    const newFileName = id + '-' + fileType + '-' + file.name
    const filePath = `./src/uploads/${newFileName}`
    const dir = dirname(filePath)

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(filePath, buffer)

    return { message: `${newFileName} saved successfully`, filePath }
  } catch (error: any) {
    console.error(`Error saving file:`, error)
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