import { PrismaClient, ProjectStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 12);

  const adminEmail = 'admin@inversiones-horizonte.cl';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  let adminId: string;

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hash,
        fullName: 'Administrador',
        role: 'admin',
        isVerified: true,
      },
    });
    adminId = admin.id;
    console.log('Admin user created:', adminEmail);
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { passwordHash: hash, isVerified: true },
    });
    adminId = existingAdmin.id;
    console.log('Admin password updated');
  }

  const viewerEmail = 'viewer@inversiones-horizonte.cl';
  const existingViewer = await prisma.user.findUnique({ where: { email: viewerEmail } });
  if (!existingViewer) {
    await prisma.user.create({
      data: {
        email: viewerEmail,
        passwordHash: hash,
        fullName: 'Visor Admin',
        role: 'readonly_admin',
        isVerified: true,
      },
    });
    console.log('Readonly admin created:', viewerEmail);
  } else {
    await prisma.user.update({
      where: { email: viewerEmail },
      data: { passwordHash: hash, role: 'readonly_admin', isVerified: true },
    });
    console.log('Readonly admin updated');
  }

  const projects = [
    {
      slug: 'flipping-santiagiv',
      title: 'Flipping SantiagIV',
      shortDescription: 'Flipping inmobiliario en Santiago con horizonte de 12 meses.',
      description:
        'Proyecto de flipping inmobiliario enfocado en compra, remodelación y venta de una propiedad en Santiago. Estrategia orientada a maximizar plusvalía en un plazo acotado.',
      status: ProjectStatus.por_financiarse,
      category: 'Flipping',
      location: 'Santiago, Región Metropolitana',
      targetAmount: 131_000_000,
      raisedAmount: 52_400_000,
      minInvestmentAmount: 250_000,
      estimatedReturnPct: 15.2,
      estimatedReturnMinPct: 15.2,
      estimatedReturnMaxPct: 15.2,
      estimatedDurationMonths: 12,
      startDate: new Date('2026-03-10'),
      projectedEndDate: new Date('2026-09-30'),
      coverImageUrl: '/projects/flipping-santiagiv.png',
      isPublic: true,
      publishedAt: new Date('2026-03-10T12:00:00.000Z'),
      createdById: adminId,
    },
    {
      slug: 'flipping-santiago-iii',
      title: 'Flipping Santiago III',
      shortDescription: 'Flipping con financiamiento completado y ejecución en curso.',
      description:
        'Proyecto de flipping inmobiliario con financiamiento completado. En etapa de ejecución del plan de remodelación y comercialización.',
      status: ProjectStatus.financiado,
      category: 'Flipping',
      location: 'Santiago, Región Metropolitana',
      targetAmount: 130_000_000,
      raisedAmount: 130_000_000,
      minInvestmentAmount: 250_000,
      estimatedReturnPct: 15.8,
      estimatedReturnMinPct: 15.8,
      estimatedReturnMaxPct: 15.8,
      estimatedDurationMonths: 12,
      startDate: new Date('2026-02-05'),
      projectedEndDate: new Date('2026-07-31'),
      coverImageUrl: '/projects/flipping-santiago-iii.png',
      isPublic: true,
      publishedAt: new Date('2026-02-05T10:00:00.000Z'),
      createdById: adminId,
    },
    {
      slug: 'flipping-santiago-ii',
      title: 'Flipping Santiago II',
      shortDescription: 'Proyecto de flipping finalizado con rentabilidad final definida.',
      description:
        'Proyecto de flipping completado. Se ejecutó la remodelación y la venta final con rentabilidad alcanzada según lo proyectado.',
      status: ProjectStatus.terminado,
      category: 'Flipping',
      location: 'Santiago, Región Metropolitana',
      targetAmount: 60_500_000,
      raisedAmount: 60_500_000,
      minInvestmentAmount: 200_000,
      estimatedReturnPct: 17.9,
      estimatedReturnMinPct: 17.9,
      estimatedReturnMaxPct: 17.9,
      estimatedDurationMonths: 11,
      startDate: new Date('2025-08-01'),
      projectedEndDate: null,
      coverImageUrl: '/projects/flipping-santiago-ii.png',
      isPublic: true,
      publishedAt: new Date('2025-11-12T14:00:00.000Z'),
      createdById: adminId,
    },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: { ...p },
      create: { ...p },
    });
    console.log(`Project upserted: ${p.title}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
