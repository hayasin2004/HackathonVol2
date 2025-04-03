
import { NextApiRequest, NextApiResponse } from 'next';

// プレイヤーの作成

import prisma from '@/lib/prismaClient';
import { supabase } from '@/lib/supabase';

export const createPlayer = async ( userId :number) => {
    try {
        if (!userId) {
            throw new Error('ユーザーIDが必要です');
        }

        // Check if the player already exists
        const existingPlayer = await prisma.playerData.findUnique({
            where: { playerId: userId },
        });

        if (existingPlayer) {
            throw new Error('このユーザーIDのプレイヤーは既に存在します');
        }

        // Create a new player
        const player = await prisma.playerData.create({
            data: {
                playerId: userId,
                x: 100, // Default X position
                y: 100, // Default Y position
            },
        });

        // Notify Supabase
        await supabase.from('player_events').insert({
            type: 'PLAYER_CREATED',
            player_id: player.playerId,
            data: { x: player.x, y: player.y },
        });

        return player;
    } catch (error) {
        console.error('プレイヤー作成エラー:', error);
        throw new Error('プレイヤーの作成に失敗しました');
    }
};;

// プレイヤーの取得
export const getPlayer = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { playerId } = req.query;
        if (!playerId) {
            return res.status(400).json({ error: 'プレイヤーIDが必要です' });
        }

        const player = await prisma.playerData.findUnique({
            where: { playerId: Number(playerId) },
            include: {
                haveItems: {
                    include: {
                        DefaultItemList: true
                    }
                },
                room: true
            }
        });

        if (!player) {
            return res.status(404).json({ error: 'プレイヤーが見つかりません' });
        }

        return res.status(200).json(player);
    } catch (error) {
        console.log("req.method"+JSON.stringify(req))
        console.error('プレイヤー取得エラー:', error);
        return res.status(500).json({ error: 'プレイヤーの取得に失敗しました' });
    }
};

// プレイヤーの位置更新
export const updatePlayerPosition = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { playerId } = req.query;
        const { x, y } = req.body;

        if (!playerId) {
            return res.status(400).json({ error: 'プレイヤーIDが必要です' });
        }

        if (x === undefined || y === undefined) {
            return res.status(400).json({ error: '新しい位置（x, y）が必要です' });
        }

        // プレイヤーの位置を更新
        const updatedPlayer = await prisma.playerData.update({
            where: { playerId: Number(playerId) },
            data: {
                x: Number(x),
                y: Number(y),
                updatedAt: new Date(),
            },
        });

        // Supabaseにも通知（リアルタイム更新のため）
        await supabase
            .from('player_events')
            .insert({
                type: 'PLAYER_MOVED',
                player_id: Number(playerId),
                data: { x: Number(x), y: Number(y) }
            });

        return res.status(200).json(updatedPlayer);
    } catch (error) {
        console.error('プレイヤー位置更新エラー:', error);
        return res.status(500).json({ error: 'プレイヤーの位置更新に失敗しました' });
    }
};

// プレイヤーのルーム参加
export const joinRoom = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { playerId, roomId } = req.body;

        if (!playerId || !roomId) {
            return res.status(400).json({ error: 'プレイヤーIDとルームIDが必要です' });
        }

        // ルームの存在確認
        const room = await prisma.room.findUnique({
            where: { id: Number(roomId) }
        });

        if (!room) {
            return res.status(404).json({ error: 'ルームが見つかりません' });
        }

        // プレイヤーをルームに参加させる
        const updatedPlayer = await prisma.playerData.update({
            where: { playerId: Number(playerId) },
            data: {
                roomId: Number(roomId),
                updatedAt: new Date(),
            },
        });

        // Supabaseにも通知
        await supabase
            .from('player_events')
            .insert({
                type: 'PLAYER_JOINED_ROOM',
                player_id: Number(playerId),
                data: { room_id: Number(roomId) }
            });

        return res.status(200).json(updatedPlayer);
    } catch (error) {
        console.error('ルーム参加エラー:', error);
        return res.status(500).json({ error: 'ルームへの参加に失敗しました' });
    }
};

// プレイヤーのルーム退出
export const leaveRoom = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { playerId } = req.query;

        if (!playerId) {
            return res.status(400).json({ error: 'プレイヤーIDが必要です' });
        }

        // プレイヤーの現在のルームを取得
        const player = await prisma.playerData.findUnique({
            where: { playerId: Number(playerId) },
            select: { roomId: true }
        });

        if (!player || !player.roomId) {
            return res.status(400).json({ error: 'プレイヤーは現在どのルームにも参加していません' });
        }

        const roomId = player.roomId;

        // プレイヤーをルームから退出させる
        const updatedPlayer = await prisma.playerData.update({
            where: { playerId: Number(playerId) },
            data: {
                roomId: null,
                updatedAt: new Date(),
            },
        });

        // Supabaseにも通知
        await supabase
            .from('player_events')
            .insert({
                type: 'PLAYER_LEFT_ROOM',
                player_id: Number(playerId),
                data: { previous_room_id: roomId }
            });

        return res.status(200).json(updatedPlayer);
    } catch (error) {
        console.error('ルーム退出エラー:', error);
        return res.status(500).json({ error: 'ルームからの退出に失敗しました' });
    }
};

// プレイヤーのアイテム一覧取得
export const getPlayerItems = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { playerId } = req.query;

        if (!playerId) {
            return res.status(400).json({ error: 'プレイヤーIDが必要です' });
        }

        const playerItems = await prisma.playerItem.findMany({
            where: { playerDataId: Number(playerId) },
            include: {
                DefaultItemList: true
            }
        });

        return res.status(200).json(playerItems);
    } catch (error) {
        console.error('プレイヤーアイテム取得エラー:', error);
        return res.status(500).json({ error: 'プレイヤーのアイテム取得に失敗しました' });
    }
};