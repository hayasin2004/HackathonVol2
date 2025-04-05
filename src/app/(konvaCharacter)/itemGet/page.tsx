import React from 'react';
import prisma from "@/lib/prismaClient";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import ItemControllerKonva from "@/components/(konva)/itemControllerKonva/ItemControllerKonva";
import {allNeedCraftItem, itemList} from "@/repository/prisma/ClientItemRepository";
import {defaultItem} from "@/types/defaultItem";
import Image from "next/image";

const ItemGet = async () => {

    const session = await getServerSession(authOptions)

    const userHaveCharacterData = await prisma.character.findFirst({
        where: {
            userId: session?.user.id
        }
    })
    const userHavePlayerData = await prisma.playerData.findFirst({
        where: {
            playerId: session?.user.id
        }
    })
    const itemArray = await itemList()

    const needCraftItem = await allNeedCraftItem()
    console.log(needCraftItem)


    console.log("取得してきた userHaveCharacterData :" + JSON.stringify(userHaveCharacterData))


    return (
        <div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                {itemArray?.map((defaultItem: defaultItem) => (
                    <div
                        key={defaultItem.id}
                        style={{
                            flex: '1 0 22%', // 1行に最大4個（約25%未満）
                            border: '1px solid #ccc',
                            padding: '16px',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                        }}
                    >
                        <h3>アイテムID: {defaultItem.id}</h3>
                        <p>名前: {defaultItem.itemName}</p>
                        <p>説明: {defaultItem.itemDescription}</p>
                        <Image
                            src={defaultItem.itemIcon || "/"}
                            alt="アイテムアイコン"
                            width={150}
                            height={0}
                            style={{height: 'auto'}} // アスペクト比維持
                        />
                    </div>
                ))}
            </div>



            <h1>ここはユーザーの図形を操れるページ</h1>
            <h2><ItemControllerKonva character={userHaveCharacterData} playerData={userHavePlayerData}
                                     needCraftItem={needCraftItem} itemArray={itemArray}/></h2>
        </div>
    );
}

export default ItemGet;