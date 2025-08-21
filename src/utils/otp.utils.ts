import ApiError from "@/lib/error-handler"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import otpGenerator from "otp-generator"
import { db } from "@/db"
import { tokenTable } from "@/db/schemas/token"
import { eq } from "drizzle-orm"

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

export async function saveToken(target: string, otp: string, otpExpireAt: Date) {
  const hashedOtp = await getHashedValue(otp);
  const otpExpireAtIso = new Date(otpExpireAt).toISOString();
  const rows = await db
    .insert(tokenTable)
    .values({ target, token: hashedOtp, tokenExpireAt: otpExpireAtIso })
    .onConflictDoUpdate({
      set: { token: hashedOtp, tokenExpireAt: otpExpireAtIso },
      target: tokenTable.target,
    })
    .returning({ id: tokenTable.id });

  return rows[0].id
}

export async function verifyToken(token: string, target: string) {
  const [row] = await db.select().from(tokenTable).where(eq(tokenTable.target, target));

  if (!row) {
    throw new ApiError(400, "Token not found");
  }
  if (new Date(row.tokenExpireAt) < new Date()) {
    throw new ApiError(400, "Token expired, please generate new token.");
  }

  const isValid = await compareHash(token, row.token);
  if (!isValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  await db.delete(tokenTable).where(eq(tokenTable.target, target)).returning()

  return true;
}