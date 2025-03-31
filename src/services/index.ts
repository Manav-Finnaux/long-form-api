import { db } from "@/db";
import { smsConfigTable } from "@/db/schemas/sms-config";
import ApiError from "@/lib/error-handler";
import axios from "axios";

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