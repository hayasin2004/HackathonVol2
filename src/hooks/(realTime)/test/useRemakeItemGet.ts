"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { defaultItem } from "@/types/defaultItem";
import { playerGetItem } from "@/app/api/(realtime)/item/getItem/route";

interface UseGetItemProps {
    userId?: number;
    initialPosition: { x: number | null | undefined; y: number | null | undefined };
    // circleRadius は新しい衝突判定ロジックでは直接使用しませんが、型定義として残します
    circleRadius?: number;
    rectPositions?: Array<defaultItem> | null;
    speed?: number;
    movePlayer?: (x: number, y: number) => void;
}

// 定数としてタイルサイズを定義
const TILE_SIZE = 64;

const useRemakeItemGet = ({
                              userId,
                              initialPosition,
                              circleRadius = 0, // デフォルト値は保持
                              rectPositions,
                              // movePlayer, // 未使用なら削除
                          }: UseGetItemProps) => {

    const [ECollisionPosition, setECollisionPosition] = useState({ x: initialPosition.x, y: initialPosition.y });
    const [adjacentObstacles, setAdjacentObstacles] = useState<defaultItem[] | null>(null);
    const [ePressCount, setEPressCount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ECollisionStatus, setECollisionStatus] = useState(false);
    console.log(rectPositions)
    // processedItemIds は削除済み (前回の修正)
    const keyPressedRef = useRef(false);
    const keysRef = useRef({
        ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    });
    const windowWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 0);
    const windowHeightRef = useRef(typeof window !== 'undefined' ? window.innerHeight : 0);

    // 重複のないアイテム配列を取得 (変更なし)
    // const getUniqueItems = useCallback((items?: Array<defaultItem> | null) => {
    //     if (!items || items.length === 0) return [];
    //     const uniqueItems = new Map<string, defaultItem>();
    //     items.forEach(item => {
    //         if (item._uniqueId) {
    //             uniqueItems.set(item._uniqueId, item);
    //         }
    //     });
    //     return Array.from(uniqueItems.values());
    // }, []);

    // 衝突判定関数 (ロジック変更)
    const getCollidingObstacles = useCallback((playerX: number, playerY: number): defaultItem[] => {
        // const uniqueItems = getUniqueItems(rectPositions);
        if (rectPositions!.length === 0) return [];

        // --- 修正箇所: 新しい衝突判定ロジック ---
        // プレイヤーの座標を基準としたマスを特定
        // (playerX, playerY がプレイヤーのどの点を指すかによって調整が必要な場合がある)
        // ここでは playerX, playerY が基準点であると仮定
        const playerTileX = Math.floor(playerX / TILE_SIZE);
        const playerTileY = Math.floor(playerY / TILE_SIZE);

        // console.log(`プレイヤー基準マス: (${playerTileX}, ${playerTileY}) at (${playerX}, ${playerY})`); // デバッグ用

        const colliding = rectPositions!.filter((rect) => {
            if (rect.x == null || rect.y == null || !rect.width || !rect.height) {
                return false;
            }

            // アイテムの中心座標を計算 (rect.x, rect.y は左上座標と仮定)
            const itemCenterX = rect.x + rect.width / 2;
            const itemCenterY = rect.y + rect.height / 2;

            // アイテムの中心が存在するマスを特定
            const itemTileX = Math.floor(itemCenterX / TILE_SIZE);
            const itemTileY = Math.floor(itemCenterY / TILE_SIZE);

            // プレイヤーのマスを中心とした周囲1マス(3x3グリッド)以内か判定
            const isAdjacent =
                Math.abs(itemTileX - playerTileX) <= 1 && // X方向の差が1以内
                Math.abs(itemTileY - playerTileY) <= 1;   // Y方向の差が1以内

            // if (isAdjacent) {
            //      console.log(`アイテム ${rect._uniqueId} は範囲内。アイテムマス: (${itemTileX}, ${itemTileY})`); // デバッグ用
            // }

            return isAdjacent;
        });
        // --- 修正箇所ここまで ---

        return colliding;
        // 依存関係: rectPositions (getUniqueItems経由で), getUniqueItems
    }, [rectPositions]);

    // Eキーが押されたときの処理 (変更なし、getCollidingObstacles の結果を使う)
    const handleEKeyPress = useCallback(async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        console.log("Eキー処理開始", ECollisionPosition);
        try {
            const currentX = ECollisionPosition.x ?? 0;
            const currentY = ECollisionPosition.y ?? 0;
            // 新しいロジックの getCollidingObstacles を呼び出す
            const collidingObstacles = getCollidingObstacles(currentX, currentY);

            if (collidingObstacles.length > 0) {
                setAdjacentObstacles(collidingObstacles);
                const itemIdsToGet = collidingObstacles.map((item) => item.id);
                console.log("取得対象ItemIds:", itemIdsToGet);

                if (itemIdsToGet.length > 0 && userId !== undefined) {
                    const result = await playerGetItem(userId, itemIdsToGet);
                    if (result?.status === "success") {
                        console.log("アイテム獲得成功:", result.savedItem);
                    } else {
                        console.log("アイテム取得失敗:", result);
                    }
                }
            } else {
                console.log("隣接マスに取得可能なアイテムはありません", { x: currentX, y: currentY });
                setAdjacentObstacles(null);
            }
        } catch (err) {
            console.error("アイテム取得中にエラーが発生しました", err);
        } finally {
            setIsProcessing(false);
        }
    }, [ECollisionPosition, getCollidingObstacles, isProcessing, userId]); // getCollidingObstacles を依存配列に追加

    // キー入力イベントのリスナー設定 (変更なし)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key;
            if (key === "e") {
                if (!keyPressedRef.current) {
                    keyPressedRef.current = true;
                    setEPressCount((prevCount) => prevCount + 1);
                    handleEKeyPress();
                }
            } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
                const directionKey = key as keyof typeof keysRef.current;
                if (!keysRef.current[directionKey]) {
                    keysRef.current[directionKey] = true;
                    setECollisionPosition((prev) => {
                        let newX = prev.x ?? 0;
                        let newY = prev.y ?? 0;
                        const tile = TILE_SIZE; // 移動量も TILE_SIZE に合わせる
                        switch (key) {
                            case "ArrowUp":    newY -= tile; break;
                            case "ArrowDown":  newY += tile; break;
                            case "ArrowLeft":  newX -= tile; break;
                            case "ArrowRight": newX += tile; break;
                        }
                        const currentWindowWidth = windowWidthRef.current;
                        const currentWindowHeight = windowHeightRef.current;
                        // 画面境界チェック (キャラクターサイズを考慮しない場合)
                        newX = Math.max(0, Math.min(newX, currentWindowWidth));
                        newY = Math.max(0, Math.min(newY, currentWindowHeight));
                        // TODO: 必要ならキャラクターサイズを考慮した境界チェックを行う
                        return { x: newX, y: newY };
                    });
                }
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key;
            if (key === "e") {
                keyPressedRef.current = false;
            } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
                const directionKey = key as keyof typeof keysRef.current;
                keysRef.current[directionKey] = false;
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [handleEKeyPress]); // handleEKeyPress を依存関係に

    // ウィンドウリサイズ対応 (変更なし)
    useEffect(() => {
        const handleResize = () => {
            windowWidthRef.current = window.innerWidth;
            windowHeightRef.current = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 位置更新時の衝突状態判定 (変更なし、新しい getCollidingObstacles を使用)
    useEffect(() => {
        if (ECollisionPosition.x != null && ECollisionPosition.y != null) {
            // 新しいロジックで衝突判定
            const collidingObstacles = getCollidingObstacles(ECollisionPosition.x, ECollisionPosition.y);
            const hasCollision = collidingObstacles.length > 0;
            if (hasCollision !== ECollisionStatus) {
                setECollisionStatus(hasCollision);
            }
        }
    }, [ECollisionPosition, getCollidingObstacles, ECollisionStatus]); // getCollidingObstacles を依存配列に追加

    return {
        ECollisionPosition,
        ECollisionStatus, // このステータスは「隣接マスにアイテムがあるか」を示すようになる
        adjacentObstacles, // 取得対象となる隣接アイテムのリスト
        ePressCount,
    };
};

export default useRemakeItemGet;