"use client"
import React, {useEffect, useRef, useState} from 'react';

const useEventHappen = (
    initialPosition = {x: 100, y: 100},
    rectPosition = {x: 200, y: 100, width: 100, height: 100},
    circleRadius = 30
) => {
    const [ECollisionPosition, setECollisionPosition] = useState(initialPosition)
    const ECollisionRef = useRef(false);

    const checkCollision = (newX: number, newY: number) => {
        const padding = 20
        return (
            newX + circleRadius + padding > rectPosition.x &&
            newX - circleRadius - padding< rectPosition.x + rectPosition.width &&
            newY + circleRadius + padding> rectPosition.y &&
            newY - circleRadius - padding< rectPosition.y + rectPosition.height
        )
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault()
            const DELTA = 10
            
            setECollisionPosition((prev) =>{
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
                    case 69: // Eキー
                        if (checkCollision(prev.x, prev.y)) {
                            alert("障害物に隣接しています！");
                        }
                        return prev
                    default:
                        break; //無効なキーを排除するもの
                }

                newX = Math.max(0 , (window.innerHeight - circleRadius*2 , newX))
                newY = Math.max(0 , (window.innerHeight - circleRadius*2 , newY))

                const isCollision = checkCollision(newX, newY)

                if (isCollision && !ECollisionRef.current) {
                    console.log("衝突検知")
                    ECollisionRef.current = true
                    return prev
                }

                if (!isCollision && ECollisionRef.current) {
                    console.log("衝突回避")
                    ECollisionRef.current = false
                }

                return  {x : newX, y: newY}

            })
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown" , handleKeyDown)
        }

    } , [rectPosition, ECollisionRef])
    return { ECollisionPosition , ECollisionStatus : ECollisionRef.current}

}


export default useEventHappen;