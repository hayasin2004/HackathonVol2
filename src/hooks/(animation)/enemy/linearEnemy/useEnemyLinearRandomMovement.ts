// src/hooks/(animation)/enemy/linearEnemy/useEnemyLinearRandomMovement.ts
import { useState, useEffect } from 'react';

interface Position {
    x: number;
    y: number;
}

const useEnemyLinearRandomMovement = (initialX: number, initialY: number) => {
    const [position, setPosition] = useState<Position>({ x: initialX, y: initialY });
    const [directionX, setDirectionX] = useState<number>(64); // 水平方向の移動量
    const [directionY, setDirectionY] = useState<number>(32); // 垂直方向の移動量

    useEffect(() => {
        const intervalId = setInterval(() => {
            setPosition(prevPosition => {
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;

                // ランダムにx軸かy軸を選択
                const moveX = Math.random() < 0.5;

                let newX = prevPosition.x;
                let newY = prevPosition.y;

                if (moveX) {
                    newX += directionX;
                    // 水平方向の境界に達した場合、方向を反転
                    if (newX < 0 || newX > screenWidth - 64) {
                        setDirectionX(prevDirection => -prevDirection);
                        newX = prevPosition.x - directionX;
                    }
                } else {
                    newY += directionY;
                    // 垂直方向の境界に達した場合、方向を反転
                    if (newY < 0 || newY > screenHeight - 64) {
                        setDirectionY(prevDirection => -prevDirection);
                        newY = prevPosition.y - directionY;
                    }
                }

                return { x: newX, y: newY };
            });
        }, 500);

        return () => clearInterval(intervalId);
    }, [directionX, directionY]);

    return position;
};

export default useEnemyLinearRandomMovement;