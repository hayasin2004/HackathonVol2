// hooks/useSupabaseRealtime.ts
import { useEffect, useState } from 'react';
import {supabase} from "@/lib/supabase";

export function useSupabaseRealtime(roomId: number | undefined, playerId: number | undefined) {
    const [itemEvents, setItemEvents] = useState<any[]>([]);
    const [craftEvents, setCraftEvents] = useState<any[]>([]);

    useEffect(() => {
        if (!roomId) return;

        // アイテム取得イベントのリスナー
        const itemCollectionSubscription = supabase
            .channel('item_events')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'realtime_events',
                    filter: `room_id=eq.${roomId} AND event=eq.item_collect`
                },
                (payload) => {
                    console.log('Item collection event:', payload);
                    setItemEvents(prev => [...prev, payload.new]);
                }
            )
            .subscribe();

        // アイテムクラフトイベントのリスナー
        const itemCraftSubscription = supabase
            .channel('craft_events')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'realtime_events',
                    filter: `room_id=eq.${roomId} AND event=eq.item_craft`
                },
                (payload) => {
                    console.log('Item craft event:', payload);
                    setCraftEvents(prev => [...prev, payload.new]);
                }
            )
            .subscribe();

        // クリーンアップ
        return () => {
            supabase.removeChannel(itemCollectionSubscription);
            supabase.removeChannel(itemCraftSubscription);
        };
    }, [roomId, playerId]);

    return { itemEvents, craftEvents };
}