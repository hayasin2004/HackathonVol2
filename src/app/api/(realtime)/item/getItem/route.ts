// api/player/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import {supabase} from "@/lib/supabase";
import prisma from "@/lib/prismaClient";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

    try {
        const { playerId, itemIds } = req.body;

        if (!playerId || !itemIds || !Array.isArray(itemIds)) {
            return res.status(400).json({ status: 'error', message: 'Invalid input data' });
        }

        const result = await playerGetItem(playerId, itemIds);

        // Supabaseにリアルタイムイベントを発行
        if (result && result.status === 'success') {
            const playerData = await prisma.playerData.findUnique({
                where: { playerId },
                include: { haveItems: true }
            });

            if (playerData && playerData.roomId) {
                await supabase
                    .from('realtime_events')
                    .insert({
                        event: 'item_collect',
                        room_id: playerData.roomId,
                        player_id: playerId,
                        data: {
                            itemIds,
                            playerItems: playerData.haveItems
                        }
                    });
            }
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Item collection error:', error);
        return res.status(500).json({ status: 'error', message: 'サーバーエラーが発生しました' });
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
                        itemId: { in: itemIds }
                    }]
                }
            });

            // 既存アイテムのIDリストを作成
            const existingItemIds = existingItems.map((item) => item.itemId);

            // 新規アイテムIDを判定
            const newItems = itemIds.filter((itemId) => !existingItemIds.includes(itemId));

            const roomItems = await prisma.roomItem.findMany({
                where: {
                    itemId: { in: itemIds },
                    isActive: true
                }
            });

            // ルーム内のアイテムを非アクティブに設定
            if (roomItems.length > 0) {
                await prisma.roomItem.updateMany({
                    where: {
                        id: { in: roomItems.map(item => item.id) }
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
                return { status: "success", message: 'アイテムをプレイヤーに保存しました', savedItem };
            }

            // 既存アイテムの数量を増やす
            if (existingItemIds.length > 0 && playerId !== undefined) {
                const savedItem = await prisma.playerItem.updateMany({
                    where: {
                        itemId: { in: existingItemIds },
                        playerDataId: playerId,
                    },
                    data: {
                        quantity: { increment: 1 },
                    },
                });

                if (savedItem.count === 0) {
                    console.error("更新対象のデータが見つかりませんでした");
                    return { status: 'error', message: 'アイテム保存中にエラーが発生しました' };
                }
                return { status: "success", message: 'アイテムをプレイヤーに保存しました', savedItem };
            } else {
                return { status: 'error', message: 'ユーザーが存在しない可能性があります。' };
            }
        } else {
            console.log("userId is not found");
            return null;
        }
    } catch (err) {
        console.log(err);
        return { status: 'error', message: 'アイテム保存中にエラーが発生しました' };
    }
};