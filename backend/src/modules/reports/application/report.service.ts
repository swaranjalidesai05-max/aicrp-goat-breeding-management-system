import { prisma } from '../../../infrastructure/database/prisma';

export class ReportService {
  async dashboard() {
    const [clusterCount, villageCount, farmerCount, buckCount, doeCount, breedingCount, progenyCount, notificationCount] = await prisma.$transaction([
      prisma.cluster.count(),
      prisma.village.count(),
      prisma.farmer.count(),
      prisma.buck.count(),
      prisma.doe.count(),
      prisma.breedingEvent.count(),
      prisma.progeny.count(),
      prisma.notification.count(),
    ]);

    return {
      clusterCount,
      villageCount,
      farmerCount,
      buckCount,
      doeCount,
      breedingCount,
      progenyCount,
      notificationCount,
    };
  }
}

export const reportService = new ReportService();
