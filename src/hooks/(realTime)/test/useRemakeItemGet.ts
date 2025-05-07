"use client";
import {useState, useEffect, useRef, useCallback, useMemo} from "react";
import {defaultItem} from "@/types/defaultItem";
import {playerGetItem} from "@/app/api/(realtime)/item/getItem/route";
import useDestroyANDRandom from "@/hooks/(realTime)/item/destroyANDRandom/useDestroyANDRandom";
import {Socket} from "socket.io-client";

export interface objectItemIconImage {
    id: number,
    roomId: number,
    itemId: number,
    userId : number,
    playerId : number,
    x: number
    y: number
    width: number
    height: number
    isActive: boolean
    iconImage: HTMLImageElement
    placedByPlayer : number
}

interface UseGetItemProps {
    userId?: number;
    initialPosition: { x: number; y: number };
    rectPositions?: objectItemIconImage[];
    speed?: number;
    mapWidthInPixels?: number;
    mapHeightInPixels?: number;
    waterTiles?: { x: number; y: number }[];
    socket: Socket | null;
    setRectPositions?: React.Dispatch<React.SetStateAction<objectItemIconImage[] | undefined >>;

}

const TILE_SIZE = 64;
const DEFAULT_MOVE_INTERVAL = 150;

export const useRemakeItemGet = ({
                                     userId,
                                     initialPosition,
                                     rectPositions,
                                     speed,
                                     setRectPositions,
                                     mapWidthInPixels,
                                     mapHeightInPixels,
                                     waterTiles,
                                     socket
                                 }: UseGetItemProps) => {
    const [ECollisionPosition, setECollisionPosition] = useState(initialPosition);
    const [eCollisionGotItem, setECollisionGotItem] = useState<string[]>([]);
    const [eCollisionGotItemStatus, setECollisionGotItemStatus] = useState<defaultItem | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const eKeyPressedRef = useRef(false);
    const keysPressedRef = useRef({
        ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    });
    const rectPositionsRef = useRef(rectPositions);
    const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const moveInterval = speed ? Math.max(50, 400 - speed) : DEFAULT_MOVE_INTERVAL;
    const {handleItemCollection} = useDestroyANDRandom(socket);
    const {playerItemCollection} = useDestroyANDRandom(socket);

    // 最新のrectPositionsを更新
    useEffect(() => {
        rectPositionsRef.current = rectPositions;

    }, [rectPositions]);



    const findNearbyItem = useCallback(() => {
        let foundItem: objectItemIconImage | null = null;

        // プレイヤーの位置を中心にした矩形を定義
        const playerBounds = {
            x: ECollisionPosition.x,
            y: ECollisionPosition.y,
            width: TILE_SIZE,
            height: TILE_SIZE
        };


        const positionsToCheck = [
            {name: "上", x: ECollisionPosition.x, y: ECollisionPosition.y - TILE_SIZE}, // 上
            {name: "下", x: ECollisionPosition.x, y: ECollisionPosition.y + TILE_SIZE}, // 下
            {name: "左", x: ECollisionPosition.x - TILE_SIZE, y: ECollisionPosition.y}, // 左
            {name: "右", x: ECollisionPosition.x + TILE_SIZE, y: ECollisionPosition.y}  // 右
        ];

// 各位置に対して判定を行う
        positionsToCheck.forEach(pos => {
            const tile = waterTiles?.find(tile => tile.x === pos.x && tile.y === pos.y);
            if (tile) {
                // 必要に応じて処理を追加
            }
        });

        // ① 通常アイテムの近接チェック
        if (rectPositions) {
            const padding = 10
            let found = false;
            rectPositions.forEach(item => {
                const itemBounds = {
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height
                };

                if (
                    playerBounds.x - padding < itemBounds.x + itemBounds.width &&
                    playerBounds.x + padding + playerBounds.width > itemBounds.x &&
                    playerBounds.y - padding < itemBounds.y + itemBounds.height &&
                    playerBounds.y + padding + playerBounds.height > itemBounds.y
                ) {
                    // console.log(`見つかった(${item.x}, ${item.y})`);
                    foundItem = item;
                }
            });
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
                    itemId: 11, // 水
                    x: nearWater.x,
                    y: nearWater.y,
                    userId: userId,
                };
            }
        }

        return foundItem;
    }, [ECollisionPosition, rectPositions, waterTiles, userId]);

    const handleEKeyPress = useCallback(async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        const foundItem = findNearbyItem();

        if (foundItem) {
            try {
                console.log(foundItem)
                // プレイヤーが設置したかどうかの判定
                if (foundItem.playerId || foundItem.userId ){
                    alert("これだれが置いたんや！！" + foundItem.playerId)
                    const result = await playerGetItem(userId, [foundItem.itemId]);

                    if (result?.status === "success") {
                        if (Array.isArray(result.savedItemData)) {
                            console.log(result.savedItemData[0].id , foundItem.itemId)
                            setECollisionGotItem(prev => [...prev, ...result.savedItemData]);
                            setECollisionGotItemStatus(foundItem);
                            await playerItemCollection(foundItem.id);

                            setECollisionGotItem(prev => prev.filter(item => item !== foundItem?.id?.toString()));
                        } else {
                            setECollisionGotItem(prev => [...prev, foundItem.itemId.toString()]);
                            setECollisionGotItemStatus(foundItem);
                            console.log("取得成功（データなし）:", foundItem.id);
                        }
                    }
                }
                console.log("foundItem.itemId"+JSON.stringify(foundItem))
                const result = await playerGetItem(userId, [foundItem.itemId]);
                if (result?.status === "success") {
                    if (Array.isArray(result.savedItemData)) {
                        console.log(result.savedItemData[0].id , foundItem.itemId)
                        setECollisionGotItem(prev => [...prev, ...result.savedItemData]);
                        setECollisionGotItemStatus(foundItem);

                        // 取得したアイテムをランダム(64ピクセル単位)な座標に飛ばす
                        await handleItemCollection(foundItem);
                        setECollisionGotItem(prev => prev.filter(item => item !== foundItem?.id?.toString()));

                    } else {
                        setECollisionGotItem(prev => [...prev, foundItem.itemId.toString()]);
                        setECollisionGotItemStatus(foundItem);
                        console.log("取得成功（データなし）:", foundItem.id);
                    }
                }
            } catch (err) {
                console.error("取得失敗:", err);
            }
        }

        setIsProcessing(false);
    }, [findNearbyItem, userId, isProcessing, handleItemCollection]);

    const updatePosition = useCallback(() => {
        setECollisionPosition(prev => {
            let newX = prev.x;
            let newY = prev.y;
            const moveAmount = TILE_SIZE;

            if (keysPressedRef.current.ArrowUp) newY -= moveAmount;
            if (keysPressedRef.current.ArrowDown) newY += moveAmount;
            if (keysPressedRef.current.ArrowLeft) newX -= moveAmount;
            if (keysPressedRef.current.ArrowRight) newX += moveAmount;

            const minX = 0;
            const minY = 0;
            const maxX = mapWidthInPixels !== undefined ? mapWidthInPixels - TILE_SIZE : Infinity;
            const maxY = mapHeightInPixels !== undefined ? mapHeightInPixels - TILE_SIZE : Infinity;

            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));

            if (newX !== prev.x || newY !== prev.y) {
                return {x: newX, y: newY};
            }
            return prev;
        });
    }, [mapWidthInPixels, mapHeightInPixels]);

    const startMoving = useCallback(() => {
        if (moveIntervalRef.current) return;
        updatePosition();
        moveIntervalRef.current = setInterval(updatePosition, moveInterval);
    }, [updatePosition, moveInterval]);

    const stopMoving = useCallback(() => {
        if (moveIntervalRef.current) {
            clearInterval(moveIntervalRef.current);
            moveIntervalRef.current = null;
        }
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const key = e.key;
        if (key === "e" || key === "E") {
            if (!eKeyPressedRef.current) {
                eKeyPressedRef.current = true;
                handleEKeyPress();
            }
            return;
        }

        if (key in keysPressedRef.current) {
            e.preventDefault();
            const directionKey = key as keyof typeof keysPressedRef.current;
            if (!keysPressedRef.current[directionKey]) {
                keysPressedRef.current[directionKey] = true;
                startMoving();
            }
        }
    }, [handleEKeyPress, startMoving]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        const key = e.key;
        if (key === "e" || key === "E") {
            eKeyPressedRef.current = false;
            return;
        }

        if (key in keysPressedRef.current) {
            e.preventDefault();
            const directionKey = key as keyof typeof keysPressedRef.current;
            keysPressedRef.current[directionKey] = false;

            const anyKeyPressed = Object.values(keysPressedRef.current).some(val => val);
            if (!anyKeyPressed) stopMoving();
        }
    }, [stopMoving]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            stopMoving();
        };
    }, [handleKeyDown, handleKeyUp, stopMoving]);

    const clearGotItems = () => {
        setECollisionGotItem([]);
        setECollisionGotItemStatus(null);
    };

    const nearbyItemPosition = useMemo(() => {
        const foundItem = findNearbyItem();
        if (foundItem) {
            return {x: foundItem.x, y: foundItem.y};
        }
        return null;
    }, [findNearbyItem]);


    return {
        ECollisionPosition,
        eCollisionGotItem,
        eCollisionGotItemStatus,
        handleEKeyPress,
        clearGotItems,
        nearbyItemPosition
    };
};

export default useRemakeItemGet;
