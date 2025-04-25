import { useState, useEffect } from 'react';

interface Position {
    x: number;
    y: number;
}

const useEnemyLinearRandomMovement = (initialX: number, initialY: number) => {
    const startX = initialX ?? 0;
    const startY = initialY ?? 0;

    // 移動範囲の制限（初期位置を中心に500px × 500px）
    const minX = Math.max(0, startX - 250);
    const maxX = startX + 250;
    const minY = Math.max(0, startY - 250);
    const maxY = startY + 250;

    const [linearPosition, setLinearPosition] = useState<Position>({ x: startX, y: startY });
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [xDirection, setXDirection] = useState<number>(64);
    const [yDirection, setYDirection] = useState<number>(64);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setLinearPosition(prevPosition => {
                let newX = prevPosition.x;
                let newY = prevPosition.y;
                let newXDirection = xDirection;
                let newYDirection = yDirection;

                // 2/1の確率でX軸またはY軸を動かす
                if (Math.random() > 0.5) {
                    newX += newXDirection;

                    // 範囲制限に達したら方向を反転
                    if (newX < minX || newX > maxX) {
                        newXDirection = -newXDirection;
                        newX += newXDirection;
                    }

                    // 画面外に出ないように追加の制限
                    const screenWidth = window.innerWidth;
                    if (newX < 0 || newX > screenWidth - 64) {
                        newXDirection = -newXDirection;
                        newX += newXDirection;
                    }

                    setXDirection(newXDirection);
                } else {
                    newY += newYDirection;

                    // 範囲制限に達したら方向を反転
                    if (newY < minY || newY > maxY) {
                        newYDirection = -newYDirection;
                        newY += newYDirection;
                    }

                    // 画面外に出ないように追加の制限
                    const screenHeight = window.innerHeight;
                    if (newY < 0 || newY > screenHeight - 64) {
                        newYDirection = -newYDirection;
                        newY += newYDirection;
                    }

                    setYDirection(newYDirection);
                }

                setShowDialog(true);
                setTimeout(() => {
                    setShowDialog(false);
                }, 500);

                return { x: newX, y: newY };
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [minX, maxX, minY, maxY, xDirection, yDirection]);

    return { linearPosition, showDialog };
};

export default useEnemyLinearRandomMovement;