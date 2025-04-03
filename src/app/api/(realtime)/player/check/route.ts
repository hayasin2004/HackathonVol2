import { NextApiRequest, NextApiResponse } from 'next';

import prisma from "@/lib/prismaClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

    const { playerId } = req.query;

    if (!playerId) {
        return res.status(400).json({ status: 'error', message: 'プレイヤーIDが必要です' });
    }

    try {
        const playerData = await prisma.playerData.findUnique({
            where: { playerId: parseInt(playerId as string) }
        });

        return res.status(200).json({
            status: 'success',
            exists: !!playerData,
            playerData
        });
    } catch (error) {
        console.error('Error checking player:', error);
        return res.status(500).json({ status: 'error', message: 'プレイヤー情報の確認に失敗しました' });
    }
}
