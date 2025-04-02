/*
  Warnings:

  - Added the required column `itemId` to the `DefaultItemList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DefaultItemList" ADD COLUMN     "isNeedCreate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "itemId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "CraftTable" (
    "id" SERIAL NOT NULL,
    "cratedItem" INTEGER[],
    "crateItemNeedQuantity" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CraftTable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DefaultItemList" ADD CONSTRAINT "DefaultItemList_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CraftTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
