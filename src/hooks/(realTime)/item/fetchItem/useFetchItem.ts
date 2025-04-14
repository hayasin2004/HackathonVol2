import {useEffect, useState} from 'react';
import {PlayerHaveItem, PlayerItem} from "@/types/playerItem";

const useFetchItem = (playerId: PlayerItem, eCollisionGotItem : any[]) => {
    const [playerItemsData, setPlayerItemsData] = useState<any[]>([]);
    const [isLoadingGet, setIsLoadingGet] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            if (!playerId) return;
            setIsLoadingGet(true);
            try {
                const response = await fetch(`/api/player/getItems/${playerId.id}`);
                const data = await response.json();
                if (data.status === "success") {
                    setPlayerItemsData(data.items);
                }
            } catch (err) {
                console.error("アイテム取得に失敗しました:", err);
            } finally {
                setIsLoadingGet(false); // ロード完了
            }
        };

        fetchItems();
    }, [playerId, eCollisionGotItem]); // 必要に応じて依存関係を追加

    return { playerItemsData, isLoadingGet }; // 状態を呼び出し元で利用可能
};
export default useFetchItem;
