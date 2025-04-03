// server/socket.ts
import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import prisma from "@/lib/prismaClient";

export function initializeSocketServer(server: HTTPServer) {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST']
        }
    });

    // ルーム管理用のマップ
    const rooms = new Map();

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // プレイヤーがルームに参加
        socket.on('join_room', async ({ playerId, roomId }) => {
            try {
                // DBのプレイヤーデータを更新
                await prisma.playerData.update({
                    where: { playerId },
                    data: { roomId }
                });

                // ソケットをルームに追加
                socket.join(`room:${roomId}`);

                // ルーム内の他のプレイヤーとアイテム情報を取得
                const roomPlayers = await prisma.playerData.findMany({
                    where: { roomId }
                });

                const roomItems = await prisma.roomItem.findMany({
                    where: {
                        roomId,
                        isActive: true
                    },
                    include: {
                        item: true
                    }
                });

                // ルーム情報を送信
                socket.emit('room_data', { players: roomPlayers, items: roomItems });

                // 他のプレイヤーに新しいプレイヤーが参加したことを通知
                socket.to(`room:${roomId}`).emit('player_joined', {
                    playerId,
                    playerData: roomPlayers.find(p => p.playerId === playerId)
                });

                console.log(`Player ${playerId} joined room ${roomId}`);
            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'ルームへの参加に失敗しました' });
            }
        });

        // プレイヤーの移動を処理
        socket.on('player_move', async ({ playerId, roomId, x, y }) => {
            try {
                // DBのプレイヤー位置を更新
                await prisma.playerData.update({
                    where: { playerId },
                    data: { x, y }
                });

                // ルーム内の他のプレイヤーに移動を通知
                socket.to(`room:${roomId}`).emit('player_moved', { playerId, x, y });

                // プレイヤーとアイテムの衝突検出
                const player = await prisma.playerData.findUnique({
                    where: { playerId }
                });

                if (player) {
                    // プレイヤーの位置に近いアクティブなアイテムを検索
                    const nearbyItems = await prisma.roomItem.findMany({
                        where: {
                            roomId,
                            isActive: true,
                        },
                        include: {
                            item: true
                        }
                    });

                    // 衝突判定
                    const collidedItems = nearbyItems.filter(item => {
                        const itemX = item.x;
                        const itemY = item.y;
                        const itemWidth = item.item.width || 10;
                        const itemHeight = item.item.height || 10;

                        // 簡易的な衝突判定（プレイヤーはポイントとして扱う）
                        return (
                            x >= itemX &&
                            x <= itemX + itemWidth &&
                            y >= itemY &&
                            y <= itemY + itemHeight
                        );
                    });

                    if (collidedItems.length > 0) {
                        // 衝突したアイテムのIDリスト
                        const itemIds = collidedItems.map(item => item.itemId);

                        // アイテム取得処理を実行
                        const collectResult = await import('@/app/api/item/getItem').then(module => {
                            return module.playerGetItem(playerId, itemIds);
                        });

                        // アイテム取得結果をプレイヤーに通知
                        socket.emit('items_collected', {
                            itemIds,
                            result: collectResult
                        });

                        // ルーム内の他のプレイヤーにアイテム取得を通知
                        socket.to(`room:${roomId}`).emit('items_collected_by_player', {
                            playerId,
                            itemIds
                        });
                    }
                }
            } catch (error) {
                console.error('Error handling player movement:', error);
            }
        });

        // プレイヤーがルームから退出
        socket.on('leave_room', async ({ playerId, roomId }) => {
            try {
                // DBのプレイヤーデータを更新
                await prisma.playerData.update({
                    where: { playerId },
                    data: { roomId: null }
                });

                // ソケットをルームから削除
                socket.leave(`room:${roomId}`);

                // 他のプレイヤーに退出を通知
                socket.to(`room:${roomId}`).emit('player_left', { playerId });

                console.log(`Player ${playerId} left room ${roomId}`);
            } catch (error) {
                console.error('Error leaving room:', error);
            }
        });

        // 切断時の処理
        socket.on('disconnect', async () => {
            const playerSessions = Array.from(socket.rooms);

            // roomIdを抽出して、プレイヤーのroomIdをnullに設定
            for (const room of playerSessions) {
                if (room.startsWith('room:')) {
                    const roomId = parseInt(room.split(':')[1]);

                    try {
                        // このソケットに関連するplayerIdを特定する必要がある
                        // 通常はソケット接続時にセッションデータを保存するか、
                        // サーバー側でソケットIDとプレイヤーIDのマッピングを管理する

                        // ここでは簡略化のため、具体的な処理は省略
                        socket.to(room).emit('player_disconnected', { socketId: socket.id });
                    } catch (error) {
                        console.error('Error handling disconnect:', error);
                    }
                }
            }

            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}