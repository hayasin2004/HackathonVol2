// api/rooms/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';

import prisma from "@/lib/prismaClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const roomId = parseInt(id as string);

    if (isNaN(roomId)) {
        return res.status(400).json({ status: 'error', message: '無効なルームIDです' });
    }

    // ルーム詳細の取得
    if (req.method === 'GET') {
        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: {
                    players: true,
                    items: {
                        where: {
                            isActive: true
                        },
                        include: {
                            item: true
                        }
                    }
                }
            });

            if (!room) {
                return res.status(404).json({ status: 'error', message: 'ルームが見つかりません' });
            }

            return res.status(200).json({ status: 'success', room });
        } catch (error) {
            console.error('Error fetching room:', error);
            return res.status(500).json({ status: 'error', message: 'ルーム情報の取得に失敗しました' });
        }
    }

    // ルームの更新
    else if (req.method === 'PUT') {
        try {
            const { name } = req.body;

            const room = await prisma.room.update({
                where: { id: roomId },
                data: { name }
            });

            return res.status(200).json({ status: 'success', room });
        } catch (error) {
            console.error('Error updating room:', error);
            return res.status(500).json({ status: 'error', message: 'ルームの更新に失敗しました' });
        }
    }

    // ルームの削除
    else if (req.method === 'DELETE') {
        try {
            await prisma.room.delete({
                where: { id: roomId }
            });

            return res.status(200).json({ status: 'success', message: 'ルームを削除しました' });
        } catch (error) {
            console.error('Error deleting room:', error);
            return res.status(500).json({ status: 'error', message: 'ルームの削除に失敗しました' });
        }
    }

    else {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }
}