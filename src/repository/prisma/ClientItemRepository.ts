"use server"
import prisma from "@/lib/prismaClient";
import {PlayerCoordinateProps} from "@/types/character";
import {createPlayerData, findPlayerData, logIn, savaPlayerPlaceData} from "@/repository/prisma/authRepository";


// クラフトアイテムに存在するものだけを取得し
export const allNeedCraftItem = async () => {
    try {

        const craftedOnlyItems = await prisma.defaultItemList.findMany({
            where: {
                CraftedItems: {
                    some: {} // `CraftItem` に存在するアイテムのみ取得
                },
            },
        });
        return craftedOnlyItems

    } catch (err) {
        console.log(err)
        return  null
    }
}


//アイテム一覧取得
export const itemList = async () => {
    try {
        console.log('アイテム情報を一覧にして表示')
        const itemListAll = await prisma.defaultItemList.findMany({
            orderBy: [{createdAt: "asc"}],
            select: {
                id: true,
                itemName: true,
                itemDescription: true,
                x: true,
                y: true,
                width: true,
                height: true,
                itemIcon: true
                // itemIcon : true
            }

        })
        return itemListAll
    } catch (err) {
        console.log(err)
        return null
    }
}


//インベントリにアイテム保存
export const playerGetItem = async (playerId: number | undefined, itemIds: number[]) => {
    try {
        if (playerId) {
            // findUniqueを使用して、itemIdに一致するアイテムを取得する
            const existingItems = await prisma.playerItem.findMany({
                where: {
                    AND: [{
                        playerDataId: playerId,
                        itemId: {in: itemIds}
                    }]
                }
            });

            // 既存アイテムのIDリストを作成
            const existingItemIds = existingItems.map((item) => item.itemId);

            // 見つかった番号
            //existingItemIds = [1,3,4]

            // 見つからなかった番号
            //!existingItemIds = [2,5,6,7]

            // 新規アイテムIDを判定
            const newItems = itemIds.filter((itemId) => !existingItemIds.includes(itemId));
            //itemIds[2,5,6,7]
            console.log("バックエンドデバック", playerId !== undefined);

            console.log("バックエンドデバック2", newItems);

            if (newItems.length > 0) {
                // create
                const savedItem = await prisma.playerItem.createMany({
                    data: newItems.map((QItemId) => ({
                                itemId: QItemId,
                                playerDataId: playerId
                            }
                        )
                    )
                });
                return {status: "success", message: 'アイテムをプレイヤーに保存しました', savedItem}
            }

            // findUniqueで一致したアイテムをplayerItemで作成
            if (existingItemIds.length > 0 && playerId !== undefined) {
                const existingItemIdsMap = existingItemIds.map((itemId) => itemId); // 配列を生成
                console.log("existingItemIdsMap:", existingItemIdsMap);
                const savedItem = await prisma.playerItem.updateMany({
                    where: {
                        itemId: {in: existingItemIds},
                        playerDataId: playerId,
                    },
                    data: {
                        quantity: {increment: 1},
                    },
                });

                console.log("更新件数:", savedItem.count); // 更新された行数を確認

                if (savedItem.count === 0) {
                    console.error("更新対象のデータが見つかりませんでした");
                    return {status: 'error', message: 'アイテム保存中にエラーが発生しました'}
                }
                return {status: "success", message: 'アイテムをプレイヤーに保存しました', savedItem}
            } else {
                return {status: 'error', message: 'ユーザーが存在しない可能性があります。'}
            }

        } else {
            console.log("userId is not found")
            return null
        }
    } catch (err) {
        console.log(err)
        return {status: 'error', message: 'アイテム保存中にエラーが発生しました'}
    }
}

// インベントリからアイテム削除

export const playerDeleteItem = async (playerId: number, itemId: number) => {
    try {
        const playerItem = await prisma.playerItem.findUnique({
            where: {id: playerId}
        })
        if (!playerItem) {
            return {status: 'error', message: '削除するアイテムが存在しません'}
        }

    } catch (err) {
        console.log(err)
        return {status: 'error', message: 'アイテム削除中にエラーが発生しました'}

    }
}

export const playerCoordinate = async (props: PlayerCoordinateProps) => {
    try {
        if (props !== undefined) {
            const {userId, x, y} = props;
            const playerData = await findPlayerData(userId)
            if (playerData.status == 200) {
                const playerPlaceData = await savaPlayerPlaceData(userId, x, y)
                console.log(playerPlaceData)
                return {status: 200, message: "保存完了"}
            } else {
                const playerPlaceCreate = await createPlayerData(userId)
                if (playerPlaceCreate.status == 200) {
                    const playerPlaceData = await savaPlayerPlaceData(userId, x, y)
                    console.log(playerPlaceData)
                    return {status: 200, message: "保存完了"}
                }
                console.log('プレイヤーが存在しません')
            }
        }
    } catch {
        console.log('error')
        return {status: 'error', message: 'プレイヤーの位置情報を保存できませんでした'}
    }
}
