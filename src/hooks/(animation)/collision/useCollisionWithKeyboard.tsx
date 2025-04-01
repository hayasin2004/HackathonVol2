"use client"

import {useEffect, useRef, useState} from "react";

const useCollisionWithKeyboard = (
    initialPosition = {x: 100, y: 100},
    rectPosition = {x: 200, y: 100, width: 100, height: 100},
    circleRadius = 30
) => {
    // 衝突用の関数の宣言
    const [collisionKeyDownPosition, setCollisionKeyDownPosition] = useState(initialPosition)
    const collisionRef = useRef(false);

//     衝突関数宣言
    const checkCollision = (newX: number, newY: number): boolean => {
        const padding = 20
        return (
            newX + circleRadius + padding > rectPosition.x &&
            newX - circleRadius - padding< rectPosition.x + rectPosition.width &&
            newY + circleRadius + padding> rectPosition.y &&
            newY - circleRadius - padding< rectPosition.y + rectPosition.height
        )
    }

//     キーボード操作の関数定義
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault()
            const DELTA = 10; //移動量
            setCollisionKeyDownPosition((prev) => {
                let newX = prev.x
                let newY = prev.y

                switch (e.keyCode) {
                    case 37: // 左矢印キー
                        newX = prev.x - DELTA;
                        break;
                    case 38: // 上矢印キー
                        newY = prev.y - DELTA
                        break;
                    case 39: // 右矢印キー
                        newX = prev.x + DELTA;
                        break;
                    case 40: // 下矢印キー
                        newY = prev.y + DELTA
                        break;
                    default:
                        break; //無効なキーを排除するもの
                }

                newX = Math.max(0, Math.min(window.innerWidth - circleRadius * 2, newX))
                newY = Math.max(0, Math.min(window.innerWidth - circleRadius * 2, newY))

                const isCollision = checkCollision(newX, newY)

                if (isCollision && !collisionRef.current) {
                    console.log("衝突した")
                    collisionRef.current = true
                    return prev //衝突時は位置を維持
                }

                if (!isCollision && collisionRef.current) {
                    console.log("衝突を回避")
                    collisionRef.current = false
                }
                return {x: newX, y: newY}
            })
        }
        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown);//初期化
        }

    }, [rectPosition, collisionRef]);
    return {collisionKeyDownPosition, collisionStatus: collisionRef.current}

}

export default useCollisionWithKeyboard;