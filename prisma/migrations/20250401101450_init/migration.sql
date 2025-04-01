/*
  Warnings:

  - You are about to drop the column `playerId` on the `PlayerData` table. All the data in the column will be lost.
  - You are about to drop the column `playerId` on the `PlayerItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `PlayerData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `playerDataId` to the `PlayerItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlayerData" DROP CONSTRAINT "PlayerData_playerId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerItem" DROP CONSTRAINT "PlayerItem_playerId_fkey";

-- AlterTable
ALTER TABLE "PlayerData" DROP COLUMN "playerId",
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "PlayerItem" DROP COLUMN "playerId",
ADD COLUMN     "playerDataId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlayerData_userId_key" ON "PlayerData"("userId");

-- AddForeignKey
ALTER TABLE "PlayerData" ADD CONSTRAINT "PlayerData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerItem" ADD CONSTRAINT "PlayerItem_playerDataId_fkey" FOREIGN KEY ("playerDataId") REFERENCES "PlayerData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
