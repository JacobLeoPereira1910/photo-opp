import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

export class PrismaDatabaseClient {
  constructor({ env }) {
    this.pool = new Pool({
      connectionString: env.DATABASE_URL
    });
    this.adapter = new PrismaPg(this.pool);
    this.client = new PrismaClient({
      adapter: this.adapter
    });
  }

  async close() {
    await this.client.$disconnect();
    await this.pool.end();
  }
}
