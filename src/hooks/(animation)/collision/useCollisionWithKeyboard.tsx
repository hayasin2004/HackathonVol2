import { useEffect, useRef, useState } from "react";

const useCollisionWithKeyboard = (
    initialPosition = { x: 100, y: 100 }, // 初期位置
    rectPosition = { x: 200, y: 100, width: 100, height: 100 }, // 衝突対象
    circleRadius = 30 // 円の半径
) => {
    const [collisionKeyDownPosition, setCollisionKeyDownPosition] = useState(initialPosition); // 現在の位置
    const collidingRef = useRef(false); // 衝突状態管理用

    // 衝突検知関数
    const checkCollision = (newX: number, newY: number): boolean => {
        return (
            newX + circleRadius > rectPosition.x &&
            newX - circleRadius < rectPosition.x + rectPosition.width &&
            newY + circleRadius > rectPosition.y &&
            newY - circleRadius < rectPosition.y + rectPosition.height
        );
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault()
            const DELTA = 10; // 移動量
            setCollisionKeyDownPosition((prev) => {
                let newX = prev.x;
                let newY = prev.y;

                switch (e.key) {
                    case "ArrowLeft": // 左矢印
                        newX = prev.x - DELTA;
                        break;
                    case "ArrowRight": // 右矢印
                        newX = prev.x + DELTA;
                        break;
                    case "ArrowUp": // 上矢印
                        newY = prev.y - DELTA;
                        break;
                    case "ArrowDown": // 下矢印
                        newY = prev.y + DELTA;
                        break;
                    default:
                        return prev; // 無効なキーは無視
                }

                // 新しい座標を画面内に制限
                newX = Math.max(0, Math.min(window.innerWidth - circleRadius * 2, newX));
                newY = Math.max(0, Math.min(window.innerHeight - circleRadius * 2, newY));

                // 衝突判定
                const isColliding = checkCollision(newX, newY);

                if (isColliding && !collidingRef.current) {
                    console.log("衝突検知!!!");
                    collidingRef.current = true;
                    return prev; // 衝突時は位置を維持
                }

                if (!isColliding && collidingRef.current) {
                    console.log("衝突解除!!!");
                    collidingRef.current = false;
                }

                return { x: newX, y: newY }; // 新しい位置を返す
            });
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown); // クリーンアップ
        };
    }, [rectPosition, circleRadius]);

    return { collisionKeyDownPosition, collisionKeyDownColliding: collidingRef.current }; // 現在位置と衝突状態を返す
};

export default useCollisionWithKeyboard;