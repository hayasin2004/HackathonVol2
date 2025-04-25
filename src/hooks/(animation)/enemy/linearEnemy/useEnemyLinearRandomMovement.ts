import { useState, useEffect } from 'react';

interface Position {
    x: number;
    y: number;
}

const useEnemyLinearRandomMovement = (initialX: number, initialY: number) => {
    const startX = initialX ?? 0;
    const startY = initialY ?? 0;

    const [linearPosition, setLinearPosition] = useState<Position>({ x: startX, y: startY });
    const [showDialog, setShowDialog] = useState<boolean>(false);

    useEffect(() => {
        let xDirection = 64; // X方向の移動量
        let yDirection = 64; // Y方向の移動量

        const intervalId = setInterval(() => {
            setLinearPosition(prevPosition => {
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;

                let newX = prevPosition.x;
                let newY = prevPosition.y;

                // 2/1の確率でX軸またはY軸を動かす
                if (Math.random() > 0.5) {
                    newX += xDirection;
                    if (newX < 0 || newX > screenWidth - 64) {
                        xDirection = -xDirection; // 画面外に出たら方向を反転
                        newX += xDirection;
                    }
                } else {
                    newY += yDirection;
                    if (newY < 0 || newY > screenHeight - 64) {
                        yDirection = -yDirection; // 画面外に出たら方向を反転
                        newY += yDirection;
                    }
                }

                setShowDialog(true);
                setTimeout(() => {
                    setShowDialog(false);
                }, 500);
                return { x: newX, y: newY };
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return { linearPosition, showDialog };
};

export default useEnemyLinearRandomMovement;