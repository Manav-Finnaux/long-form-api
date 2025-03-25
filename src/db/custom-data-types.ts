import { decrypt, encrypt, } from "@/utils"
import { customType } from "drizzle-orm/pg-core"

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