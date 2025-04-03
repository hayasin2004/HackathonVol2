// hooks/useSocketConnection.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

export function useSocketConnection(playerId: number | undefined, roomId: number | undefined) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [players, setPlayers] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!playerId || !roomId) return;

        // Socket.io接続
        const socketIo = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
            transports: ['websocket'],
        });

        // 接続イベント
        socketIo.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);

            // ルームに参加
            socketIo.emit('join_room', { playerId, roomId });
        });

        // ルームデータ受信
        socketIo.on('room_data', (data) => {
            setPlayers(data.players || []);
            setItems(data.items || []);
        });

        // プレイヤー参加イベント
        socketIo.on('player_joined', ({ playerId, playerData }) => {
            setPlayers(prev => [...prev, playerData]);
        });

        // プレイヤー移動イベント
        socketIo.on('player_moved', ({ playerId, x, y }) => {
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
            // 取得したアイテムをリストから削除
            setItems(prev => prev.filter(item => !itemIds.includes(item.itemId)));
        });

        // 他プレイヤーによるアイテム取得イベント
        socketIo.on('items_collected_by_player', ({ playerId, itemIds }) => {
            setItems(prev => prev.filter(item => !itemIds.includes(item.itemId)));
        });

        // プレイヤー退出イベント
        socketIo.on('player_left', ({ playerId }) => {
            setPlayers(prev => prev.filter(player => player.playerId !== playerId));
        });

        // エラーイベント
        socketIo.on('error', ({ message }) => {
            setError(message);
        });

        // 切断イベント
        socketIo.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        setSocket(socketIo);

        // クリーンアップ
        return () => {
            if (socketIo) {
                socketIo.emit('leave_room', { playerId, roomId });
                socketIo.disconnect();
            }
        };
    }, [playerId, roomId]);

    // プレイヤー移動関数
    const movePlayer = (x: number, y: number) => {
        if (!socket || !connected || !playerId || !roomId) return;

        // 移動データを送信
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