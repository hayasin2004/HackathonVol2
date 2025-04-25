// src/hooks/(animation)/enemy/linearEnemy/useEnemyLinearRandomMovement.ts
import { useState, useEffect } from 'react';

interface Position {
    x: number;
    y: number;
}

const useEnemyLinearRandomMovement = (initialX: number, initialY: number) => {
    const [position, setPosition] = useState<Position>({ x: initialX, y: initialY });
    const [direction, setDirection] = useState<number>(64); // 水平方向に固定

    useEffect(() => {
        const intervalId = setInterval(() => {
            setPosition(prevPosition => {
                const screenWidth = window.innerWidth;

                // 新しい位置を計算
                let newX = prevPosition.x + direction;

                // 境界に達した場合、方向を反転
                if (newX < 0 || newX > screenWidth - 64) {
                    setDirection(prevDirection => -prevDirection);
                    newX = prevPosition.x - direction;
                }

                return { x: newX, y: initialY }; // yは固定
            });
        }, 1000); // 1秒ごとに動かす

        return () => clearInterval(intervalId);
    }, [direction]);

    return position;
};

export default useEnemyLinearRandomMovement;