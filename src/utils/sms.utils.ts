import { smsConfig, smsConfigTableType } from "@/db/schemas/sms-config"
import { db } from "@/db"
import axios from "axios"

export async function sendSMS(config: smsConfigTableType, mobileNo: string, sms: string) {
  const { key, route, senderId, templateId } = config

  const url = `http://sms.par-ken.com/api/smsapi?key=${key}&route=${route}&sender=${senderId}&number=${mobileNo}(s)&sms=${sms}&templateid=${templateId}`

  axios.get(url);
}


export async function sendMobileOtp(mobileNo: string, otp: string) {
  const [config] = await db.select().from(smsConfig)

  if ([config].some(value => value == null)) {
    throw new Error('One or more required fields are null or undefined')
  }

  const sms = config.template!.replace("{#var#}", otp)

  sendSMS(config, mobileNo, sms)
}