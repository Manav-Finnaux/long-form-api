import ApiError from "@/lib/error-handler"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import otpGenerator from "otp-generator"
import path, { dirname } from "path"
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import nodemailer from 'nodemailer';
import { env } from "@/env"
import fs from "fs/promises"
import { LongFormTableType } from "@/db/schemas/long-form"

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

export async function storeFile2(file: File, id: string, fileType: string) {
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

/**
 * @deprecated Use `storeFile2` instead.
 *
 * This function is deprecated and will be removed in future versions.
 * Please use {@link storeFile2} for equivalent functionality.
 *
 * @example
 * // Instead of this:
 * storeFile(file, id);
 *
 * // Use this:
 * storeFile2(file, id, fileType);
 */
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

const sesClient = new SESv2Client({
  region: env.EMAIL_REGION,
  credentials: {
    accessKeyId: env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SES_SECRET_ACCESS_KEY
  }
})

export const transporter = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand }
})

async function getData(src: string) {
  const file = (await fs.readFile(src)).toString('base64')
  const fileName = path.basename(src)

  return [file, fileName]
}

export async function filePathToBase64(src: string | null) {
  if (!src || src.length === 0) return null;

  return await getData(src)
}

export async function filePathArrayToBase64(src: string[] | null) {
  if (!src || src.length === 0) return null;

  const returnValue = await Promise.all(src.map(
    async (src) => {
      return await getData(src)
    }
  ))

  return returnValue
}

export function isFullyFilled(row: LongFormTableType) {
  if (!row.isOfficeEmailVerified && !row.employmentProofDocument) return false;

  const nullValueObject: Partial<Record<keyof LongFormTableType, string | number | boolean | string[] | null>> = {}

  Object.entries(row).forEach((cell) => {
    const key = cell[0] as keyof LongFormTableType
    const value = cell[1] as string | number | boolean | string[] | null

    nullValueObject[key] = value;
  });

  const nullAbleValues: Partial<keyof LongFormTableType>[] = ["address2", "loanPurpose", "isFullyFilled", "status", "applicationNumber", "loanAccountNumber", "reason", "employeeName"];

  return Object.keys(nullValueObject).map((key) => {
    return !nullAbleValues.includes(key as keyof LongFormTableType)
  })
    .every((value) => value)
}