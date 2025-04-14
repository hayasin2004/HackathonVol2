// /src/hooks/usePlayerManagement.ts
import { useState } from 'react';
import axios from 'axios';
import {supabase} from "@/lib/supabase";
import {PlayerItem} from "@/types/playerItem";

interface PlayerData {
    id: number;
    playerId: number;
    x: number;
    y: number;
    roomId: number | null;
    createdAt: string;
    updatedAt: string;
}


export const usePlayerManagement = (initialPlayerId?: number) => {
    const [player, setPlayer] = useState<PlayerData | null>(null);
    const [playerItems, setPlayerItems] = useState<PlayerItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // プレイヤー作成
    const createPlayer = async (userId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/players', { userId });
            setPlayer(response.data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.error || 'プレイヤーの作成に失敗しました');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // プレイヤー情報の取得
    const getPlayer = async (playerId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/players?playerId=${playerId}`);
            setPlayer(response.data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.error || 'プレイヤー情報の取得に失敗しました');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // プレイヤーの位置更新
    const updatePlayerPosition = async (playerId: number, x: number, y: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`/api/players/${playerId}/position`, { x, y });
            setPlayer(prev => prev ? { ...prev, x, y } : null);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.error || 'プレイヤーの位置更新に失敗しました');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ルームへの参加
    const joinRoom = async (playerId: number, roomId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/players/room', { playerId, roomId });
            setPlayer(prev => prev ? { ...prev, roomId } : null);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.error || 'ルームへの参加に失敗しました');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ルームからの退出
    const leaveRoom = async (playerId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`/api/players/${playerId}/room`);
            setPlayer(prev => prev ? { ...prev, roomId: null } : null);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.error || 'ルームからの退出に失敗しました');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // プレイヤーのアイテム一覧取得
    const getPlayerItems = async (playerId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/players/${playerId}/items`);
            setPlayerItems(response.data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.error || 'プレイヤーのアイテム取得に失敗しました');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // リアルタイムプレイヤーイベントの購読
    const subscribeToPlayerEvents = (playerId: number, callback: (payload: any) => void) => {
        const channel = supabase
            .channel(`player_${playerId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'player_events', filter: `player_id=eq.${playerId}` },
                (payload) => {
                    callback(payload);

                    // プレイヤーの状態を更新
                    if (payload.new && payload.new.type === 'PLAYER_MOVED') {
                        const { x, y } = payload.new.data;
                        setPlayer(prev => prev ? { ...prev, x, y } : null);
                    } else if (payload.new && payload.new.type === 'PLAYER_JOINED_ROOM') {
                        const { room_id } = payload.new.data;
                        setPlayer(prev => prev ? { ...prev, roomId: room_id } : null);
                    } else if (payload.new && payload.new.type === 'PLAYER_LEFT_ROOM') {
                        setPlayer(prev => prev ? { ...prev, roomId: null } : null);
                    }
                }
            )
            .subscribe();

        // クリーンアップ関数を返す
        return () => {
            supabase.removeChannel(channel);
        };
    };

    // 初期プレイヤーIDが提供された場合、自動的にロード
    useState(() => {
        if (initialPlayerId) {
            getPlayer(initialPlayerId);
        }
    });

    return {
        player,
        playerItems,
        loading,
        error,
        createPlayer,
        getPlayer,
        updatePlayerPosition,
        joinRoom,
        leaveRoom,
        getPlayerItems,
        subscribeToPlayerEvents
    };
};