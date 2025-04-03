"use client";
import { useState, useEffect, useRef } from "react";
import { defaultItem } from "@/types/defaultItem";
import { playerGetItem } from "@/app/api/(realtime)/item/getItem/route";

interface UseGetItemProps {
    userId?: number;
    initialPosition: { x: number | null | undefined; y: number | null | undefined };
    circleRadius?: number;
    rectPositions?: Array<defaultItem> | null;
    speed?: number;
    movePlayer?: (x: number, y: number) => void;
}

const useRemakeItemGet = ({
                              initialPosition: { x, y },
                              userId,
                              circleRadius = 30,
                              rectPositions,
                              speed = 5,
                              movePlayer,
                          }: UseGetItemProps) => {
    const [ECollisionPosition, setECollisionPosition] = useState({ x, y });
    const [adjacentObstacles, setAdjacentObstacles] = useState<defaultItem[] | null>(null);
    const [keys, setKeys] = useState<Record<string, boolean>>({});
    const [ePressCount, setEPressCount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ECollisionStatus, setECollisionStatus] = useState(false);
    const keyPressedRef = useRef(false);

    useEffect(() => {
        console.log(rectPositions)
    }, [rectPositions]);

    // 衝突判定関数
    const getCollidingObstacles = (newX?: number | null, newY?: number | null) => {
        const padding = 10;
        return rectPositions?.filter(
            (rect) =>
                newX! + circleRadius + padding > rect.x! &&
                newX! - circleRadius - padding < rect.x! + rect.width! &&
                newY! + circleRadius + padding > rect.y! &&
                newY! - circleRadius - padding < rect.y! + rect.height!
        ) || [];
    };

    // Eキー押下時の処理
    const handleEKeyPress = async () => {
        if (isProcessing || !ECollisionStatus) return;
        setIsProcessing(true);

        const collidingObstacles = getCollidingObstacles(x, y);
        if (collidingObstacles.length > 0) {
            setAdjacentObstacles(collidingObstacles);
            try {
                const ItemIds = collidingObstacles.map((item) => item.id);
                if (ItemIds.length > 0 && userId !== undefined) {
                    const result = await playerGetItem(userId, ItemIds);
                    if (result?.status === "success") {
                        console.log("アイテム獲得成功:", result.savedItem);
                        setAdjacentObstacles(collidingObstacles);
                    } else {
                        console.log("アイテム取得失敗");
                    }
                }
            } catch (err) {
                console.log("アイテム取得中にエラーが発生しました", err);
            } finally {
                setIsProcessing(false);
            }
        } else {
            console.log("隣接している障害物はありません");
            setAdjacentObstacles(null);
            setIsProcessing(false);
        }
    };

    // キー入力処理
    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "e") {
                if (!keyPressedRef.current) {
                    keyPressedRef.current = true;
                    setEPressCount((prevCount) => prevCount + 1);
                    console.log("Eキーの押下回数");
                    await handleEKeyPress();
                }
            } else {
                setKeys((prev) => ({ ...prev, [e.key]: true }));
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "e") {
                keyPressedRef.current = false;
                console.log("Eキーが離されました");
            } else {
                setKeys((prev) => ({ ...prev, [e.key]: false }));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [handleEKeyPress]);

    // プレイヤー移動処理
    useEffect(() => {
        const moveInterval = setInterval(() => {
            setECollisionPosition((prev) => {
                let newX = prev.x ?? 0;
                let newY = prev.y ?? 0;

                if (keys.ArrowUp || keys.w) newY -= speed;
                if (keys.ArrowDown || keys.s) newY += speed;
                if (keys.ArrowLeft || keys.a) newX -= speed;
                if (keys.ArrowRight || keys.d) newX += speed;

                newX = Math.max(0, Math.min(newX, window.innerWidth));
                newY = Math.max(0, Math.min(newY, window.innerHeight));

                if (movePlayer) movePlayer(newX, newY);

                // 衝突判定を更新
                const collidingObstacles = getCollidingObstacles(newX, newY);
                setECollisionStatus(collidingObstacles.length > 0);
                return { x: newX, y: newY };
            });
        }, 16); // 60FPS

        return () => clearInterval(moveInterval);
    }, [keys, speed, movePlayer]);

    // Eキー衝突判定の更新
    useEffect(() => {
        const collidingObstacles = getCollidingObstacles(x, y);
        setECollisionStatus(collidingObstacles.length > 0);
    }, [ECollisionPosition, rectPositions]);

    return { ECollisionPosition, ECollisionStatus, adjacentObstacles, ePressCount };
};

export default useRemakeItemGet;
