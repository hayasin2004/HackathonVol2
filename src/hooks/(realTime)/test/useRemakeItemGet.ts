"use client";
import {useState, useEffect, useCallback, useMemo, useRef} from "react";
import {defaultItem} from "@/types/defaultItem";

interface UseGetItemProps {
    userId?: number;
    initialPosition: { x: number | null | undefined; y: number | null | undefined };
    circleRadius?: number;
    rectPositions?: Array<defaultItem> | null;
    speed?: number; // プレイヤー移動速度
    movePlayer?: (x: number, y: number) => void; // プレイヤー移動通知関数
}

const useRemakeItemGet = ({
                              initialPosition: {x, y},
                              userId,
                              circleRadius = 30,
                              rectPositions,
                              speed = 5,
                              movePlayer,
                          }: UseGetItemProps) => {
    const [ECollisionPosition, setECollisionPosition] = useState({x, y});
    const [adjacentObstacles, setAdjacentObstacles] = useState<defaultItem[] | null>([]);
    const [keys, setKeys] = useState({
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        a: false,
        s: false,
        d: false,
    });
    const [ePressCount, setEPressCount] = useState(0); // Eキーの押下回数を記録
    const ECollisionRef = useRef(false);
    const keyPressedRef = useRef(false);
    const isProcessingRef = useRef(false);
    const memoizedRectPositions = useMemo(() => rectPositions, [rectPositions]);

    // useEffect(() => {
    //     keyPressedRef.current = false;
    // }, []);

    // 衝突判定
    const getCollidingObstacles = (newX: number | undefined | null, newY: number | undefined | null) => {
        const padding = 10;
        return memoizedRectPositions?.filter(
            (rect) =>
                newX! + circleRadius + padding > rect.x! &&
                newX! - circleRadius - padding < rect.x! + rect.width! &&
                newY! + circleRadius + padding > rect.y! &&
                newY! - circleRadius - padding < rect.y! + rect.height!
        );
    };

    useEffect(() => {
        const collidingObstacles = getCollidingObstacles(x, y);
    }, [ECollisionPosition, memoizedRectPositions]);

    // Eキー押下処理
    const handleEKeyPress = useCallback(async () => {
        if (isProcessingRef.current || !ECollisionRef.current) return;
        isProcessingRef.current = true;

        const collidingObstacles = getCollidingObstacles(x, y);
        if (collidingObstacles?.length > 0) {
            setAdjacentObstacles(collidingObstacles);
            try {
                const ItemIds = collidingObstacles.map((item) => item.id);
                if (ItemIds.length > 0 && userId !== undefined) {
                    // 省略された処理
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
    }, [userId, ECollisionPosition]);

    // キー入力を検知して移動を処理
    const handleKeyDown = (e: KeyboardEvent) => {

        if (e.key === "e" || e.key === "E") {
            if (!keyPressedRef.current) {
                keyPressedRef.current = true;
                setEPressCount((prevCount) => prevCount + 1);
                handleEKeyPress();
                console.log("Eキーの押下回数");
                return;
            }
        }


        if (keys.hasOwnProperty(e.key)) {
            setKeys((prev) => ({...prev, [e.key]: true}));
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === "e" || e.key === "E") {
            keyPressedRef.current = false;
            console.log("Eキーが離されました");
        }

        if (keys.hasOwnProperty(e.key)) {
            setKeys((prev) => ({...prev, [e.key]: false}));
        }
    };
    useEffect(() => {
        const moveInterval = setInterval(() => {
            setECollisionPosition((prev) => {
                let newX = prev.x ?? 0;
                let newY = prev.y ?? 0;

                // 上下移動
                if (keys.ArrowUp || keys.w) newY -= speed;
                if (keys.ArrowDown || keys.s) newY += speed;

                // 左右移動
                if (keys.ArrowLeft || keys.a) newX -= speed;
                if (keys.ArrowRight || keys.d) newX += speed;

                // 境界チェック（画面内に収める）
                newX = Math.max(0, Math.min(newX, window.innerWidth));
                newY = Math.max(0, Math.min(newY, window.innerHeight));

                // 移動通知
                if (movePlayer) {
                    movePlayer(newX, newY);
                }

                return {x: newX, y: newY};
            });
        }, 16); // 約60FPS

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            clearInterval(moveInterval);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [keys, speed, movePlayer, handleKeyDown, handleKeyUp]);

    return {
        ECollisionPosition,
        ECollisionStatus: ECollisionRef.current,
        adjacentObstacles,
        ePressCount, // Eキーの押下回数を返す
    };
};

export default useRemakeItemGet;