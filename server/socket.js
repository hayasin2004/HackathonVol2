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

server.listen(PORT, () => console.log(`Listening on port ${PORT}`)); // サーバーを起動
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
        origin: ["*"], // クライアントURLを許可
        methods: ["GET", "POST"], // サポートするHTTPメソッド
    },
});

// ルーム管理用のマップ
const rooms = new Map();

const playerPositions = new Map();
const playerUpdateTimers = new Map();
io.on('connection', (socket) => {
    console.log('接続！', socket.id);
    // プレイヤーがルームに参加
    socket.on('join_room', async ({playerId, roomId}) => {

        try {
            console.log(playerId, roomId);

            // DBのプレイヤーデータを更新
            const test = await prisma.playerData.update({
                where: {playerId: playerId},
                data: {roomId},
            });
            console.log("市川拓" + test + "平手後期")
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

    // アイテム削除イベント
    socket.on('itemRemoved', (itemData) => {
        console.log('Received itemRemoved event from client:', itemData);
        // itemData.idが存在するか確認
        const itemId = itemData.id || itemData.itemId;
        io.emit('itemRemoved', itemId);
        console.log(`Broadcasted itemRemoved event for item ${itemId} to all clients`);
    });

// アイテム配置イベント
    socket.on('placeItem', (itemData) => {
        console.log('Received placeItem event from client:', itemData);

        // IDが変更されている場合でも、正しく処理できるようにする
        const broadcastData = {
            ...itemData,
            // 必要に応じて追加のデータ処理をここで行う
        };

        // 少し遅延を入れて、削除イベントが先に処理されるようにする
        setTimeout(() => {
            io.emit('itemPlaced', broadcastData);
            console.log('Broadcasted itemPlaced event to all clients:', broadcastData);
        }, 50);
    });

    socket.on('player_move', async ({playerId, roomId, x, y}) => {
        // 現在の位置を保存
        playerPositions.set(playerId, {x, y, roomId});

        // 他のプレイヤーにはリアルタイムで通知
        socket.to(`room:${roomId}`).emit('player_moved', {
            playerId: playerId,
            x: x,
            y: y,
        });

        // 既存のタイマーがあればクリア
        if (playerUpdateTimers.has(playerId)) {
            clearTimeout(playerUpdateTimers.get(playerId));
        }

        // 2秒間移動がなければDBを更新するタイマーを設定
        const timerId = setTimeout(async () => {
            try {
                const position = playerPositions.get(playerId);
                if (position) {
                    console.log(`Updating player ${playerId} position in DB after 2 seconds of inactivity`);

                    // DBを更新
                    const updatedPlayer = await prisma.playerData.update({
                        where: {playerId},
                        data: {
                            x: position.x,
                            y: position.y
                        },
                    });

                    console.log(`Updated player ${playerId} position in DB: x=${position.x}, y=${position.y}`);
                }

                // タイマーとポジションをクリア
                playerUpdateTimers.delete(playerId);
            } catch (error) {
                console.error(`Error updating player ${playerId} position:`, error);
            }
        }, 2000); // 2秒後に実行

        // タイマーIDを保存
        playerUpdateTimers.set(playerId, timerId);
    });
// プレイヤーの移動を処理

// プレイヤーがルームから退出
    socket.on('leave_room', async ({playerId, roomId}) => {
        try {
            await prisma.playerData.update({
                where: {id: playerId},
                data: {roomId: null},
            });

            socket.leave(`room:${roomId}`);
            socket.to(`room:${roomId}`).emit('player_left', {playerId});

            console.log(`Player ${playerId} left room ${roomId}`);
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    });


//     敵関連のリアルタイム　

    // 敵削除リクエストを受け取る
    socket.on("removeEnemy", (enemy) => {
        console.log(`敵ID ${enemy.name} を削除`);

        // 全クライアントに通知
        io.emit("enemyRemoved", enemy);
    });


// 切断時の処理
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // });
    })
})