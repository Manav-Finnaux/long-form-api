import bcrypt from "bcryptjs"
import * as crypto from "crypto"
import otpGenerator from "otp-generator"

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



export function encrypt(text: string) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64')
  const iv = Buffer.from(process.env.INITIAL_VECTOR!, 'base64')
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  // Concatenate IV + encryptedData (both in hexadecimal)
  // const encryptedDataWithIV = iv.toString('base64') + encrypted;
  return encrypted;
}

// Function to decrypt the encrypted data
export function decrypt(encryptedData: string) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64')
  const iv = Buffer.from(process.env.INITIAL_VECTOR!, 'base64')

  // Extract the IV (first 16 bytes) and the encrypted data (rest of the string)
  // const iv = Buffer.from(encryptedDataWithIV.slice(0, 24), 'base64'); // IV is the first 16 bytes (24 base64 characters)
  // const encryptedData = encryptedDataWithIV; // The rest is the encrypted data

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}