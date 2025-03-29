/*
  Warnings:

  - A unique constraint covering the columns `[followersId,followingsId]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Follow_followersId_followingsId_key" ON "Follow"("followersId", "followingsId");
