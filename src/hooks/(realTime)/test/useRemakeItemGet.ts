"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { defaultItem } from "@/types/defaultItem";
import { playerGetItem } from "@/app/api/(realtime)/item/getItem/route";

export interface objectItemIconImage {
    id : number,
    roomId : number,
    itemId : number,
    x : number
    y : number
    width : number
    height : number
    isActive : boolean
    iconImage : string
}

interface UseGetItemProps {
    userId?: number;
    initialPosition: { x: number; y: number };
    rectPositions?: objectItemIconImage[]; // ← ここが objectItemImage
    speed?: number;
    mapWidthInPixels?: number;
    mapHeightInPixels?: number;
    waterTiles?: { x: number; y: number }[]; // ← 追加
}

const TILE_SIZE = 64;
const DEFAULT_MOVE_INTERVAL = 150;

export const useRemakeItemGet = ({
                                     userId,
                                     initialPosition,
                                     rectPositions,
                                     speed,
                                     mapWidthInPixels,
                                     mapHeightInPixels,
                                     waterTiles
                                 }: UseGetItemProps) => {
    const [ECollisionPosition, setECollisionPosition] = useState(initialPosition);
    const [eCollisionGotItem, setECollisionGotItem] = useState<string[]>([]);
    const [eCollisionGotItemStatus, setECollisionGotItemStatus] = useState<defaultItem | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const eKeyPressedRef = useRef(false);
    const keysPressedRef = useRef({
        ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    });
    const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const moveInterval = speed ? Math.max(50, 400 - speed) : DEFAULT_MOVE_INTERVAL;

    const handleEKeyPress = useCallback(() => {
        if (isProcessing) return;
        setIsProcessing(true);

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
                    userId: userId,
                };
            }
        }

        // アイテム取得処理
        if (foundItem) {
            playerGetItem(userId, [foundItem.id]).then(result => {
                if (result?.status === "success") {
                    setECollisionGotItem(prev => [...prev, foundItem!.id.toString()]);
                    setECollisionGotItemStatus(foundItem!);
                    console.log("取得成功:", result.savedItem);
                }
            }).catch(err => {
                console.error("取得失敗:", err);
            });
        }

        setIsProcessing(false);
    }, [ECollisionPosition, rectPositions, waterTiles, userId, isProcessing]);

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
                return { x: newX, y: newY };
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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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
        };

        const handleKeyUp = (e: KeyboardEvent) => {
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
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            stopMoving();
        };
    }, [handleEKeyPress, startMoving, stopMoving]);

    const clearGotItems = () => {
        setECollisionGotItem([]);
        setECollisionGotItemStatus(null);
    };

    return {
        ECollisionPosition,
        eCollisionGotItem,
        eCollisionGotItemStatus,
        handleEKeyPress,
        clearGotItems
    };
};

export default useRemakeItemGet;
