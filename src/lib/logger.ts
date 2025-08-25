import { LOG_FILE_PATH } from "@/constants"
import { env } from "@/env"
import { appendFile } from 'fs/promises'

export class Logger {
  private namespace: string
  private logFile: string

  constructor(namespace: string) {
    this.namespace = namespace
    this.logFile = LOG_FILE_PATH
  }

  private formatMessage(level: string, message: string) {
    const timestamp = new Date().toISOString()
    return `[${this.namespace}] ${timestamp} [${level.toUpperCase()}] ${message}`
  }

  private async writeLog(level: string, message: string) {
    const log = this.formatMessage(level, message)

    if (env.NODE_ENV === 'development') {
      console.log(message)
      return
    }

    console.log(log)

    await appendFile(this.logFile, `${log}\n\n`)
  }

  async info(message: string) {
    await this.writeLog('info', message)
  }

  async warn(message: string) {
    await this.writeLog('warn', message)
  }

  async debug(message: string) {
    await this.writeLog('debug', message)
  }

  async error(message: string) {
    await this.writeLog('error', message)
  }
}