import {useState, useEffect} from 'react';

interface Position {
    x: number;
    y: number;
}

const useEnemyRandomMovement = (initialX: number, initialY: number) => {

    const startX = initialX ?? 0;
    const startY = initialY ?? 0;
    // 移動範囲の制限（初期位置を中心に500px × 500px）
    const minX = Math.max(0, startX - 250);
    const maxX = startX + 250;
    const minY = Math.max(0, startY - 250);
    const maxY = startY + 250;
    const [position, setPosition] = useState<Position>({x: startX, y: startY});
    const [showDialog, setShowDialog] = useState<boolean>(false);
    useEffect(() => {
        const intervalId = setInterval(() => {
            setPosition(prevPosition => {
                // 前の位置から±64pxの範囲でランダムに移動
                let newX = prevPosition.x + (Math.random() > 0.5 ? 64 : -64);
                let newY = prevPosition.y + (Math.random() > 0.5 ? 64 : -64);
                // 移動範囲を制限（500px × 500px）
                newX = Math.max(minX, Math.min(maxX, newX));
                newY = Math.max(minY, Math.min(maxY, newY));
                // 画面外に出ないように追加の制限
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;
                newX = Math.max(0, Math.min(screenWidth - 64, newX));
                newY = Math.max(0, Math.min(screenHeight - 64, newY));
                setShowDialog(true);
                setTimeout(() => {
                    setShowDialog(false);
                }, 500);
                return {x: newX, y: newY};
            });
        }, 1000);
        return () => clearInterval(intervalId);
    }, [minX, maxX, minY, maxY])
    return {position, showDialog};

};

export default useEnemyRandomMovement;