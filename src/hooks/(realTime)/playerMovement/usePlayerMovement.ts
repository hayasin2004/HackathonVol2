// hooks/usePlayerMovement.ts
import {useState, useEffect, useCallback} from 'react';

interface UsePlayerMovementProps {
    initialX?: number | null;
    initialY?: number | null;
    speed?: number;
    movePlayer?: (x: number, y: number) => void;
}

export function usePlayerMovement({
                                      initialX,
                                      initialY,
                                      speed ,
                                      movePlayer
                                  }: UsePlayerMovementProps = {}) {
    const [position, setPosition] = useState({x: initialX, y: initialY});
    console.log("koreうごいたよ！！！！！！！！！！！！！！")
    const [keys, setKeys] = useState({
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        a: false,
        s: false,
        d: false
    });

    // キー入力を検知する
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const key = e.key;
        if (keys.hasOwnProperty(key)) {
            setKeys(prev => ({...prev, [key]: true}));
        }
    }, [keys]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        const key = e.key;
        if (keys.hasOwnProperty(key)) {
            setKeys(prev => ({...prev, [key]: false}));
        }
    }, [keys]);

    // 移動を処理する
    useEffect(() => {
        const moveInterval = setInterval(() => {
            setPosition(prev => {
                let newX = prev.x;
                let newY = prev.y;

                // 上下移動
                if (keys.ArrowUp || keys.w) newY! -= speed;
                if (keys.ArrowDown || keys.s) newY ! += speed;

                // 左右移動
                if (keys.ArrowLeft || keys.a) newX! -= speed;
                if (keys.ArrowRight || keys.d) newX! += speed;

                // 移動があれば移動処理を実行
                if (newX !== prev.x || newY !== prev.y) {
                    // 境界チェック（例: 画面内に収める）
                    newX = Math.max(0, Math.min(newX!, window.innerWidth));
                    newY = Math.max(0, Math.min(newY!, window.innerHeight));

                    // サーバーに移動を通知
                    if (movePlayer) {
                        movePlayer(newX, newY);
                    }

                    return {x: newX, y: newY};
                }

                return prev;
            });
        }, 16); // 約60FPS

        // キーイベントリスナーを設定
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            clearInterval(moveInterval);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [keys, speed, movePlayer, handleKeyDown, handleKeyUp]);

    return {position, setPosition};
}