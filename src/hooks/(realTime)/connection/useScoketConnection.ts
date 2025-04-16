
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocketConnection(playerId: number | undefined | null, roomId: number | undefined) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [players, setPlayers] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!playerId || !roomId) {
            console.log('Missing playerId or roomId:', { playerId, roomId });
            return;
        }

        // Socket.io接続 - フォールバック用ポーリングを含める
        const socketIo = io("http://localhost:5000", {
            transports: ['websocket', 'polling'], // フォールバックとしてpollingを追加
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            timeout: 20000, // タイムアウト時間を長くする
            path: '/socket.io/' // パスを明示的に指定
        });

        const test = io("http://192.168.3.5:3000")

        // 接続イベント
        socketIo.on('connect', () => {
            console.log('Socket connected with ID:', socketIo.id);
            setConnected(true);
　
            // ルームに参加
            console.log('Socket joined with ID:', playerId , roomId);
            socketIo.emit('join_room', { playerId, roomId });
            console.log('Emitted join_room event:', { playerId, roomId });
        });


        // 接続エラーイベント
        socketIo.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
            setError(`接続エラー: ${err.message}`);
        });

        // ルームデータ受信
        socketIo.on('room_data', (data) => {
            console.log('Received room_data:', data);
            setPlayers(data.players || []);
            setItems(data.items || []);
        });

        // プレイヤー参加イベント
        socketIo.on('player_joined', ({ playerId, playerData }) => {
            console.log('Player joined:', { playerId, playerData });
            setPlayers(prev => [...prev, playerData]);
        });

        // プレイヤー移動イベント
        socketIo.on('player_moved', ({ playerId, x, y }) => {
            console.log("個々が動くはず ")
            setPlayers(prev =>
                prev.map(player =>
                    player.playerId === playerId
                        ? { ...player, x, y }
                        : player
                )
            );
        });

        // アイテム取得イベント
        socketIo.on('items_collected', ({ itemIds, result }) => {
            console.log('Items collected:', { itemIds, result });
            // 取得したアイテムをリストから削除
            setItems(prev => prev.filter(item => !itemIds.includes(item.itemId)));
        });

        // 他プレイヤーによるアイテム取得イベント
        socketIo.on('items_collected_by_player', ({ playerId, itemIds }) => {
            console.log('Items collected by player:', { playerId, itemIds });
            setItems(prev => prev.filter(item => !itemIds.includes(item.itemId)));
        });

        // エラーイベント
        socketIo.on('error', ({ message }) => {
            console.error('Socket error event:', message);
            setError(message);
        });

        // 切断イベント
        socketIo.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setConnected(false);
        });

        setSocket(socketIo);

        // クリーンアップ
        return () => {
            if (socketIo) {
                console.log('Cleaning up socket connection');
                socketIo.emit('leave_room', { playerId, roomId });
                socketIo.disconnect();
            }
        };
    }, [playerId, roomId]);

    // プレイヤー移動関数
    const movePlayer = (x: number, y: number) => {　

        if (!socket || !connected || !playerId || !roomId) {
            console.log('Cannot move player - conditions not met:', {
                socket: !!socket,
                connected,
                playerId,
                roomId
            });
            return;
        }


        console.log("移動データを送信")
        socket.emit('player_move', { playerId, roomId, x, y });
    };

    return {
        socket,
        connected,
        players,
        items,
        error,
        movePlayer
    };
}