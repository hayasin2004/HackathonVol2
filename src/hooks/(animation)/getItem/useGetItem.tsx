import { useEffect, useMemo, useRef, useState } from "react";
import { defaultItem } from "@/types/defaultItem";
import { playerGetItem } from "@/repository/prisma/ClientItemRepository";

const useGetItem = (
    userId : number | undefined,
    initialPosition : {x : number | undefined | null ,y : number | undefined | null} = { x : 0 ,y : 0 },
    circleRadius = 30,
    rectPositions : Array<defaultItem> | null
) => {
    const [ECollisionPosition, setECollisionPosition] = useState(initialPosition);
    const [adjacentObstacles, setAdjacentObstacles] = useState<defaultItem[] | null>([]);
    const [adjacentObstaclesStatus, setAdjacentObstaclesStatus] = useState("");
    console.log(adjacentObstaclesStatus)
    const ECollisionRef = useRef(false);
    const keyPressedRef = useRef(false);
    const isProcessingRef = useRef(false);

    const memoizedRectPositions = useMemo(() => rectPositions, [rectPositions]);

    const getCollidingObstacles = (newX : number | undefined | null, newY: number | undefined | null) => {
        console.log(newX , newY)
        const padding = 10;
        return memoizedRectPositions?.filter(rect =>
            newX! + circleRadius + padding > rect.x! &&
            newX! - circleRadius - padding < rect.x! + rect.width! &&
            newY! + circleRadius + padding > rect.y! &&
            newY! - circleRadius - padding < rect.y! + rect.height!
        );
    };

    useEffect(() => {
        const collidingObstacles = getCollidingObstacles(ECollisionPosition.x, ECollisionPosition.y);

        ECollisionRef.current = collidingObstacles!.length > 0;
        if (collidingObstacles!.length === 0) {
            setAdjacentObstacles(null);
        }
    }, [ECollisionPosition, memoizedRectPositions]);

    const handleEKeyPress = async () => {
        if (isProcessingRef.current || !ECollisionRef.current) return;
        isProcessingRef.current = true;

        const collidingObstacles = getCollidingObstacles(ECollisionPosition.x, ECollisionPosition.y);
        if (collidingObstacles!.length > 0) {
            setAdjacentObstacles(collidingObstacles!);
            try {
                const ItemIds = collidingObstacles!.map(item => item.id);
                if (ItemIds.length > 0 && userId !== undefined) {
                    const result = await playerGetItem(userId, ItemIds);
                    if (result?.status === "success") {
                        console.log("アイテム獲得成功:", result.savedItem);
                        setAdjacentObstacles(collidingObstacles!); // 隣接している障害物を更新

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
            setAdjacentObstacles(null);
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
                let newX = prev.x ?? 100;
                let newY = prev.y ?? 100;
                if (e.keyCode === 37) newX! -= DELTA;
                if (e.keyCode === 38) newY! -= DELTA;
                if (e.keyCode === 39) newX! += DELTA;
                if (e.keyCode === 40) newY! += DELTA;

                newX = Math.max(0, Math.min(window.innerWidth - circleRadius * 2, newX!));
                newY = Math.max(0, Math.min(window.innerHeight - circleRadius * 2, newY!));
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
