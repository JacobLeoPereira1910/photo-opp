import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter
});

async function upsertUser({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role
    },
    create: {
      name,
      email,
      passwordHash,
      role
    }
  });
}

async function upsertDemoExpiredPhoto(promoterId) {
  const photoId = 'playwright-expired-demo';
  const expiresAt = new Date(Date.now() - 15 * 60 * 1000);

  return prisma.photo.upsert({
    where: { id: photoId },
    update: {
      originalUrl: '/event-assets/nexlab-default/frame-overlay.svg',
      framedUrl: '/event-assets/nexlab-default/frame-overlay.svg',
      downloadUrl: `/api/v1/activation/photos/${photoId}/download`,
      qrCodeUrl: null,
      qrCodeValue: `/api/v1/activation/photos/${photoId}/access`,
      status: 'READY',
      frameName: 'NEXLAB FIGMA',
      promoterId,
      metadata: {
        originalFilename: 'demo-expired.png',
        originalContentType: 'image/png',
        outputContentType: 'image/png',
        size: 0,
        event: {
          key: 'nexlab-default',
          slug: 'nexlab-photo-opp',
          name: 'NEX.lab Photo Opp'
        },
        frame: {
          value: 'NEXLAB FIGMA',
          label: 'NEXLAB Figma',
          assetUrl: '/event-assets/nexlab-default/frame-overlay.svg'
        },
        qr: {
          ttlSeconds: 900,
          createdAt: new Date(expiresAt.getTime() - 900 * 1000).toISOString(),
          expiresAt: expiresAt.toISOString(),
          accessUrl: `/api/v1/activation/photos/${photoId}/access`
        }
      }
    },
    create: {
      id: photoId,
      originalUrl: '/event-assets/nexlab-default/frame-overlay.svg',
      framedUrl: '/event-assets/nexlab-default/frame-overlay.svg',
      downloadUrl: `/api/v1/activation/photos/${photoId}/download`,
      qrCodeUrl: null,
      qrCodeValue: `/api/v1/activation/photos/${photoId}/access`,
      status: 'READY',
      frameName: 'NEXLAB FIGMA',
      promoterId,
      metadata: {
        originalFilename: 'demo-expired.png',
        originalContentType: 'image/png',
        outputContentType: 'image/png',
        size: 0,
        event: {
          key: 'nexlab-default',
          slug: 'nexlab-photo-opp',
          name: 'NEX.lab Photo Opp'
        },
        frame: {
          value: 'NEXLAB FIGMA',
          label: 'NEXLAB Figma',
          assetUrl: '/event-assets/nexlab-default/frame-overlay.svg'
        },
        qr: {
          ttlSeconds: 900,
          createdAt: new Date(expiresAt.getTime() - 900 * 1000).toISOString(),
          expiresAt: expiresAt.toISOString(),
          accessUrl: `/api/v1/activation/photos/${photoId}/access`
        }
      }
    }
  });
}

async function main() {
  await upsertUser({
    name: 'Administrador Nexlab',
    email: 'admin@nexlab.com',
    password: '123456',
    role: 'ADMIN'
  });

  const promoter = await upsertUser({
    name: 'Promoter Nexlab',
    email: 'promoter@nexlab.com',
    password: '123456',
    role: 'PROMOTER'
  });

  await upsertDemoExpiredPhoto(promoter.id);

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed.', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
