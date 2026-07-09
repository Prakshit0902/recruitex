import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import {drizzle} from 'drizzle-orm/neon-serverless'
import * as schema from './schema/index.js'

dotenv.config()


export const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(process.env.DATABASE_URL!, { schema })
export {schema}