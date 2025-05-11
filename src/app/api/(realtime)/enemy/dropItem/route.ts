import { NextResponse } from 'next/server';
import prisma from '@/lib/prismaClient';

export async function POST(request: Request) {
    try {
        const { enemyId, playerId } = await request.json();

        if (!enemyId || !playerId) {
            return NextResponse.json({ error: '必要なパラメータが不足しています' }, { status: 400 });
        }

        // 敵のドロップアイテム情報を取得
        const enemy = await prisma.enemy.findUnique({
            where: { id: enemyId },
            include: {
                dropItems: {
                    include: {
                        item: true
                    }
                }
            }
        });

        if (!enemy) {
            return NextResponse.json({ error: '敵が見つかりません' }, { status: 404 });
        }

        // プレイヤーデータを取得
        const playerData = await prisma.playerData.findFirst({
            where: { playerId: playerId }
        });

        if (!playerData) {
            return NextResponse.json({ error: 'プレイヤーデータが見つかりません' }, { status: 404 });
        }

        const droppedItems = [];

        // 各ドロップアイテムについて、ドロップ率に基づいてドロップするかどうか決定
        for (const dropItem of enemy.dropItems) {
            if (Math.random() <= dropItem.dropRate) {
                // ドロップ成功：プレイヤーのインベントリに追加
                const existingItem = await prisma.playerItem.findFirst({
                    where: {
                        playerDataId: playerData.id,
                        itemId: dropItem.itemId
                    }
                });

                if (existingItem) {
                    // 既存のアイテムの数量を増やす
                    await prisma.playerItem.update({
                        where: { id: existingItem.id },
                        data: { quantity: { increment: 1 } }
                    });
                } else {
                    // 新しいアイテムをインベントリに追加
                    await prisma.playerItem.create({
                        data: {
                            playerDataId: playerData.id,
                            itemId: dropItem.itemId,
                            quantity: 1
                        }
                    });
                }

                droppedItems.push({
                    id: dropItem.itemId,
                    name: dropItem.item.itemName,
                    icon: dropItem.item.itemIcon[0]
                });
            }
        }

        return NextResponse.json({
            success: true,
            items: droppedItems
        });
    } catch (error) {
        console.error('ドロップアイテム処理エラー:', error);
        return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
    }
}