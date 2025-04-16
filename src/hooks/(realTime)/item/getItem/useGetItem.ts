import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import {defaultItem} from "@/types/defaultItem";
import {PlayerItem} from "@/types/playerItem";

const useGetItem = (itemEvents : any[] , playerId: PlayerItem) => {
    const [playerItemsHook, setPlayerItemsHook] = useState<any[]>([]);

    useEffect(() => {
        if (itemEvents.length > 0) {
            const latestEvent = itemEvents[itemEvents.length - 1]; // 最新のイベントを取得

            setPlayerItemsHook((prev) => {
                // 他のプレイヤーのイベントかどうかに関わらず通知を設定
                const message =
                    latestEvent.player_id !== playerId.id
                        ? `プレイヤーID:${latestEvent.player_id}がアイテムを取得しました`
                        : `アイテムを取得しました`;

                toast(message);

                return [message, ...prev.slice(0, 4)];
            });

            // 最新のプレイヤーデータが存在する場合、アイテムリストを更新
            if (
                latestEvent.player_id === playerId.id &&
                latestEvent.data &&
                latestEvent.data.playerItems
            ) {
                setPlayerItemsHook(latestEvent.data.playerItems);
            }
        }
    }, [itemEvents, playerId])
    return {playerItemsHook}
};

export default useGetItem;