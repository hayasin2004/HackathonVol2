import { useState, useEffect } from 'react';

interface Position {
    x: number;
    y: number;
}

const useEnemyRandomMovement = (initialX: number, initialY: number) => {
    const startX = initialX ?? 0;
    const startY = initialY ?? 0;

    const [position, setPosition] = useState<Position>({ x: startX, y: startY });
    const [showDialog, setShowDialog] = useState<boolean>(false);

    useEffect(() => {
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

                setShowDialog(true);
                setTimeout(() => {
                    setShowDialog(false);
                }, 500);
                return { x: newX, y: newY };
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return { position, showDialog };
};

export default useEnemyRandomMovement;