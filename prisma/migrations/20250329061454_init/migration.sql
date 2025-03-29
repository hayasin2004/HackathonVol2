-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followersId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followingsId_fkey";

-- CreateIndex
CREATE INDEX "Follow_followersId_idx" ON "Follow"("followersId");

-- CreateIndex
CREATE INDEX "Follow_followingsId_idx" ON "Follow"("followingsId");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingsId_fkey" FOREIGN KEY ("followingsId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followersId_fkey" FOREIGN KEY ("followersId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
