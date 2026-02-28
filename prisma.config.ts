import path from 'path'
import { defineConfig } from 'prisma/config' // Vérifie bien que c'est '@prisma/config' si erreur
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  // Pour les commandes CLI (migrate, db push), Prisma a besoin de savoir où taper
  datasource: {
    url: process.env.DATABASE_URL,
  },
  // La partie migrate avec l'adaptateur est utile pour le runtime/client
  migrate: {
    adapter: () => {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL })
      return new PrismaPg(pool)
    },
  },
})