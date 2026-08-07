import {
  PrismaClient,
  Role,
  NotificationType,
  WeightSubjectType,
  AnimalStatus,
  BreedingStatus,
  Sex,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(num: number) {
  return String(num).padStart(3, '0');
}

function dayOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

const clusterNames = [
  { code: 'CL-001', name: 'Sangamneri North' },
  { code: 'CL-002', name: 'Sangamneri East' },
  { code: 'CL-003', name: 'Sangamneri West' },
  { code: 'CL-004', name: 'Sangamneri Central' },
  { code: 'CL-005', name: 'Sangamneri South' },
];

const villageNames = [
  'Gavthan',
  'Maalgaon',
  'Chincholi',
  'Sukhkalgav',
  'Rajwade',
  'Shindewadi',
  'Anandpur',
  'Mahurwadi',
  'Bhose',
  'Ambe',
  'Virgaon',
  'Dhamangaon',
  'Kapsi',
  'Palasgaon',
  'Devgaon',
  'Nimgaon',
  'Dhamani',
  'Kothale',
  'Waghole',
  'Bhumka',
];

const farmerNames = [
  'Ajay Patil',
  'Sunita More',
  'Basant Shinde',
  'Rekha Pawar',
  'Prakash Gaikwad',
  'Sneha Rajput',
  'Ramesh Kale',
  'Asha Deshmukh',
  'Vishal Bhosale',
  'Geeta Shirole',
  'Nitin Shinde',
  'Bindu Jadhav',
  'Sachin Gawande',
  'Leela Patil',
  'Pankaj More',
  'Smita Shinde',
  'Amol Pawar',
  'Uma Gaikwad',
  'Pravin Rajput',
  'Lata Kale',
  'Mohan Deshmukh',
  'Mina Bhosale',
  'Yogesh Shirole',
  'Sheetal Jadhav',
  'Ajinkya Gawande',
  'Meena Patil',
  'Dilip More',
  'Chanda Shinde',
  'Sunil Pawar',
  'Vaishali Gaikwad',
  'Rohit Rajput',
  'Dipali Kale',
  'Anil Deshmukh',
  'Pooja Bhosale',
  'Shyam Shirole',
  'Aarti Jadhav',
  'Kiran Gawande',
  'Tanuja Patil',
  'Vijay More',
  'Sonal Shinde',
  'Rajesh Pawar',
  'Rita Gaikwad',
  'Sanjay Rajput',
  'Snehal Kale',
  'Manoj Deshmukh',
  'Asha Bhosale',
  'Uday Shirole',
  'Vijayalakshmi Jadhav',
  'Chaitali Gawande',
];

const notificationTitles = [
  'Breeding reminder',
  'Data sync completed',
  'System maintenance',
  'New farmer registered',
  'Weight data missing',
];

const notificationBodies = [
  'A breeding event is scheduled tomorrow.',
  'Your data has been synchronized successfully.',
  'System maintenance is planned for tonight.',
  'A new farmer has been added to your cluster.',
  'A weight record requires review.',
];

async function createDefaultClusters(adminId: string) {
  const created: Array<{ id: string; code: string }> = [];

  for (const cluster of clusterNames) {
    const record = await prisma.cluster.upsert({
      where: { code: cluster.code },
      update: {
        name: cluster.name,
        description: `Sample default cluster for ${cluster.name}`,
        district: 'Ahmednagar',
        state: 'Maharashtra',
        isActive: true,
        createdById: adminId,
      },
      create: {
        code: cluster.code,
        name: cluster.name,
        description: `Sample default cluster for ${cluster.name}`,
        district: 'Ahmednagar',
        state: 'Maharashtra',
        isActive: true,
        createdById: adminId,
      },
    });
    created.push({ id: record.id, code: record.code });
  }

  return created;
}

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const adminEmail = 'admin@aicrp.gov.in';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      fullName: 'System Administrator',
      role: Role.DIRECTOR,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      fullName: 'System Administrator',
      role: Role.DIRECTOR,
      isActive: true,
    },
  });

  const clusterCount = await prisma.cluster.count();
  const clusters =
    clusterCount === 0
      ? await createDefaultClusters(admin.id)
      : await prisma.cluster.findMany({ select: { id: true, code: true } });

  const villages: Array<{ id: string; clusterId: string }> = [];
  const existingVillages = await prisma.village.count();
  if (existingVillages < 20) {
    let count = 0;
    for (const cluster of clusters) {
      for (let i = 0; i < 4 && count < 20; i += 1) {
        const code = `V-${pad(count + 1)}`;
        const village = await prisma.village.upsert({
          where: { clusterId_code: { clusterId: cluster.id, code } },
          update: {
            name: villageNames[count],
            clusterId: cluster.id,
            isActive: true,
          },
          create: {
            clusterId: cluster.id,
            code,
            name: villageNames[count],
            latitude: 19.166 + Math.random() * 0.5,
            longitude: 74.666 + Math.random() * 0.5,
            isActive: true,
          },
        });
        villages.push({ id: village.id, clusterId: cluster.id });
        count += 1;
      }
    }
  } else {
    const rows = await prisma.village.findMany({ select: { id: true, clusterId: true }, take: 20 });
    villages.push(...rows);
  }

  const farmers: Array<{ id: string; villageId: string }> = [];
  const existingFarmers = await prisma.farmer.count();
  if (existingFarmers < 50) {
    for (let i = 0; i < 50; i += 1) {
      const village = villages[i % villages.length];
      const code = `F-${pad(i + 1)}`;
      const farmer = await prisma.farmer.upsert({
        where: { villageId_code: { villageId: village.id, code } },
        update: {
          fullName: farmerNames[i % farmerNames.length],
          phone: `91234${pad(i + 1)}`,
          address: `House ${i + 1}, ${villageNames[i % villageNames.length]}`,
          gender: i % 2 === 0 ? 'Male' : 'Female',
          isActive: true,
        },
        create: {
          villageId: village.id,
          code,
          fullName: farmerNames[i % farmerNames.length],
          phone: `91234${pad(i + 1)}`,
          address: `House ${i + 1}, ${villageNames[i % villageNames.length]}`,
          gender: i % 2 === 0 ? 'Male' : 'Female',
          isActive: true,
        },
      });
      farmers.push({ id: farmer.id, villageId: village.id });
    }
  } else {
    const rows = await prisma.farmer.findMany({ select: { id: true, villageId: true }, take: 50 });
    farmers.push(...rows);
  }

  const clusterFarmerMap = new Map<string, string[]>();
  for (const farmer of farmers) {
    const village = await prisma.village.findUnique({ where: { id: farmer.villageId }, select: { clusterId: true } });
    if (!village) continue;
    clusterFarmerMap.set(village.clusterId, [...(clusterFarmerMap.get(village.clusterId) ?? []), farmer.id]);
  }

  const bucks: Array<{ id: string; clusterId: string; farmerId: string }> = [];
  const existingBucks = await prisma.buck.count();
  if (existingBucks < 30) {
    for (let i = 0; i < 30; i += 1) {
      const cluster = clusters[i % clusters.length];
      const farmerIds = clusterFarmerMap.get(cluster.id) ?? farmers.map((f) => f.id);
      const farmerId = farmerIds[i % farmerIds.length];
      const tagNumber = `BCK-${pad(i + 1)}`;
      const birthDate = dayOffset(randomBetween(400, 900));
      const buck = await prisma.buck.upsert({
        where: { tagNumber },
        update: {
          name: `Buck ${i + 1}`,
          breed: 'Sangamneri',
          dateOfBirth: birthDate,
          status: 'ACTIVE',
          clusterId: cluster.id,
          farmerId,
          registeredById: admin.id,
        },
        create: {
          tagNumber,
          name: `Buck ${i + 1}`,
          breed: 'Sangamneri',
          dateOfBirth: birthDate,
          status: 'ACTIVE',
          clusterId: cluster.id,
          farmerId,
          registeredById: admin.id,
        },
      });
      bucks.push({ id: buck.id, clusterId: cluster.id, farmerId });
    }
  } else {
    const rows = await prisma.buck.findMany({ select: { id: true, clusterId: true, farmerId: true }, take: 30 });
    bucks.push(...rows);
  }

  const does: Array<{ id: string; clusterId: string; farmerId: string }> = [];
  const existingDoes = await prisma.doe.count();
  if (existingDoes < 100) {
    for (let i = 0; i < 100; i += 1) {
      const cluster = clusters[i % clusters.length];
      const farmerIds = clusterFarmerMap.get(cluster.id) ?? farmers.map((f) => f.id);
      const farmerId = farmerIds[i % farmerIds.length];
      const tagNumber = `DOE-${pad(i + 1)}`;
      const birthDate = dayOffset(randomBetween(250, 800));
      const doe = await prisma.doe.upsert({
        where: { tagNumber },
        update: {
          name: `Doe ${i + 1}`,
          breed: 'Sangamneri',
          dateOfBirth: birthDate,
          status: 'ACTIVE',
          clusterId: cluster.id,
          farmerId,
          registeredById: admin.id,
        },
        create: {
          tagNumber,
          name: `Doe ${i + 1}`,
          breed: 'Sangamneri',
          dateOfBirth: birthDate,
          status: 'ACTIVE',
          clusterId: cluster.id,
          farmerId,
          registeredById: admin.id,
        },
      });
      does.push({ id: doe.id, clusterId: cluster.id, farmerId });
    }
  } else {
    const rows = await prisma.doe.findMany({ select: { id: true, clusterId: true, farmerId: true }, take: 100 });
    does.push(...rows);
  }

  const breedingEvents: Array<{ id: string; buckId: string; doeId: string; status: string }> = [];
  const existingBreedings = await prisma.breedingEvent.count();
  if (existingBreedings < 150) {
    for (let i = 0; i < 150; i += 1) {
      const cluster = clusters[i % clusters.length];
      const clusterBucks = bucks.filter((buck) => buck.clusterId === cluster.id);
      const clusterDoes = does.filter((doe) => doe.clusterId === cluster.id);
      if (clusterBucks.length === 0 || clusterDoes.length === 0) continue;
      const buck = clusterBucks[i % clusterBucks.length];
      const doe = clusterDoes[i % clusterDoes.length];
      const matingDate = dayOffset(randomBetween(1, 180));
      const expectedKiddingDate = new Date(matingDate);
      expectedKiddingDate.setDate(expectedKiddingDate.getDate() + randomBetween(140, 160));
      const statuses: BreedingStatus[] = ['PLANNED', 'MATED', 'PREGNANT', 'KIDDED', 'FAILED', 'CANCELLED'];
      const status = statuses[i % statuses.length];
      const actualKiddingDate = status === 'KIDDED' || status === 'FAILED'
        ? new Date(expectedKiddingDate)
        : null;
      if (actualKiddingDate) {
        actualKiddingDate.setDate(actualKiddingDate.getDate() + randomBetween(-5, 5));
      }
      const breeding = await prisma.breedingEvent.create({
        data: {
          buckId: buck.id,
          doeId: doe.id,
          matingType: i % 5 === 0 ? 'ARTIFICIAL_INSEMINATION' : 'NATURAL',
          matingDate,
          expectedKiddingDate,
          actualKiddingDate,
          status,
          notes: `Breeding event ${i + 1}`,
          gpsLatitude: 19.2 + Math.random() * 0.4,
          gpsLongitude: 74.7 + Math.random() * 0.4,
          recordedById: admin.id,
        },
      });
      breedingEvents.push({ id: breeding.id, buckId: buck.id, doeId: doe.id, status: status });
    }
  } else {
    const rows = await prisma.breedingEvent.findMany({ select: { id: true, buckId: true, doeId: true, status: true }, take: 150 });
    breedingEvents.push(...rows);
  }

  const progenies: Array<{ id: string; birthDate: Date }> = [];
  const existingProgeny = await prisma.progeny.count();
  if (existingProgeny < 80) {
    const kiddedEvents = breedingEvents.filter((event) => event.status === 'KIDDED');
    for (let i = 0; i < 80; i += 1) {
      const event = kiddedEvents[i % kiddedEvents.length] ?? breedingEvents[i % breedingEvents.length];
      const date = event.id ? new Date() : dayOffset(randomBetween(20, 120));
      const tagNumber = `PRG-${pad(i + 1)}`;
      const farmerId = farmers[randomBetween(0, farmers.length - 1)].id;
      const birthDate = dayOffset(randomBetween(5, 120));
      const progeny = await prisma.progeny.upsert({
        where: { tagNumber },
        update: {
          breedingEventId: event.id,
          sex: i % 2 === 0 ? 'MALE' : 'FEMALE',
          birthDate,
          birthWeightKg: Number((randomBetween(2, 6) + Math.random()).toFixed(1)),
          status: 'ACTIVE',
          farmerId,
          registeredById: admin.id,
        },
        create: {
          breedingEventId: event.id,
          tagNumber,
          sex: i % 2 === 0 ? 'MALE' : 'FEMALE',
          birthDate,
          birthWeightKg: Number((randomBetween(2, 6) + Math.random()).toFixed(1)),
          status: 'ACTIVE',
          farmerId,
          registeredById: admin.id,
        },
      });
      progenies.push({ id: progeny.id, birthDate: progeny.birthDate });
    }
  } else {
    const rows = await prisma.progeny.findMany({ select: { id: true, birthDate: true }, take: 80 });
    progenies.push(...rows);
  }

  const existingWeights = await prisma.weightRecord.count();
  if (existingWeights < 100) {
    const subjects = [
      ...bucks.map((buck) => ({ type: WeightSubjectType.BUCK, id: buck.id })),
      ...does.map((doe) => ({ type: WeightSubjectType.DOE, id: doe.id })),
      ...progenies.map((prog) => ({ type: WeightSubjectType.PROGENY, id: prog.id })),
    ];
    for (let i = 0; i < 100; i += 1) {
      const subject = subjects[randomBetween(0, subjects.length - 1)];
      await prisma.weightRecord.create({
        data: {
          subjectType: subject.type,
          subjectId: subject.id,
          weightKg: Number((randomBetween(2, 50) + Math.random()).toFixed(1)),
          recordedAt: dayOffset(randomBetween(0, 120)),
          notes: `Weight record ${i + 1}`,
          gpsLatitude: 19.2 + Math.random() * 0.4,
          gpsLongitude: 74.7 + Math.random() * 0.4,
          recordedById: admin.id,
        },
      });
    }
  }

  const existingNotifications = await prisma.notification.count();
  if (existingNotifications < 20) {
    for (let i = 0; i < 20; i += 1) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: notificationTitles[i % notificationTitles.length],
          body: notificationBodies[i % notificationBodies.length],
          type: i % 4 === 0 ? NotificationType.BREEDING_REMINDER : NotificationType.GENERAL,
          isRead: i % 3 === 0,
          metadata: {
            reference: `item-${i + 1}`,
          },
        },
      });
    }
  }

  const existingAudit = await prisma.auditLog.count();
  if (existingAudit < 40) {
    const actions = [
      'CLUSTER_CREATE',
      'VILLAGE_CREATE',
      'FARMER_CREATE',
      'BUCK_CREATE',
      'DOE_CREATE',
      'BREEDING_CREATE',
      'PROGENY_CREATE',
      'WEIGHT_CREATE',
      'NOTIFICATION_CREATE',
    ];
    for (let i = 0; i < 40; i += 1) {
      await prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: actions[i % actions.length],
          entityType: actions[i % actions.length].split('_')[0],
          entityId: i < clusters.length ? clusters[i].id : null,
          metadata: { index: i + 1 },
        },
      });
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
