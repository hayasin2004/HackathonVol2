// src/hooks/(animation)/enemy/randomEnemy/useEnemyRandomMovement.ts
import { useState, useEffect } from 'react';
import useEnemyLinearRandomMovement from "@/hooks/(animation)/enemy/linearEnemy/useEnemyLinearRandomMovement";

interface Position {
    x: number;
    y: number;
}

const useEnemyRandomMovement = (initialX: number, initialY: number, type: string) => {
    const [position, setPosition] = useState<Position>({ x: initialX, y: initialY });

    useEffect(() => {
        if (type === "random") {
            const intervalId = setInterval(() => {
                setPosition(prevPosition => {
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;

                    let newX = prevPosition.x + (Math.random() > 0.5 ? 64 : -64);
                    let newY = prevPosition.y + (Math.random() > 0.5 ? 64 : -64);

                    if (newX < 0) newX = 0;
                    if (newY < 0) newY = 0;
                    if (newX > screenWidth - 64) newX = screenWidth - 64;
                    if (newY > screenHeight - 64) newY = screenHeight - 64;

                    return { x: newX, y: newY };
                });
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [type]);



    // Linear movement hook
    const linearPosition = useEnemyLinearRandomMovement(initialX, initialY);

    // Return position based on type
    return type === "linear" ? linearPosition : position;
};

export default useEnemyRandomMovement;