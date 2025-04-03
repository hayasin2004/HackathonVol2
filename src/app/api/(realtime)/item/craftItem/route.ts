// api/player/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import {supabase} from "@/lib/supabase";
import prisma from "@/lib/prismaClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

    try {
        const { playerId, craftItemId } = req.body;

        if (!playerId || !craftItemId) {
            return res.status(400).json({ status: 'error', message: 'Invalid input data' });
        }

        await route(playerId, craftItemId);

        // クラフト後のアイテム情報を取得
        const playerData = await prisma.playerData.findUnique({
            where: { playerId },
            include: { haveItems: true }
        });

        // リアルタイムイベントを発行
        if (playerData && playerData.roomId) {
            await supabase
                .from('realtime_events')
                .insert({
                    event: 'item_craft',
                    room_id: playerData.roomId,
                    player_id: playerId,
                    data: {
                        craftedItemId: craftItemId,
                        playerItems: playerData.haveItems
                    }
                });
        }

        return res.status(200).json({ status: 'success', message: 'アイテムを作成しました' });
    } catch (error: any) {
        console.error('Craft error:', error);
        return res.status(500).json({ status: 'error', message: error.message || 'クラフト中にエラーが発生しました' });
    }
}

export async function route(playerId: number | undefined, craftItem: number) {
    // 1. プレイヤーデータを取得
    const player = await prisma.playerData.findUnique({
        where: { playerId },
        include: { haveItems: true }, // プレイヤーの所持アイテムも取得
    });

    if (!player) {
        throw new Error("プレイヤーが見つかりません");
    }

    // 2. クラフトレシピを取得（作成したいアイテムの情報）
    const craftRecipe = await prisma.craftItem.findFirst({
        where: { createdItemId: craftItem },
        include: {
            materials: {
                include: { materialItem: true }, // 必要なアイテム情報も取得
            },
        },
    });

    if (!craftRecipe) {
        throw new Error("このアイテムのクラフトレシピは存在しません");
    }

    // 3. プレイヤーのアイテム所持状況を取得
    const playerItems = await prisma.playerItem.findMany({
        where: { playerDataId: player.id },
    });

    // 4. 必要な素材が揃っているか確認
    for (const material of craftRecipe.materials) {
        const playerItem = playerItems.find(
            (item) => item.itemId === material.materialItemId
        );

        if (!playerItem || playerItem.quantity < material.quantity) {
            throw new Error(
                `素材不足: ${material.materialItem.itemName} が ${material.quantity}個必要`
            );
        }
    }

    // 5. クラフト実行（トランザクション）
    await prisma.$transaction(async (tx) => {
        // 素材を消費
        for (const material of craftRecipe.materials) {
            await tx.playerItem.updateMany({
                where: {
                    playerDataId: player.id,
                    itemId: material.materialItemId,
                },
                data: {
                    quantity: {
                        decrement: material.quantity,
                    },
                },
            });
        }

        // 作成アイテムを追加（すでに持っていれば個数を増加）
        const existingItem = await tx.playerItem.findFirst({
            where: {
                playerDataId: player.id,
                itemId: craftItem,
            },
        });

        if (existingItem) {
            await tx.playerItem.update({
                where: { id: existingItem.id },
                data: { quantity: { increment: 1 } },
            });
        } else {
            await tx.playerItem.create({
                data: {
                    playerDataId: player.id,
                    itemId: craftItem,
                    quantity: 1,
                },
            });
        }
    });
}