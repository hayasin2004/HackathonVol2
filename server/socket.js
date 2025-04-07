    const next = require('next');
    const http = require('http');
    const express = require('express');
    const {Server} = require('socket.io');
    const app = express();

    const {PrismaClient} = require('@prisma/client'); // Prismaのインポート

    let prisma;

    const server = http.createServer(app); // HTTPサーバーを作成
    // const io = new Server(server);

    const PORT = 5000;

    server.listen(PORT, ()  => console.log(`Listening on port ${PORT}`)); // サーバーを起動
    //
    // io.on('connect', (socket) => {
    //     console.log("クライアントと接続")
    //     socket.on("disconnect", (code) => {
    //         console.log("クライアントと切断")
    //     })
    //
    // })


    // 環境ごとにPrismaクライアントを初期化
    if (process.env.NODE_ENV === 'production') {
        prisma = new PrismaClient(); // 本番環境では新しいインスタンスを作成
    } else {
        // 開発環境ではグローバルスコープでインスタンスを再利用
        if (!global.prisma) {
            global.prisma = new PrismaClient();
        }
        prisma = global.prisma;
    }
    //
    // module.exports = prisma; // Prismaクライアントをエクスポート
    //
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000"], // クライアントURLを許可
            methods: ["GET", "POST"], // サポートするHTTPメソッド
        },
    });

    // ルーム管理用のマップ
    const rooms = new Map();

    io.on('connection', (socket) => {
        console.log('接続！', socket.id);
        // プレイヤーがルームに参加
        socket.on('join_room', async ({playerId, roomId}) => {

            try {
                console.log(playerId , roomId);
                console.log("市川拓" + "平手後期")

                // DBのプレイヤーデータを更新
const test =                 await prisma.playerData.update({
                    where: {playerId : playerId },
                    data: {roomId},
                });
console.log("市川拓" +test + "平手後期")
                // ソケットをルームに追加
                socket.join(`room:${roomId}`);

                // ルーム内の他プレイヤーとアイテム情報を取得
                const roomPlayers = await prisma.playerData.findMany({
                    where: {roomId},
                });

                const roomItems = await prisma.roomItem.findMany({
                    where: {
                        roomId,
                        isActive: true,
                    },
                    include: {item: true},
                });

                // ルーム情報を送信
                socket.emit('room_data', {players: roomPlayers, items: roomItems});

                // 他のプレイヤーに通知
                socket.to(`room:${roomId}`).emit('player_joined', {
                    playerId,
                    playerData: roomPlayers.find((p) => p.playerId === playerId),
                });

                console.log(`Player ${playerId} joined room ${roomId}`);
            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', {message: `Failed to join room ${playerId} aass`});
            }
        });

        // プレイヤーの移動を処理
        socket.on('player_move', async ({playerId, roomId, x, y}) => {
            try {
                // DBのプレイヤー位置を更新
                await prisma.playerData.update({
                    where: {id : playerId},
                    data: {x, y},
                });

                // 他のプレイヤーに移動通知
                socket.to(`room:${roomId}`).emit('player_moved', {playerId, x, y});
                // 衝突判定とアイテム処理
                const nearbyItems = await prisma.roomItem.findMany({
                    where: {roomId, isActive: true},
                    include: {item: true},
                });

                const collidedItems = nearbyItems.filter((item) => {
                    const itemX = item.x;
                    const itemY = item.y;
                    const itemWidth = item.item.width || 10;
                    const itemHeight = item.item.height || 10;
                    return (
                        x >= itemX &&
                        x <= itemX + itemWidth &&
                        y >= itemY &&
                        y <= itemY + itemHeight
                    );
                });

                if (collidedItems.length > 0) {
                    const itemIds = collidedItems.map((item) => item.itemId);
                    const collectResult =
                        await import('../../HackathonVol2/src/app/api/(realtime)/item/getItem').then((module) =>
                        module.playerGetItem(playerId, itemIds)
                    );

                    socket.emit('items_collected', {
                        itemIds,
                        result: collectResult,
                    });

                    socket.to(`room:${roomId}`).emit('items_collected_by_player', {
                        playerId,
                        itemIds,
                    });
                }
            } catch (error) {
                console.error('Error handling player movement:', error);
            }
        });

        // プレイヤーがルームから退出
        socket.on('leave_room', async ({playerId, roomId}) => {
            try {
                await prisma.playerData.update({
                    where: {id : playerId },
                    data: {roomId: null},
                });

                socket.leave(`room:${roomId}`);
                socket.to(`room:${roomId}`).emit('player_left', {playerId});

                console.log(`Player ${playerId} left room ${roomId}`);
            } catch (error) {
                console.error('Error leaving room:', error);
            }
        });

        // 切断時の処理
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            // });
        })
    })