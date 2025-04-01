-- DropForeignKey
ALTER TABLE "PlayerItem" DROP CONSTRAINT "PlayerItem_playerDataId_fkey";

-- AddForeignKey
ALTER TABLE "PlayerItem" ADD CONSTRAINT "PlayerItem_playerDataId_fkey" FOREIGN KEY ("playerDataId") REFERENCES "PlayerData"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
