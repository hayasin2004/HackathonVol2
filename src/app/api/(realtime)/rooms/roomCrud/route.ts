// api/rooms/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prismaClient";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // ルーム一覧の取得
    if (req.method === 'GET') {
        try {
            const rooms = await prisma.room.findMany({
                include: {
                    players: true,
                    items: {
                        where: {
                            isActive: true
                        }
                    }
                }
            });

            return res.status(200).json({ status: 'success', rooms });
        } catch (error) {
            console.error('Error fetching rooms:', error);
            return res.status(500).json({ status: 'error', message: 'ルーム情報の取得に失敗しました' });
        }
    }

        console.log("ここに来た")
    // 新規ルームの作成
    else if (req.method == 'POST') {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ status: 'error', message: 'ルーム名は必須です' });
            }

            const room = await prisma.room.create({
                data: {
                    name
                }
            });

            // ルームにランダムアイテムを配置
            await generateRoomItems(room.id);

            return res.status(201).json({ status: 'success', room });
        } catch (error) {
            console.error('Error creating room:', error);
            return res.status(500).json({ status: 'error', message: 'ルームの作成に失敗しました' });
        }
    }

    else {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }
}

// ルームにランダムアイテムを配置する関数
async function generateRoomItems(roomId: number) {
    try {
        // 全アイテムリストを取得
        const items = await prisma.defaultItemList.findMany();

        // 配置するアイテム数（ランダム：5〜10個）
        const itemCount = Math.floor(Math.random() * 6) + 5;

        // ランダムにアイテムを選択して配置
        const roomItems = [];
        for (let i = 0; i < itemCount; i++) {
            const randomItemIndex = Math.floor(Math.random() * items.length);
            const item = items[randomItemIndex];

            // ランダムな位置を生成（例：600x600のエリア内）
            const x = Math.floor(Math.random() * 580) + 10;
            const y = Math.floor(Math.random() * 580) + 10;

            roomItems.push({
                roomId,
                itemId: item.id,
                x,
                y,
                isActive: true
            });
        }

        // バルクインサート
        await prisma.roomItem.createMany({
            data: roomItems
        });

        return roomItems;
    } catch (error) {
        console.error('Error generating room items:', error);
        throw error;
    }
}