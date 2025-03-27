
import { env } from "@/env";
import * as crypto from "crypto";
import { customType } from "drizzle-orm/pg-core";


export const encryptedText = customType<{ data: string }>({
    dataType() {
        return "text"
    },
    fromDriver(value: unknown) {
        return decrypt(value as string)
    },
    toDriver(value: string) {
        return encrypt(value)
    },
})

const INITIAL_VECTOR = "qF/nZX8BDOuhz92dOrZyZA=="


function encrypt(text: string) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(env.ENCRYPTION_KEY, 'base64')
    const iv = Buffer.from(INITIAL_VECTOR, 'base64')
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    // Concatenate IV + encryptedData (both in hexadecimal)
    // const encryptedDataWithIV = iv.toString('base64') + encrypted;
    return encrypted;
}


function decrypt(encryptedData: string) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(env.ENCRYPTION_KEY, 'base64')
    const iv = Buffer.from(INITIAL_VECTOR, 'base64')

    // Extract the IV (first 16 bytes) and the encrypted data (rest of the string)
    // const iv = Buffer.from(encryptedDataWithIV.slice(0, 24), 'base64'); // IV is the first 16 bytes (24 base64 characters)
    // const encryptedData = encryptedDataWithIV; // The rest is the encrypted data

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}