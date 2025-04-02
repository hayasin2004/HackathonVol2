import React from 'react';
import prisma from "@/lib/prismaClient";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import ItemControllerKonva from "@/components/(konva)/itemControllerKonva/ItemControllerKonva";
import {itemList, playerCoordinate} from "@/repository/prisma/ClientItemRepository";
import {defaultItem} from "@/types/defaultItem";
import {adminItemRepositoryDeleteItem, adminItemRepositoryUpdateItem} from "@/repository/prisma/adminItemRepository";
import PlayerPlaceSaveButton from "@/components/playerPlaceSaveButton/page";

const ItemGet =async () => {

    const session = await getServerSession(authOptions)

    const userHaveCharacterData = await prisma.playerData.findFirst({
        where: {
            playerId: session?.user.id
        }
    })
    const itemArray= await itemList()


    console.log("取得してきた userHaveCharacterData :" + JSON.stringify(userHaveCharacterData))


    return (
        <div>

            {itemArray?.map((defaultItem :defaultItem) => (
                <div key={defaultItem.id}>
                    <h2>アイテム: {defaultItem.id}</h2>
                    <h2>アイテム名: {defaultItem.itemName}</h2>
                    <h2>アイテム説明: {defaultItem.itemDescription}</h2>
                </div>
            ))}
            <h1>ここはユーザーの図形を操れるページ</h1>　
            <h2><ItemControllerKonva character={userHaveCharacterData} itemArray={itemArray} /></h2>
        </div>
    );
}

export default ItemGet;