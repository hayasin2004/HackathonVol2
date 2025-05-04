import {NextResponse} from "next/server";
import prisma from "@/lib/prismaClient";

import {PlayerItem} from "@/types/playerItem";

interface putItemType {
    roomId: number,
    selectedItemId: number,
    playerDirection: { current: string },
    currentDirectionRef: { current: string },
    ECollisionPosition: { x: number, y: number },
    playerId: PlayerItem,
}

export async function POST(req: Request,) {

    try {
        const body = await req.json();
        const {
            selectedItemId,
            ECollisionPosition,
            playerId
        } = body

        console.log("中身" + playerId);
        if (!playerId || !selectedItemId || !ECollisionPosition) {
            return NextResponse.json(
                {status: 'error', message: 'ユーザーの情報もしくはアイテムに関するエラーです。'},
                {status: 400}
            );
        }

        const putItem = await route(body)
        return NextResponse.json(
            {status: 'success', message: 'アイテムを設置しました。', data: putItem},
            {status: 200}
        );

    } catch (err) {
        console.error("アイテム設置エラー", err);
        return NextResponse.json(
            {status: 'error', message: err || 'クラフト中にエラーが発生しました'},
            {status: 500}
        );
    }
}


async function route(itemData: putItemType) {
    const {
        roomId,
        selectedItemId,
        playerDirection,
        currentDirectionRef,
        ECollisionPosition,
        playerId
    } = itemData;


    // 向いている方向の調整
    let XPosition = 0

    let YPosition = 0
    console.log("こっち見てる" + currentDirectionRef.current)
    console.log("こっち見てる" + playerId)
    if (currentDirectionRef.current == "ArrowLeft") {
        XPosition = -64
    }
    if (currentDirectionRef.current == "ArrowRight") {
        XPosition = 64
    }
    if (currentDirectionRef.current == "ArrowUp") {
        YPosition = -64
    }
    if (currentDirectionRef.current == "ArrowDown") {
        YPosition = 64
    }


    const findDecrementItem = await prisma.playerItem.findFirst({
        where: {
            itemId: selectedItemId,
            playerDataId: playerId.id,
        }
    })

    if (!findDecrementItem || findDecrementItem?.quantity! > 0){
        console.log("アイテムを所持していないです。")
    }

    if (findDecrementItem?.quantity! > 0) {
        const updateDecrementItem = await prisma.playerItem.update({
            where: {
                id : findDecrementItem?.id
            }, data: {
                quantity : {decrement : 1}
            }


        })

    console.log(updateDecrementItem)

    // 画像を探す用
    const foundItemData = await prisma.defaultItemList.findFirst({
        where: {
            id: selectedItemId
        }
    })

    if (!foundItemData) {
        console.log("アイテムが見つかりませんでした、")
        return;
    }

    const iconImage = foundItemData.itemIcon

    if (iconImage) {

        const updateRoomItemData = await prisma.roomItem.create({
            data: {
                roomId: roomId,
                x: ECollisionPosition.x + XPosition,
                y: ECollisionPosition.y + YPosition,
                itemId: selectedItemId,
                userId: playerId.playerId,
                iconImage: iconImage[1]
            }
        })

        return updateRoomItemData
    }
    }
}
