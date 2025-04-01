import {useEffect, useRef, useState} from "react";
import {defaultItem} from "@/types/defaultItem";
import {playerGetItem} from "@/repository/prisma/ClientItemRepository";

const useGetItem = (
    userId: number | undefined,
    initialPosition = {x: 100, y: 100},
    circleRadius = 30,
    rectPositions: Array<defaultItem> | null
) => {
    const [ECollisionPosition, setECollisionPosition] = useState(initialPosition);
    const [adjacentObstacles, setAdjacentObstacles] = useState<Array<defaultItem>>([]);

    const [adjacentObstaclesStatus, setAdjacentObstaclesStatus] = useState("");
    const ECollisionRef = useRef(false);


    // 衝突検知関数を拡張して隣接する障害物を返す
    const getCollidingObstacles = (newX: number, newY: number) => {
        const padding = 10;
        return rectPositions?.filter(rect =>
            newX + circleRadius + padding > rect.x! &&
            newX - circleRadius - padding < rect.x! + rect.width! &&
            newY + circleRadius + padding > rect.y! &&
            newY - circleRadius - padding < rect.y! + rect.height!
        );
    };


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            const DELTA = 10;

            setECollisionPosition((prev) => {
                let newX = prev.x;
                let newY = prev.y;

                switch (e.keyCode) {
                    case 37: // 左矢印キー
                        newX = prev.x - DELTA;
                        break;
                    case 38: // 上矢印キー
                        newY = prev.y - DELTA;
                        break;
                    case 39: // 右矢印キー
                        newX = prev.x + DELTA;
                        break;
                    case 40: // 下矢印キー
                        newY = prev.y + DELTA;
                        break;
                    case 69: // Eキー
                        const collidingObstacles = getCollidingObstacles(prev.x, prev.y);
                        if (collidingObstacles!.length > 0) {
                            console.log("隣接している障害物:", collidingObstacles);
                            setAdjacentObstacles(collidingObstacles!); // 隣接している障害物を更新
                            setAdjacentObstaclesStatus("")


                            console.log(collidingObstacles)
                            //ここにアイテム取得機能呼び出し
                            // userId , collidingObstacles.id
                            const getItem = async () => {
                                const ItemId = collidingObstacles!.map((item) => {
                                    return item.id
                                })
                                try {
                                    if (ItemId) {
                                        const result = await playerGetItem(userId, ItemId)
                                        if (result) {
                                            console.log("アイテム獲得成功:", result.savedItem);
                                        } else {
                                            console.log('アイテム取得失敗')

                                        }
                                    }
                                } catch (err) {
                                    console.log('アイテム取得中にエラーが起きました')
                                }
                                return;
                            }
                            getItem(); // getItem関数を呼び出す

                        } else {
                            console.log("隣接している障害物はありません");
                            setAdjacentObstaclesStatus("衝突なし")
                        }
                        return prev; // 位置を維持
                    default:
                        break;
                }

                newX = Math.max(0, Math.min(window.innerWidth - circleRadius * 2, newX));
                newY = Math.max(0, Math.min(window.innerHeight - circleRadius * 2, newY));

                const isCollision = getCollidingObstacles(newX, newY)!.length > 0;

                if (isCollision && !ECollisionRef.current) {
                    console.log("衝突検知");
                    ECollisionRef.current = true;
                    return prev; // 衝突時は位置を維持
                }

                if (!isCollision && ECollisionRef.current) {
                    console.log("衝突回避");
                    setAdjacentObstaclesStatus("衝突なし")
                    ECollisionRef.current = false;
                }

                return {x: newX, y: newY};
            });
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [rectPositions]); // 障害物リストを依存関係に含める

    return {ECollisionPosition, ECollisionStatus: ECollisionRef.current, adjacentObstacles, adjacentObstaclesStatus};
};

export default useGetItem;