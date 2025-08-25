import path from 'path'

export const ROOT_DIR = process.cwd()
export const UPLOAD_DIR = path.join(ROOT_DIR, "public/uploads")
export const LOG_FILE_PATH = path.join(ROOT_DIR, 'src/lib/server.log')