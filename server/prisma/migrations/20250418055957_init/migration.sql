-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "parts" JSONB NOT NULL,
    "iconImage" TEXT[],
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" SERIAL NOT NULL,
    "followingsId" INTEGER NOT NULL,
    "followersId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerData" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER,
    "x" INTEGER NOT NULL DEFAULT 64,
    "y" INTEGER NOT NULL DEFAULT 64,
    "roomId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerItem" (
    "id" SERIAL NOT NULL,
    "playerDataId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultItemList" (
    "id" SERIAL NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "itemIcon" TEXT,
    "x" INTEGER,
    "y" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DefaultItemList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraftItem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdItemId" INTEGER NOT NULL,

    CONSTRAINT "CraftItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraftItemMaterial" (
    "id" SERIAL NOT NULL,
    "craftItemId" INTEGER NOT NULL,
    "materialItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CraftItemMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomItem" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER DEFAULT 64,
    "height" INTEGER DEFAULT 64,
    "iconImage" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Follow_followersId_idx" ON "Follow"("followersId");

-- CreateIndex
CREATE INDEX "Follow_followingsId_idx" ON "Follow"("followingsId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followersId_followingsId_key" ON "Follow"("followersId", "followingsId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerData_playerId_key" ON "PlayerData"("playerId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingsId_fkey" FOREIGN KEY ("followingsId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followersId_fkey" FOREIGN KEY ("followersId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerData" ADD CONSTRAINT "PlayerData_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerData" ADD CONSTRAINT "PlayerData_roomId_fkey_1" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerData" ADD CONSTRAINT "PlayerData_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerItem" ADD CONSTRAINT "PlayerItem_playerDataId_fkey" FOREIGN KEY ("playerDataId") REFERENCES "PlayerData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerItem" ADD CONSTRAINT "PlayerItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "DefaultItemList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftItem" ADD CONSTRAINT "CraftItem_createdItemId_fkey" FOREIGN KEY ("createdItemId") REFERENCES "DefaultItemList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftItemMaterial" ADD CONSTRAINT "CraftItemMaterial_craftItemId_fkey" FOREIGN KEY ("craftItemId") REFERENCES "CraftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftItemMaterial" ADD CONSTRAINT "CraftItemMaterial_materialItemId_fkey" FOREIGN KEY ("materialItemId") REFERENCES "DefaultItemList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomItem" ADD CONSTRAINT "RoomItem_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomItem" ADD CONSTRAINT "RoomItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "DefaultItemList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
