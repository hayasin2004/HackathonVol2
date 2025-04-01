/*
  Warnings:

  - You are about to drop the column `userId` on the `PlayerData` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[playerId]` on the table `PlayerData` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PlayerData" DROP CONSTRAINT "PlayerData_userId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerItem" DROP CONSTRAINT "PlayerItem_playerDataId_fkey";

-- DropIndex
DROP INDEX "PlayerData_userId_key";

-- AlterTable
ALTER TABLE "PlayerData" DROP COLUMN "userId",
ADD COLUMN     "playerId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "PlayerData_playerId_key" ON "PlayerData"("playerId");

-- AddForeignKey
ALTER TABLE "PlayerData" ADD CONSTRAINT "PlayerData_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerItem" ADD CONSTRAINT "PlayerItem_playerDataId_fkey" FOREIGN KEY ("playerDataId") REFERENCES "PlayerData"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;
