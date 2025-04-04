"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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
                              userId,
                              initialPosition,
                              circleRadius = 30,
                              rectPositions,
                              speed = 5,
                              movePlayer,
                          }: UseGetItemProps) => {
    // 初期値がnullの場合に0をデフォルト値として使用
    const initialX = initialPosition.x ?? 0;
    const initialY = initialPosition.y ?? 0;

    const [ECollisionPosition, setECollisionPosition] = useState({ x: initialX, y: initialY });
    const [adjacentObstacles, setAdjacentObstacles] = useState<defaultItem[] | null>(null);
    const [keys, setKeys] = useState<Record<string, boolean>>({});
    const [ePressCount, setEPressCount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ECollisionStatus, setECollisionStatus] = useState(false);
    const keyPressedRef = useRef(false);

    // デバッグ用: rectPositionsが更新されたらログを出力
    useEffect(() => {
        console.log("rectPositions更新:", {
            件数: rectPositions?.length || 0,
            データ: rectPositions
        });
    }, [rectPositions]);

    // 衝突判定関数 - useCallbackで依存関係を明確にし、再レンダリングを最適化
    const getCollidingObstacles = useCallback((newX: number, newY: number): defaultItem[] => {
        // rectPositionsが空または存在しない場合は早期リターン
        if (!rectPositions || rectPositions.length === 0) {
            return [];
        }

        const padding = 10; // 衝突判定の余白

        const colliding = rectPositions.filter((rect) => {
            // rectの必須プロパティが存在するか確認
            if (rect.x == null || rect.y == null || !rect.width || !rect.height) {
                return false;
            }

            // 衝突判定の計算
            const isColliding =
                newX + circleRadius + padding > rect.x &&
                newX - circleRadius - padding < rect.x + rect.width &&
                newY + circleRadius + padding > rect.y &&
                newY - circleRadius - padding < rect.y + rect.height;

            return isColliding;
        });

        // デバッグ用: 衝突が検出された場合のログ
        if (colliding.length > 0) {
            console.log("衝突検知!", {
                プレイヤー: { x: newX, y: newY, 半径: circleRadius },
                衝突アイテム: colliding
            });
        }

        return colliding;
    }, [rectPositions, circleRadius]);

    // Eキーが押されたときの処理
    const handleEKeyPress = useCallback(async () => {
        // 処理中または既に衝突状態の場合は処理しない
        if (isProcessing) return;

        setIsProcessing(true);
        console.log("Eキー処理開始", ECollisionPosition);

        try {
            // 現在位置での衝突判定
            const currentX = ECollisionPosition.x ?? 0;
            const currentY = ECollisionPosition.y ?? 0;
            const collidingObstacles = getCollidingObstacles(currentX, currentY);

            if (collidingObstacles.length > 0) {
                console.log("衝突物体検出:", collidingObstacles);
                setAdjacentObstacles(collidingObstacles);

                const itemIds = collidingObstacles.map((item) => item.id);
                console.log("取得対象ItemIds:", itemIds);

                if (itemIds.length > 0 && userId !== undefined) {
                    const result = await playerGetItem(userId, itemIds);
                    if (result?.status === "success") {
                        console.log("アイテム獲得成功:", result.savedItem);
                    } else {
                        console.log("アイテム取得失敗:", result);
                    }
                }
            } else {
                console.log("隣接している障害物はありません", { x: currentX, y: currentY });
                setAdjacentObstacles(null);
            }
        } catch (err) {
            console.error("アイテム取得中にエラーが発生しました", err);
        } finally {
            setIsProcessing(false);
        }
    }, [ECollisionPosition, getCollidingObstacles, isProcessing, userId]);

    // キー入力イベントのリスナー設定
    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "e") {
                if (!keyPressedRef.current) {
                    keyPressedRef.current = true;
                    setEPressCount((prevCount) => prevCount + 1);
                    console.log("Eキー押下", ePressCount + 1);
                    await handleEKeyPress();
                }
            } else {
                setKeys((prev) => ({ ...prev, [e.key]: true }));
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "e") {
                keyPressedRef.current = false;
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
    }, [handleEKeyPress, ePressCount]);

    // プレイヤー移動処理
    useEffect(() => {
        const moveInterval = setInterval(() => {
            setECollisionPosition((prev) => {
                // 現在位置（null/undefinedの場合は0を使用）
                let newX = prev.x ?? 0;
                let newY = prev.y ?? 0;

                // キー入力による位置更新
                if (keys.ArrowUp || keys.w) newY -= speed;
                if (keys.ArrowDown || keys.s) newY += speed;
                if (keys.ArrowLeft || keys.a) newX -= speed;
                if (keys.ArrowRight || keys.d) newX += speed;

                // 画面境界内に収める
                newX = Math.max(0, Math.min(newX, window.innerWidth));
                newY = Math.max(0, Math.min(newY, window.innerHeight));

                // 親コンポーネントに位置を通知
                if (movePlayer) movePlayer(newX, newY);

                return { x: newX, y: newY };
            });
        }, 16); // 約60FPS

        return () => clearInterval(moveInterval);
    }, [keys, speed, movePlayer]);

    // 位置更新時の衝突判定
    useEffect(() => {
        if (ECollisionPosition.x != null && ECollisionPosition.y != null) {
            const collidingObstacles = getCollidingObstacles(ECollisionPosition.x, ECollisionPosition.y);
            const hasCollision = collidingObstacles.length > 0;

            // 衝突状態が変わった場合のみ更新
            if (hasCollision !== ECollisionStatus) {
                setECollisionStatus(hasCollision);
                console.log(hasCollision ? "衝突状態に入りました" : "衝突状態から抜けました", {
                    位置: ECollisionPosition
                });
            }
        }
    }, [ECollisionPosition, getCollidingObstacles, ECollisionStatus]);

    return {
        ECollisionPosition,
        ECollisionStatus,
        adjacentObstacles,
        ePressCount
    };
};

export default useRemakeItemGet;