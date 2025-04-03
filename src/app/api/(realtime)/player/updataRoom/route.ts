// api/player/route.ts
import { NextApiRequest, NextApiResponse } from 'next';

import prisma from "@/lib/prismaClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({status: 'error', message: 'Method not allowed'});
    }

    const {playerId, roomId} = req.body;

    if (!playerId) {
        return res.status(400).json({status: 'error', message: 'プレイヤーIDが必要です'});
    }

    try {
        const playerData = await prisma.playerData.update({
            where: {playerId: parseInt(playerId)},
            data: {
                roomId: roomId ? parseInt(roomId) : null,
                // ランダムな初期位置を設定
                x: 100 + Math.floor(Math.random() * 100),
                y: 100 + Math.floor(Math.random() * 100)
            }
        });

        return res.status(200).json({
            status: 'success',
            message: 'プレイヤーのルームを更新しました',
            playerData
        });
    } catch (error) {
        console.error('Error updating player room:', error);
        return res.status(500).json({status: 'error', message: 'プレイヤーのルーム更新'})
    }
}