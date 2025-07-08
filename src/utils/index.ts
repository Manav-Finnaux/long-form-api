import bcrypt from "bcryptjs"
import otpGenerator from "otp-generator"
import { randomBytes, createHash } from "crypto"

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