import { db } from "@/db"
import { thirdPartyLogsTable } from "@/db/schema/third-party-tables"
import { InferInsertModel } from "drizzle-orm"

type LoggerOptions = Omit<
  InferInsertModel<typeof thirdPartyLogsTable>,
  "id" | "createdAt"
>

type LoggerType = "application" | "third-party"

export class Logger {
  private type: LoggerType
  constructor(type: LoggerType) {
    this.type = type
  }

  async log(values: LoggerOptions) {
    try {
      if (this.type === "third-party") {
        await db.insert(thirdPartyLogsTable).values(values)
      }
    } catch (err) {
      console.log(err)
    }
  }
}

export const thirdPartyLogger = new Logger("third-party")
