import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined
}

function createPrismaClient() {
  // In Prisma 7, the adapter is required for the "postgresql" provider when URL
  // is managed externally (via prisma.config.ts / env). We fall back to the
  // env variable so the app still works during development with pg.
  try {
    // Dynamic import so the build doesn't fail when @prisma/adapter-pg is not
    // installed in environments that don't need it.
    const connectionString = process.env.DATABASE_URL
    if (connectionString) {
      // Use the adapter approach
      const { Pool } = require('pg') as typeof import('pg')
      const pool = new Pool({ connectionString })
      const adapter = new PrismaPg(pool)
      return new PrismaClient({ adapter } as any)
    }
  } catch {
    // adapter-pg not installed or DATABASE_URL missing — fall through to plain client
  }
  return new PrismaClient()
}

export const prisma = globalThis.prismaClient ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClient = prisma
}

export default prisma
