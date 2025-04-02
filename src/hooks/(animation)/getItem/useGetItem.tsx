import { useEffect, useMemo, useRef, useState } from "react";
import { defaultItem } from "@/types/defaultItem";
import { playerGetItem } from "@/repository/prisma/ClientItemRepository";

const useGetItem = (
    userId,
    initialPosition = { x: 100, y: 100 },
    circleRadius = 30,
    rectPositions
) => {
    const [ECollisionPosition, setECollisionPosition] = useState(initialPosition);
    const [adjacentObstacles, setAdjacentObstacles] = useState([]);
    const [adjacentObstaclesStatus, setAdjacentObstaclesStatus] = useState("");
    const ECollisionRef = useRef(false);
    const keyPressedRef = useRef(false);
    const isProcessingRef = useRef(false);

    const memoizedRectPositions = useMemo(() => rectPositions, [rectPositions]);

    const getCollidingObstacles = (newX, newY) => {
        const padding = 10;
        return memoizedRectPositions?.filter(rect =>
            newX + circleRadius + padding > rect.x &&
            newX - circleRadius - padding < rect.x + rect.width &&
            newY + circleRadius + padding > rect.y &&
            newY - circleRadius - padding < rect.y + rect.height
        );
    };

    const handleEKeyPress = async () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        const collidingObstacles = getCollidingObstacles(ECollisionPosition.x, ECollisionPosition.y);
        if (collidingObstacles.length > 0) {
            setAdjacentObstacles(collidingObstacles);
            setAdjacentObstaclesStatus("");
            try {
                const ItemIds = collidingObstacles.map(item => item.id);
                if (ItemIds.length > 0 && userId !== undefined) {
                    const result = await playerGetItem(userId, ItemIds);
                    if (result?.status === "success") {
                        console.log("アイテム獲得成功:", result.savedItem);
                        setAdjacentObstacles([]);
                    } else {
                        console.log("アイテム取得失敗");
                    }
                }
            } catch (err) {
                console.log("アイテム取得中にエラーが発生しました", err);
            } finally {
                isProcessingRef.current = false;
            }
        } else {
            console.log("隣接している障害物はありません");
            setAdjacentObstaclesStatus("衝突なし");
            isProcessingRef.current = false;
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            e.preventDefault();
            const DELTA = 10;

            if (e.keyCode === 69 && !keyPressedRef.current) {
                keyPressedRef.current = true;
                handleEKeyPress();
                return;
            }

            setECollisionPosition((prev) => {
                let newX = prev.x;
                let newY = prev.y;
                if (e.keyCode === 37) newX -= DELTA;
                if (e.keyCode === 38) newY -= DELTA;
                if (e.keyCode === 39) newX += DELTA;
                if (e.keyCode === 40) newY += DELTA;

                newX = Math.max(0, Math.min(window.innerWidth - circleRadius * 2, newX));
                newY = Math.max(0, Math.min(window.innerHeight - circleRadius * 2, newY));
                return { x: newX, y: newY };
            });
        };

        const handleKeyUp = (e) => {
            if (e.keyCode === 69) {
                keyPressedRef.current = false;
                console.log("Eキーが離されました");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [ECollisionPosition]);

    return { ECollisionPosition, ECollisionStatus: ECollisionRef.current, adjacentObstacles, adjacentObstaclesStatus };
};

export default useGetItem;