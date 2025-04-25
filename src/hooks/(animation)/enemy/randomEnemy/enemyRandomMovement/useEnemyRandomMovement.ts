// src/hooks/useRandomMovement.ts
import {useState, useEffect} from 'react';

interface Position {
    x: number;
    y: number;
}

const useEnemyRandomMovement = (initialX: number, initialY: number, type: string) => {
    const [position, setPosition] = useState<Position>({x: initialX, y: initialY});
    useEffect(() => {
        if (type === "random") {
            const intervalId = setInterval(() => {
                setPosition(prevPosition => ({
                    x: prevPosition.x + (Math.random() > 0.5 ? 64 : -64),
                    y: prevPosition.y + (Math.random() > 0.5 ? 64 : -64),
                }));
            }, 1000); // 1秒ごとに動かす

            return () => clearInterval(intervalId);
        }
    }, [type]);

    return position;
};

export default useEnemyRandomMovement;