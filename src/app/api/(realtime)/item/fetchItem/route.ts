// api/player/route.ts
import {NextApiRequest, NextApiResponse} from 'next';
import {supabase} from "@/lib/supabase";
import prisma from "@/lib/prismaClient";
import {NextResponse} from "next/server";
export async function GET() {
    try {
        const dropItem = await prisma.defaultItemList.findMany({
            where: {
                NOT: {
                    CraftedItems: {
                        some: {}, // `some`で関連するCraftItemが存在するものを対象
                    },
                },
            },orderBy : [{createdAt : "asc"}]
        });

        return NextResponse.json(dropItem, { status: 200 });
    } catch (error) {
        console.error("Item collection error:", error);
        return NextResponse.json({ status: "error", message: "サーバーエラーが発生しました" }, { status: 500 });
    }
}

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

            // 新規アイテムIDを判定
            const newItems = itemIds.filter((itemId) => !existingItemIds.includes(itemId));

            const roomItems = await prisma.roomItem.findMany({
                where: {
                    itemId: {in: itemIds},
                    isActive: true
                }
            });

            // ルーム内のアイテムを非アクティブに設定
            if (roomItems.length > 0) {
                await prisma.roomItem.updateMany({
                    where: {
                        id: {in: roomItems.map(item => item.id)}
                    },
                    data: {
                        isActive: false
                    }
                });
            }

            if (newItems.length > 0) {
                // 新しいアイテムを作成
                const savedItem = await prisma.playerItem.createMany({
                    data: newItems.map((itemId) => ({
                        itemId: itemId,
                        playerDataId: playerId
                    }))
                });
                return {status: "success", message: 'アイテムをプレイヤーに保存しました', savedItem};
            }

            // 既存アイテムの数量を増やす
            if (existingItemIds.length > 0 && playerId !== undefined) {
                const savedItem = await prisma.playerItem.updateMany({
                    where: {
                        itemId: {in: existingItemIds},
                        playerDataId: playerId,
                    },
                    data: {
                        quantity: {increment: 1},
                    },
                });

                if (savedItem.count === 0) {
                    console.error("更新対象のデータが見つかりませんでした");
                    return {status: 'error', message: 'アイテム保存中にエラーが発生しました'};
                }
                return {status: "success", message: 'アイテムをプレイヤーに保存しました', savedItem};
            } else {
                return {status: 'error', message: 'ユーザーが存在しない可能性があります。'};
            }
        } else {
            console.log("userId is not found");
            return null;
        }
    } catch (err) {
        console.log(err);
        return {status: 'error', message: 'アイテム保存中にエラーが発生しました'};
    }
};