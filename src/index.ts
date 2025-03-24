import ApiError from "@/lib/error-handler"
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import httpStatus from "http-status"
import { shortForm } from "./app/short-form"

const app = new Hono()

app.get("/", (c) => {
  return c.json({ message: "Hello from server!", data: null })
})

app.basePath("/api").route('/short-form', shortForm)


app.onError((err, c) => {

  console.log({ err });
  if (err instanceof ApiError) {
    return c.json({ message: err.message, data: null }, err.statusCode)
  }
  return c.json(
    { message: "You are dead.", data: null },
    httpStatus.INTERNAL_SERVER_ERROR,
  )
})

app.notFound((c) => {
  return c.json({ message: httpStatus[404], data: null }, httpStatus.NOT_FOUND)
})


console.log(`Server is running on http://localhost:${process.env.PORT}`)

serve({
  fetch: app.fetch,
  port: parseInt(process.env.PORT!),
})
