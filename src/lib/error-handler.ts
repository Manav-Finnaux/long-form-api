import { ContentfulStatusCode } from "hono/utils/http-status"
import { Logger } from "./logger"

class ApiError extends Error {
  statusCode: ContentfulStatusCode
  message: string
  data: any
  private apiErrorLogger = new Logger('ApiError')

  constructor(statusCode: ContentfulStatusCode, message: string, data: any = {}) {
    super(message)
    this.message = message
    this.statusCode = statusCode
    this.data = data
    this.apiErrorLogger.error(this.message)
  }
}

export default ApiError
