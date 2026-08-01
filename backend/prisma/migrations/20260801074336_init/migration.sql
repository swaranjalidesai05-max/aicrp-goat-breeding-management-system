-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FIELD_STAFF', 'VETERINARIAN');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('ACTIVE', 'SOLD', 'DEAD', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MatingType" AS ENUM ('NATURAL', 'ARTIFICIAL_INSEMINATION');

-- CreateEnum
CREATE TYPE "BreedingStatus" AS ENUM ('PLANNED', 'MATED', 'PREGNANT', 'KIDDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WeightSubjectType" AS ENUM ('BUCK', 'DOE', 'PROGENY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'SYNC_CONFLICT', 'REPORT', 'BREEDING_REMINDER', 'GENERAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cluster" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "district" TEXT,
    "state" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "gender" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buck" (
    "id" TEXT NOT NULL,
    "tagNumber" TEXT NOT NULL,
    "name" TEXT,
    "breed" TEXT NOT NULL DEFAULT 'Sangamneri',
    "dateOfBirth" TIMESTAMP(3),
    "status" "AnimalStatus" NOT NULL DEFAULT 'ACTIVE',
    "clusterId" TEXT NOT NULL,
    "farmerId" TEXT,
    "sireTag" TEXT,
    "damTag" TEXT,
    "microchipId" TEXT,
    "notes" TEXT,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "registeredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doe" (
    "id" TEXT NOT NULL,
    "tagNumber" TEXT NOT NULL,
    "name" TEXT,
    "breed" TEXT NOT NULL DEFAULT 'Sangamneri',
    "dateOfBirth" TIMESTAMP(3),
    "status" "AnimalStatus" NOT NULL DEFAULT 'ACTIVE',
    "clusterId" TEXT NOT NULL,
    "farmerId" TEXT,
    "sireTag" TEXT,
    "damTag" TEXT,
    "microchipId" TEXT,
    "notes" TEXT,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "registeredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreedingEvent" (
    "id" TEXT NOT NULL,
    "buckId" TEXT NOT NULL,
    "doeId" TEXT NOT NULL,
    "matingType" "MatingType" NOT NULL DEFAULT 'NATURAL',
    "matingDate" TIMESTAMP(3) NOT NULL,
    "expectedKiddingDate" TIMESTAMP(3),
    "actualKiddingDate" TIMESTAMP(3),
    "status" "BreedingStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreedingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progeny" (
    "id" TEXT NOT NULL,
    "breedingEventId" TEXT NOT NULL,
    "tagNumber" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthWeightKg" DOUBLE PRECISION,
    "status" "AnimalStatus" NOT NULL DEFAULT 'ACTIVE',
    "farmerId" TEXT,
    "notes" TEXT,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "registeredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progeny_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightRecord" (
    "id" TEXT NOT NULL,
    "subjectType" "WeightSubjectType" NOT NULL,
    "subjectId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeightRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'GENERAL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "platform" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Cluster_code_key" ON "Cluster"("code");

-- CreateIndex
CREATE INDEX "Cluster_isActive_idx" ON "Cluster"("isActive");

-- CreateIndex
CREATE INDEX "Village_clusterId_idx" ON "Village"("clusterId");

-- CreateIndex
CREATE INDEX "Village_isActive_idx" ON "Village"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Village_clusterId_code_key" ON "Village"("clusterId", "code");

-- CreateIndex
CREATE INDEX "Farmer_villageId_idx" ON "Farmer"("villageId");

-- CreateIndex
CREATE INDEX "Farmer_isActive_idx" ON "Farmer"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_villageId_code_key" ON "Farmer"("villageId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Buck_tagNumber_key" ON "Buck"("tagNumber");

-- CreateIndex
CREATE INDEX "Buck_clusterId_idx" ON "Buck"("clusterId");

-- CreateIndex
CREATE INDEX "Buck_farmerId_idx" ON "Buck"("farmerId");

-- CreateIndex
CREATE INDEX "Buck_status_idx" ON "Buck"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Doe_tagNumber_key" ON "Doe"("tagNumber");

-- CreateIndex
CREATE INDEX "Doe_clusterId_idx" ON "Doe"("clusterId");

-- CreateIndex
CREATE INDEX "Doe_farmerId_idx" ON "Doe"("farmerId");

-- CreateIndex
CREATE INDEX "Doe_status_idx" ON "Doe"("status");

-- CreateIndex
CREATE INDEX "BreedingEvent_buckId_idx" ON "BreedingEvent"("buckId");

-- CreateIndex
CREATE INDEX "BreedingEvent_doeId_idx" ON "BreedingEvent"("doeId");

-- CreateIndex
CREATE INDEX "BreedingEvent_status_idx" ON "BreedingEvent"("status");

-- CreateIndex
CREATE INDEX "BreedingEvent_matingDate_idx" ON "BreedingEvent"("matingDate");

-- CreateIndex
CREATE UNIQUE INDEX "Progeny_tagNumber_key" ON "Progeny"("tagNumber");

-- CreateIndex
CREATE INDEX "Progeny_breedingEventId_idx" ON "Progeny"("breedingEventId");

-- CreateIndex
CREATE INDEX "Progeny_farmerId_idx" ON "Progeny"("farmerId");

-- CreateIndex
CREATE INDEX "Progeny_status_idx" ON "Progeny"("status");

-- CreateIndex
CREATE INDEX "WeightRecord_subjectType_subjectId_idx" ON "WeightRecord"("subjectType", "subjectId");

-- CreateIndex
CREATE INDEX "WeightRecord_recordedAt_idx" ON "WeightRecord"("recordedAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "SyncDevice_userId_idx" ON "SyncDevice"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SyncDevice_userId_deviceId_key" ON "SyncDevice"("userId", "deviceId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cluster" ADD CONSTRAINT "Cluster_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farmer" ADD CONSTRAINT "Farmer_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buck" ADD CONSTRAINT "Buck_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buck" ADD CONSTRAINT "Buck_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buck" ADD CONSTRAINT "Buck_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doe" ADD CONSTRAINT "Doe_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doe" ADD CONSTRAINT "Doe_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doe" ADD CONSTRAINT "Doe_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreedingEvent" ADD CONSTRAINT "BreedingEvent_buckId_fkey" FOREIGN KEY ("buckId") REFERENCES "Buck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreedingEvent" ADD CONSTRAINT "BreedingEvent_doeId_fkey" FOREIGN KEY ("doeId") REFERENCES "Doe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreedingEvent" ADD CONSTRAINT "BreedingEvent_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progeny" ADD CONSTRAINT "Progeny_breedingEventId_fkey" FOREIGN KEY ("breedingEventId") REFERENCES "BreedingEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progeny" ADD CONSTRAINT "Progeny_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progeny" ADD CONSTRAINT "Progeny_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightRecord" ADD CONSTRAINT "WeightRecord_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncDevice" ADD CONSTRAINT "SyncDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
