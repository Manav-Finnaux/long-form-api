import ApiError from "@/lib/error-handler"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import otpGenerator from "otp-generator"
import { dirname } from "path"

export function generateOtp() {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  })
}

export async function getHashedValue(value: string) {
  return await bcrypt.hash(value, 10)
}

export async function compareHash(value: string, hashedValue: string) {
  return await bcrypt.compare(value, hashedValue)
}

export function generateVerificationToken() {
  return randomBytes(32).toString('hex')
}

export async function storeFile(file: [string, string], id: string) {
  const [base64, fileName] = file
  const newFileName = id + '-' + fileName
  const filePath = `./src/uploads/${newFileName}`
  const dir = dirname(filePath)

  try {
    // Decode base64 to buffer
    const buffer = Buffer.from(base64, 'base64')

    // Validate base64 encoding (optional)
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error('Invalid base64 file data.')
    }

    // Create directory if it doesn't exist
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    // Write the file
    await writeFile(filePath, buffer)

    return { message: `${newFileName} saved successfully`, filePath }
  } catch (error: any) {
    console.error(`Error saving file:`, error)
    throw new ApiError(500, error.message ? `Failed to save file: ${error.message}` : 'Unknown Error')
  }
}
