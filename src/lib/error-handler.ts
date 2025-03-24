import { ContentfulStatusCode } from "hono/utils/http-status"

class ApiError extends Error {
  statusCode: ContentfulStatusCode
  message: string
  data: any
  constructor(statusCode: ContentfulStatusCode, message: string, data: any = {}) {
    super(message)
    this.message = message
    this.statusCode = statusCode
    this.data = data
  }
}

export default ApiError
