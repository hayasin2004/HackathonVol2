// useItemCollection.ts
import { useCallback, useState } from "react";
import { objectItemIconImage } from "@/types/objectItemIconImage";
import { playerGetItem } from "@/app/api/(realtime)/item/getItem/route";

interface UseItemCollectionProps {
    userId?: number;
    ECollisionPosition: { x: number; y: number };
    rectPositions?: objectItemIconImage[];
    waterTiles?: { x: number; y: number }[];
}

export const useItemCollection = ({
                                      userId,
                                      ECollisionPosition,
                                      rectPositions,
                                      waterTiles
                                  }: UseItemCollectionProps) => {
    const [eCollisionGotItem, setECollisionGotItem] = useState<string[]>([]);
    const [eCollisionGotItemStatus, setECollisionGotItemStatus] = useState<objectItemIconImage | null>(null);

    const handleEKeyPress = useCallback(async () => {
        let foundItem: objectItemIconImage | null = null;

        // ① 通常アイテムの近接チェック
        if (rectPositions) {
            const nearby = rectPositions.find(item => {
                const dx = (item.x || 0) - ECollisionPosition.x;
                const dy = (item.y || 0) - ECollisionPosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < TILE_SIZE * 1.5;
            });

            if (nearby) {
                foundItem = nearby;
            }
        }

        if (!foundItem && waterTiles) {
            const nearWater = waterTiles.find(tile => {
                const dx = tile.x - ECollisionPosition.x;
                const dy = tile.y - ECollisionPosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < TILE_SIZE * 1.5;
            });

            if (nearWater) {
                foundItem = {
                    id: 11, // 水
                    x: nearWater.x,
                    y: nearWater.y,
                    roomId: 0, // 必要に応じて設定
                    itemId: 0, // 必要に応じて設定
                    isActive: true, // 必要に応じて設定
                    iconImage: "", // 必要に応じて設定
                };
            }
        }

        // アイテム取得処理
        if (foundItem) {
            try {
                const result = await playerGetItem(userId, [foundItem.id]);
                if (result?.status === "success") {
                    setECollisionGotItem(prev => [...prev, foundItem!.id.toString()]);
                    setECollisionGotItemStatus(foundItem!);
                    console.log("取得成功:", result.savedItem);
                }
            } catch (err) {
                console.error("取得失敗:", err);
            }
        }
    }, [ECollisionPosition, rectPositions, waterTiles, userId]);

    return {
        eCollisionGotItem,
        eCollisionGotItemStatus,
        handleEKeyPress,
    };
};
