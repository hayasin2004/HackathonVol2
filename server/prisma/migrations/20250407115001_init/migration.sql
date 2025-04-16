-- DropForeignKey
ALTER TABLE "PlayerItem" DROP CONSTRAINT "PlayerItem_playerDataId_fkey";

-- RenameForeignKey
ALTER TABLE "PlayerData" RENAME CONSTRAINT "PlayerData_roomId_fkey_2" TO "PlayerData_roomId_fkey";

-- AddForeignKey
ALTER TABLE "PlayerItem" ADD CONSTRAINT "PlayerItem_playerDataId_fkey" FOREIGN KEY ("playerDataId") REFERENCES "PlayerData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
