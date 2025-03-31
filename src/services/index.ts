import { db } from "@/db";
import { otpTable } from "@/db/schemas/otp";
import { smsConfigTable } from "@/db/schemas/sms-config";
import ApiError from "@/lib/error-handler";
import { compareHash, getHashedValue } from "@/utils";
import axios from "axios";
import { eq } from "drizzle-orm";


export async function saveOtp(target: string, otp: string, otpExpireAt: Date) {
    const hashedOtp = await getHashedValue(otp);
    const otpExpireAtIso = new Date(otpExpireAt).toISOString();
    return db.insert(otpTable).values({ target, otp: hashedOtp, otpExpireAt: otpExpireAtIso }).onConflictDoUpdate({
        set: { otp: hashedOtp, otpExpireAt: otpExpireAtIso },
        target: otpTable.target,
    });
}

export async function verifyOtp(otp: string, target: string) {
    const [row] = await db.select().from(otpTable).where(eq(otpTable.target, target));
    if (!row) {
        throw new ApiError(400, "OTP not found");
    }
    if (new Date(row.otpExpireAt) < new Date()) {
        throw new ApiError(400, "OTP expired, please generate new OTP.");
    }
    const isValid = await compareHash(otp, row.otp);
    if (!isValid) {
        throw new ApiError(400, "Invalid OTP");
    }
    return true;

}


export const sendOtp = async (phoneNumber: string, otp: string) => {
    const [row] = await db.select().from(smsConfigTable);
    if (!row?.isActive) {
        throw new ApiError(500, "SMS config not found");
    }
    const key = row.key
    const route = row.route
    const senderId = row.senderId
    const sms = row.sms.replace("{otp}", otp);
    const templateId = row.templateId
    const url = `http://sms.par-ken.com/api/smsapi?key=${key}&route=${route}&sender=${senderId}&number=${phoneNumber}(s)&sms=${sms}&templateid=${templateId}`

    axios.get(url);
}

export const canSendOtp = async () => {
    const [row] = await db.select().from(smsConfigTable);
    return !!row?.isActive;
}
