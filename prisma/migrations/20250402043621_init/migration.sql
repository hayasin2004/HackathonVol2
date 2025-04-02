/*
  Warnings:

  - You are about to drop the column `itemId` on the `DefaultItemList` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DefaultItemList" DROP CONSTRAINT "DefaultItemList_itemId_fkey";

-- AlterTable
ALTER TABLE "DefaultItemList" DROP COLUMN "itemId",
ADD COLUMN     "needCraftItemId" INTEGER;

-- AddForeignKey
ALTER TABLE "DefaultItemList" ADD CONSTRAINT "DefaultItemList_needCraftItemId_fkey" FOREIGN KEY ("needCraftItemId") REFERENCES "CraftTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
