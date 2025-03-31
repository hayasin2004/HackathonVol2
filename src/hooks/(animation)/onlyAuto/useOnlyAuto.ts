"use client"

import {useEffect, useRef, useState} from "react";

export const useOnlyAuto = (initialPosition : {x: number , y: number} , initialDeltaX : number ) => {
    const animationRef = useRef<number | null>(null);
    const [autoActionPosition, setAutoActionPosition] = useState(initialPosition)
    const [deltaX, setDeltaX] = useState(initialDeltaX)

    useEffect(() => {
        const updatePosition = () => {
            setAutoActionPosition((prev) => {
                let newX =  prev.x + deltaX
                let newY = prev.y;

                if (newX >= window.innerWidth){
                //     画面右に引っ付く
                    console.log("右")
                    setDeltaX(-Math.abs(deltaX))
                }

                if (newX <= 0){
                //     画面左に引っ付く
                    console.log("左")
                    setDeltaX(Math.abs(deltaX))
                }

                return { x: newX, y: newY };
            })
            // 二回目以降のアニメーション予約
            animationRef.current = requestAnimationFrame(updatePosition)
        }
        // 初期動作の予約
        animationRef.current = requestAnimationFrame(updatePosition)
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [deltaX]);
    return { autoActionPosition , setAutoActionPosition}
}