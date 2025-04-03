// 2. 修正版useGetItem - リアルタイム対応
import { useState, useRef, useEffect, useMemo } from 'react';
import {supabase} from "@/lib/supabase";

export const useGetItem = (
    userId: number | undefined,
    initialPosition: { x: number | undefined | null, y: number | undefined | null } = { x: 0, y: 0 },
    circleRadius = 30,
    rectPositions: Array<defaultItem> | null,
    roomId: string // ルームID追加
) => {
    const [ECollisionPosition, setECollisionPosition] = useState(initialPosition);
    const [adjacentObstacles, setAdjacentObstacles] = useState<defaultItem[] | null>([]);
    const [adjacentObstaclesStatus, setAdjacentObstaclesStatus] = useState("");
    const [otherPlayers, setOtherPlayers] = useState<Record<string, any>>({});
    const ECollisionRef = useRef(false);
    const keyPressedRef = useRef(false);
    const isProcessingRef = useRef(false);
    const lastPositionUpdateRef = useRef(Date.now());
    const positionUpdateThrottle = 100; // ミリ秒

    const memoizedRectPositions = useMemo(() => rectPositions, [rectPositions]);

    // 衝突検知関数
    const getCollidingObstacles = (newX: number | undefined | null, newY: number | undefined | null) => {
        const padding = 10;
        return memoizedRectPositions?.filter(rect =>
            newX! + circleRadius + padding > rect.x! &&
            newX! - circleRadius - padding < rect.x! + rect.width! &&
            newY! + circleRadius + padding > rect.y! &&
            newY! - circleRadius - padding < rect.y! + rect.height!
        );
    };

    // 位置情報のリアルタイム更新
    const updatePositionToSupabase = async (position: { x: number | undefined | null, y: number | undefined | null }) => {
        if (!userId || !roomId) return;

        // スロットリング
        const now = Date.now();
        if (now - lastPositionUpdateRef.current < positionUpdateThrottle) return;
        lastPositionUpdateRef.current = now;

        try {
            await supabase
                .from('player_positions')
                .upsert({
                    player_id: userId,
                    room_id: roomId,
                    x_position: position.x,
                    y_position: position.y,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'player_id, room_id'
                });
        } catch (err) {
            console.error('位置情報の更新に失敗:', err);
        }
    };

    // 衝突検出と処理
    useEffect(() => {
        const collidingObstacles = getCollidingObstacles(ECollisionPosition.x, ECollisionPosition.y);

        ECollisionRef.current = collidingObstacles?.length > 0;
        if (collidingObstacles?.length === 0) {
            setAdjacentObstacles(null);
        }

        // 位置情報を更新
        updatePositionToSupabase(ECollisionPosition);
    }, [ECollisionPosition, memoizedRectPositions]);

    // アイテム取得処理
    const handleEKeyPress = async () => {
        if (isProcessingRef.current || !ECollisionRef.current) return;
        isProcessingRef.current = true;

        const collidingObstacles = getCollidingObstacles(ECollisionPosition.x, ECollisionPosition.y);
        if (collidingObstacles?.length > 0) {
            setAdjacentObstacles(collidingObstacles);
            try {
                const ItemIds = collidingObstacles.map(item => item.id);
                if (ItemIds.length > 0 && userId !== undefined) {
                    const result = await playerGetItem(userId, ItemIds);
                    if (result?.status === "success") {
                        console.log("アイテム獲得成功:", result.savedItem);
                        setAdjacentObstacles(collidingObstacles);

                        // リアルタイム通知 - アイテム取得イベント
                        await supabase
                            .from('game_events')
                            .insert({
                                event_type: 'item_collected',
                                player_id: userId,
                                room_id: roomId,
                                item_ids: ItemIds,
                                event_data: {
                                    position: ECollisionPosition,
                                    items: collidingObstacles.map(item => ({ id: item.id, type: item.type }))
                                },
                                created_at: new Date().toISOString()
                            });

                        // アイテムの状態更新（取得されたらマップから消す場合）
                        // この部分はゲームの仕様に応じて調整
                        await supabase
                            .from('map_items')
                            .update({ is_collected: true, collected_by: userId })
                            .in('item_id', ItemIds);
                    } else {
                        console.log("アイテム取得失敗");
                    }
                }
            } catch (err) {
                console.log("アイテム取得中にエラーが発生しました", err);
            } finally {
                isProcessingRef.current = false;
            }
        } else {
            console.log("隣接している障害物はありません");
            setAdjacentObstacles(null);
            isProcessingRef.current = false;
        }
    };

    // キー操作とプレイヤー移動
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            const DELTA = 10;

            if (e.keyCode === 69 && !keyPressedRef.current) { // E キー
                keyPressedRef.current = true;
                handleEKeyPress();
                return;
            }

            setECollisionPosition((prev) => {
                let newX = prev.x ?? 100;
                let newY = prev.y ?? 100;
                if (e.keyCode === 37) newX -= DELTA; // 左
                if (e.keyCode === 38) newY -= DELTA; // 上
                if (e.keyCode === 39) newX += DELTA; // 右
                if (e.keyCode === 40) newY += DELTA; // 下

                newX = Math.max(0, Math.min(window.innerWidth - circleRadius * 2, newX));
                newY = Math.max(0, Math.min(window.innerHeight - circleRadius * 2, newY));
                return { x: newX, y: newY };
            });
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.keyCode === 69) {
                keyPressedRef.current = false;
                console.log("Eキーが離されました");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    // 他プレイヤー位置のリアルタイム監視
    useEffect(() => {
        if (!userId || !roomId) return;

        // 初期データを取得
        const fetchInitialData = async () => {
            // 他プレイヤーの位置情報を取得
            const { data: positionData } = await supabase
                .from('player_positions')
                .select('*')
                .eq('room_id', roomId)
                .neq('player_id', userId);

            if (positionData) {
                const players: Record<string, any> = {};
                positionData.forEach(player => {
                    players[player.player_id] = {
                        x: player.x_position,
                        y: player.y_position,
                        updatedAt: player.updated_at
                    };
                });
                setOtherPlayers(players);
            }

            // アイテム情報を取得
            const { data: itemsData } = await supabase
                .from('map_items')
                .select('*')
                .eq('room_id', roomId)
                .eq('is_collected', false);

            // アイテムデータをrectPositionsの形式に合わせて処理
            // ゲームの仕様に合わせて調整が必要
        };

        fetchInitialData();

        // プレイヤー位置のリアルタイムサブスクリプション
        const positionSubscription = supabase
            .channel(`room-${roomId}-positions`)
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'player_positions',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    if (payload.new && payload.new.player_id !== userId) {
                        setOtherPlayers(prev => ({
                            ...prev,
                            [payload.new.player_id]: {
                                x: payload.new.x_position,
                                y: payload.new.y_position,
                                updatedAt: payload.new.updated_at
                            }
                        }));
                    }
                }
            )
            .subscribe();

        // アイテム状態のリアルタイムサブスクリプション
        const itemsSubscription = supabase
            .channel(`room-${roomId}-items`)
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'map_items',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    // アイテムの状態が変わった場合（取得された、追加された等）
                    // マップ上のアイテム情報を更新する処理
                    console.log('アイテム状態変更:', payload);
                    // rectPositionsを更新するロジックが必要
                }
            )
            .subscribe();

        // ゲームイベントのリアルタイムサブスクリプション
        const eventsSubscription = supabase
            .channel(`room-${roomId}-events`)
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'game_events',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    if (payload.new) {
                        console.log('新しいゲームイベント:', payload.new);
                        // イベントタイプに応じた処理
                        switch (payload.new.event_type) {
                            case 'item_collected':
                                // アイテム取得イベントの処理
                                break;
                            case 'item_crafted':
                                // アイテム作成イベントの処理
                                break;
                            // その他のイベント処理
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            positionSubscription.unsubscribe();
            itemsSubscription.unsubscribe();
            eventsSubscription.unsubscribe();
        };
    }, [userId, roomId]);

    return {
        ECollisionPosition,
        ECollisionStatus: ECollisionRef.current,
        adjacentObstacles,
        adjacentObstaclesStatus,
        otherPlayers // 他のプレイヤー情報を返す
    };
};