import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({ quiet: true })
dotenv.config({ path: path.resolve(moduleDir, '../.env'), quiet: true })
dotenv.config({ path: path.resolve(moduleDir, '../../.env'), quiet: true })
