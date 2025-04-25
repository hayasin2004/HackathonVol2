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
                setPosition(prevPosition => {
                    // 現在のウィンドウの幅と高さを取得
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;

                    // 新しい位置を計算
                    let newX = prevPosition.x + (Math.random() > 0.5 ? 64 : -64);
                    let newY = prevPosition.y + (Math.random() > 0.5 ? 64 : -64);
                    console.log(newX, newY);

                    if (newX < 0) newX = 0;
                    if (newY < 0) newY = 0;
                    if (newX >  screenWidth - 64) newX = screenWidth - 64;
                    if (newY >  screenHeight - 64) newY = screenHeight - 64;
                    return {x :newX  , y :newY}
                });
            }, 1000); // 1秒ごとに動かす

            return () => clearInterval(intervalId);
        }
    }, [type]);

    return position;
};

export default useEnemyRandomMovement;