import {NextResponse} from 'next/server';
import prisma from "@/lib/prismaClient";
import {supabase} from "@/lib/supabase";

// POSTリクエストを処理する
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {playerId, craftItemId} = body;

        if (!playerId || !craftItemId) {
            return NextResponse.json(
                {status: 'error', message: 'Invalid input data'},
                {status: 400}
            );
        }

        // クラフトロジックを実行
        await route(playerId, craftItemId);

        // クラフト後のアイテム情報を取得
        const playerData = await prisma.playerData.findUnique({
            where: {playerId},
            include: {haveItems: true},
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
                        playerItems: playerData.haveItems,
                    },
                });
        }

        return NextResponse.json(
            {status: 'success', message: 'アイテムを作成しました'},
            {status: 200}
        );
    } catch (error: any) {
        console.error('Craft error:', error);
        return NextResponse.json(
            {status: 'error', message: error.message || 'クラフト中にエラーが発生しました'},
            {status: 500}
        );
    }
}

// クラフトロジックを分離
async function route(playerId: number | undefined, craftItem: number) {
    const player = await prisma.playerData.findUnique({
        where: {playerId},
        include: {haveItems: true},
    });

    if (!player) {
        throw new Error("プレイヤーが見つかりません");
    }
    console.log(craftItem)
    const craftRecipe = await prisma.craftItem.findFirst({
        where: {id: craftItem},
        include: {
            materials: {
                include: {materialItem: true},
            },
        },
    });

    if (!craftRecipe) {
        throw new Error("このアイテムのクラフトレシピは存在しません");
    }

    const playerItems = await prisma.playerItem.findMany({
        where: {playerDataId: player.id},
    });

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

    await prisma.$transaction(async (tx) => {
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
        const existingItem = await tx.playerItem.findFirst({
            where: {
                playerDataId: player.id,
                itemId: craftRecipe.createdItemId,
            },
        });

        console.log(existingItem)
        if (existingItem) {
            console.log("ここで松明が作成されるはず" + craftItem)
            await tx.playerItem.update({
                where: {id: existingItem.id},
                data: {quantity: {increment: 1}},
            });
        } else {
            await tx.playerItem.create({
                data: {
                    playerDataId: player.id,
                    itemId: craftRecipe.createdItemId,
                    quantity: 1,
                },
            });
        }
    });
}